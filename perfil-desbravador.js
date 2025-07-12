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
    const { error } = await supabase
      .from('desbravador')
      .delete()
      .eq('id', desbravadorId);

    if (error) {
      Swal.fire("Erro", error.message, "error");
    } else {
      Swal.fire("Excluído!", "Desbravador foi removido.", "success").then(() => {
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

  const { data: publicUrlData } = supabase
    .storage
    .from('fotos-desbravadores')
    .getPublicUrl(filePath);

  const foto_url = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from('desbravador')
    .update({ foto_url })
    .eq('id', desbravadorId);

  if (updateError) {
    Swal.fire("Erro ao atualizar foto", updateError.message, "error");
    return;
  }

  fotoPerfilEl.src = foto_url;
  Swal.fire("Sucesso", "Foto atualizada com sucesso!", "success");
}

function editarPerfil() {
  Swal.fire("Em breve", "Funcionalidade de edição será adicionada.", "info");
}

function gerenciarEspecialidades() {
  Swal.fire("Em breve", "Funcionalidade para gerenciar especialidades será adicionada.", "info");
}

function gerenciarClasses() {
  Swal.fire("Em breve", "Funcionalidade para gerenciar classes será adicionada.", "info");
}

carregarPerfil();