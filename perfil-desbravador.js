const urlParams = new URLSearchParams(window.location.search);
const desbravadorId = urlParams.get('id');

const nomeEl = document.getElementById('nomeDesbravador');
const dataNascimentoEl = document.getElementById('dataNascimento');
const contatoEl = document.getElementById('contato');
const unidadeEl = document.getElementById('unidade');
const classeEl = document.getElementById('classe');
const classesConcluidasEl = document.getElementById('classesConcluidas');
const especialidadesEl = document.getElementById('especialidades');
const fotoPerfilEl = document.getElementById('fotoPerfil');

let desbravadorAtual = null;

async function carregarPerfil() {
  const { data: desbravador, error } = await supabase
    .from('desbravador')
    .select('*, unidade(nome), classe(nome)')
    .eq('id', desbravadorId)
    .single();

  if (error || !desbravador) {
    Swal.fire("Erro", "Desbravador não encontrado.", "error");
    return;
  }

  desbravadorAtual = desbravador;

  nomeEl.textContent = desbravador.nome;
  dataNascimentoEl.textContent = desbravador.data_nascimento || "-";
  contatoEl.textContent = desbravador.contato || "-";
  unidadeEl.textContent = desbravador.unidade?.nome || "-";
  classeEl.textContent = desbravador.classe?.nome || "-";

  if (desbravador.foto_url) {
    fotoPerfilEl.src = desbravador.foto_url;
  }

  await carregarClassesConcluidas();
  await carregarEspecialidades();
}

async function carregarClassesConcluidas() {
  const { data, error } = await supabase
    .from('desbravador_classe')
    .select('classe(nome), data_conclusao')
    .eq('desbravador_id', desbravadorId);

  if (error) return console.error(error);

  classesConcluidasEl.innerHTML = '';
  data.forEach(item => {
    classesConcluidasEl.innerHTML += `<li>${item.classe.nome} (${item.data_conclusao || 'Sem data'})</li>`;
  });
}

async function carregarEspecialidades() {
  const { data, error } = await supabase
    .from('desbravador_especialidade')
    .select('especialidade:especialidade_id(nome)')
    .eq('desbravador_id', desbravadorId);

  if (error) return console.error(error);

  especialidadesEl.innerHTML = '';
  data.forEach(item => {
    especialidadesEl.innerHTML += `<li>${item.especialidade.nome}</li>`;
  });
}

async function editarPerfil() {
  const { data: unidades } = await supabase.from('unidade').select('*');
  const { data: classes } = await supabase.from('classe').select('*');

  const unidadeOptions = unidades.map(u => `<option value="${u.id}" ${u.id === desbravadorAtual.unidade_id ? 'selected' : ''}>${u.nome}</option>`).join('');
  const classeOptions = classes.map(c => `<option value="${c.id}" ${c.id === desbravadorAtual.classe_id ? 'selected' : ''}>${c.nome}</option>`).join('');

  const { value: formValues } = await Swal.fire({
    title: 'Editar Perfil',
    html:
      `<input id="swal-nome" class="swal2-input" placeholder="Nome" value="${desbravadorAtual.nome}">
      <input id="swal-nasc" type="date" class="swal2-input" value="${desbravadorAtual.data_nascimento || ''}">
      <input id="swal-contato" class="swal2-input" placeholder="Contato" value="${desbravadorAtual.contato || ''}">
      <select id="swal-unidade" class="swal2-input">${unidadeOptions}</select>
      <select id="swal-classe" class="swal2-input">${classeOptions}</select>`,
    focusConfirm: false,
    showCancelButton: true,
    preConfirm: () => {
      return {
        nome: document.getElementById('swal-nome').value,
        nasc: document.getElementById('swal-nasc').value,
        contato: document.getElementById('swal-contato').value,
        unidade: document.getElementById('swal-unidade').value,
        classe: document.getElementById('swal-classe').value
      }
    }
  });

  if (!formValues) return;

  const { error } = await supabase
    .from('desbravador')
    .update({
      nome: formValues.nome,
      data_nascimento: formValues.nasc,
      contato: formValues.contato,
      unidade_id: formValues.unidade,
      classe_id: formValues.classe
    })
    .eq('id', desbravadorId);

  if (error) {
    Swal.fire("Erro", error.message, "error");
  } else {
    Swal.fire("Sucesso", "Perfil atualizado!", "success");
    carregarPerfil();
  }
}

async function gerenciarEspecialidades() {
  const { data: especialidades } = await supabase.from('especialidades').select('*');
  const { data: atuais } = await supabase.from('desbravador_especialidade').select('especialidade_id').eq('desbravador_id', desbravadorId);

  const atuaisIds = atuais.map(e => e.especialidade_id);

  const checkboxes = especialidades.map(e => {
    const checked = atuaisIds.includes(e.id) ? 'checked' : '';
    return `<label><input type="checkbox" value="${e.id}" ${checked}> ${e.nome}</label>`;
  }).join('<br>');

  const { value: formConfirm } = await Swal.fire({
    title: 'Gerenciar Especialidades',
    html: `<div style="text-align:left;max-height:300px;overflow:auto">${checkboxes}</div>`,
    showCancelButton: true,
    preConfirm: () => {
      const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
      return selected;
    }
  });

  if (!formConfirm) return;

  // Remove todas as atuais
  await supabase.from('desbravador_especialidade').delete().eq('desbravador_id', desbravadorId);

  // Insere as novas
  for (let id of formConfirm) {
    await supabase.from('desbravador_especialidade').insert({
      desbravador_id: desbravadorId,
      especialidade_id: id
    });
  }

  Swal.fire("Sucesso", "Especialidades atualizadas!", "success");
  carregarEspecialidades();
}

async function gerenciarClasses() {
  const { data: classes } = await supabase.from('classe').select('*');
  const { data: concluídas } = await supabase.from('desbravador_classe').select('classe_id').eq('desbravador_id', desbravadorId);

  const concluídasIds = concluídas.map(c => c.classe_id);

  const options = classes.map(c => {
    const disabled = concluídasIds.includes(c.id) ? 'disabled' : '';
    return `<option value="${c.id}" ${disabled}>${c.nome}</option>`;
  }).join('');

  const { value: formValues } = await Swal.fire({
    title: 'Adicionar Classe Concluída',
    html:
      `<select id="swal-classe-conc" class="swal2-input">${options}</select>
      <input id="swal-data" type="date" class="swal2-input">`,
    showCancelButton: true,
    preConfirm: () => {
      return {
        classe: document.getElementById('swal-classe-conc').value,
        data: document.getElementById('swal-data').value
      };
    }
  });

  if (!formValues || !formValues.classe || !formValues.data) return;

  const { error } = await supabase.from('desbravador_classe').insert({
    desbravador_id: desbravadorId,
    classe_id: formValues.classe,
    data_conclusao: formValues.data
  });

  if (error) {
    Swal.fire("Erro", error.message, "error");
  } else {
    Swal.fire("Sucesso", "Classe adicionada!", "success");
    carregarClassesConcluidas();
  }
}

async function excluirDesbravador() {
  const confirm = await Swal.fire({
    title: "Tem certeza?",
    text: "Essa ação não pode ser desfeita!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sim, excluir!"
  });

  if (confirm.isConfirmed) {
    const { error } = await supabase.from('desbravador').delete().eq('id', desbravadorId);

    if (error) {
      Swal.fire("Erro", error.message, "error");
    } else {
      Swal.fire("Excluído!", "Desbravador removido.", "success").then(() => {
        window.location.href = "desbravador.html";
      });
    }
  }
}

async function enviarFoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileExt = file.name.split('.').pop();
  const fileName = `desbravador-${desbravadorId}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase
    .storage
    .from('fotos-desbravadores')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    Swal.fire("Erro ao enviar imagem", uploadError.message, "error");
    return;
  }

  const { data: publicUrlData } = supabase.storage.from('fotos-desbravadores').getPublicUrl(filePath);
  const foto_url = publicUrlData.publicUrl;

  const { error: updateError } = await supabase.from('desbravador').update({ foto_url }).eq('id', desbravadorId);

  if (updateError) {
    Swal.fire("Erro ao atualizar foto", updateError.message, "error");
    return;
  }

  fotoPerfilEl.src = foto_url;
  Swal.fire("Sucesso", "Foto atualizada!", "success");
}

carregarPerfil();