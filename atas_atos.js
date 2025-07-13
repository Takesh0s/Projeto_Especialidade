supabase.auth.getSession().then(({ data }) => {
  if (!data.session) {
    window.location.href = 'index.html';
  }
});

const tabelaCorpo = document.querySelector('#tabelaRegistros tbody');

async function carregarRegistros() {
  const atas = await supabase.from('atas').select('*');
  const atos = await supabase.from('atos').select('*');

  tabelaCorpo.innerHTML = '';

  atas.data?.forEach(a => {
    tabelaCorpo.innerHTML += `<tr>
      <td>Ata</td>
      <td>${a.titulo}</td>
      <td>${a.data}</td>
      <td>${a.conteudo}</td>
      <td>${a.anexo_url ? `<a href="${a.anexo_url}" target="_blank">Ver Anexo</a>` : '-'}</td>
    </tr>`;
  });

  atos.data?.forEach(a => {
    tabelaCorpo.innerHTML += `<tr>
      <td>Ato</td>
      <td>${a.titulo}</td>
      <td>${a.data}</td>
      <td>${a.conteudo}</td>
      <td>${a.anexo_url ? `<a href="${a.anexo_url}" target="_blank">Ver Anexo</a>` : '-'}</td>
    </tr>`;
  });
}

document.getElementById('registrar').addEventListener('click', async () => {
  const titulo = document.getElementById('titulo').value;
  const conteudo = document.getElementById('conteudo').value;
  const tipo = document.getElementById('tipoRegistro').value;
  const file = document.getElementById('anexoAtas').files[0];

  if (!titulo || !conteudo || !tipo) {
    Swal.fire('Atenção', 'Preencha todos os campos.', 'warning');
    return;
  }

  let anexo_url = null;

  if (file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `anexo-${tipo}-${Date.now()}.${fileExt}`;
    const filePath = `atas_ou_atos/${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('anexos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      Swal.fire('Erro', uploadError.message, 'error');
      return;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('anexos')
      .getPublicUrl(filePath);

    anexo_url = publicUrlData.publicUrl;
  }

  const tabela = tipo === 'ata' ? 'atas' : 'atos';
  const { error } = await supabase.from(tabela).insert([
    { titulo, conteudo, anexo_url }
  ]);

  if (error) {
    Swal.fire('Erro', error.message, 'error');
  } else {
    Swal.fire('Sucesso', 'Registro salvo.', 'success');
    document.getElementById('titulo').value = '';
    document.getElementById('conteudo').value = '';
    document.getElementById('tipoRegistro').value = '';
    document.getElementById('anexoAtas').value = '';
    carregarRegistros();
  }
});

carregarRegistros();