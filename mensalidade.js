supabase.auth.getSession().then(({ data }) => {
  if (!data.session) {
    window.location.href = 'index.html';
  }
});

const desbravadorSelect = document.getElementById('desbravadorSelect');
const tabelaCorpo = document.querySelector('#tabelaMensalidades tbody');

async function carregarDesbravadores() {
  const { data, error } = await supabase.from('desbravador').select('*');
  if (error) {
    console.error(error);
    return;
  }
  desbravadorSelect.innerHTML = '<option value="">Selecione</option>';
  data.forEach(d => {
    desbravadorSelect.innerHTML += `<option value="${d.id}">${d.nome}</option>`;
  });
}

async function carregarMensalidades() {
  const { data, error } = await supabase.from('mensalidade')
    .select(`id, mes, ano, valor, status, anexo_url, desbravador:desbravador_id (nome)`);

  tabelaCorpo.innerHTML = '';
  if (data) {
    data.forEach(m => {
      const linha = `<tr>
        <td>${m.desbravador?.nome || '-'}</td>
        <td>${m.mes}</td>
        <td>${m.ano}</td>
        <td>R$ ${parseFloat(m.valor).toFixed(2)}</td>
        <td>${m.status === 'pago' ? 'Pago' : 'Em Aberto'}</td>
        <td>${m.anexo_url ? `<a href="${m.anexo_url}" target="_blank">Ver Anexo</a>` : '-'}</td>
      </tr>`;
      tabelaCorpo.innerHTML += linha;
    });
  }
}

document.getElementById('cadastrarMensalidade').addEventListener('click', async () => {
  const desbravador_id = desbravadorSelect.value;
  const mes = parseInt(document.getElementById('mes').value);
  const ano = parseInt(document.getElementById('ano').value);
  const valor = parseFloat(document.getElementById('valor').value);
  const status = document.getElementById('status').value;
  const file = document.getElementById('anexo').files[0];

  if (!desbravador_id || !mes || !ano || isNaN(valor) || !status) {
    Swal.fire('Atenção', 'Preencha todos os campos corretamente.', 'warning');
    return;
  }

  let anexo_url = null;

  if (file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `comprovante-${desbravador_id}-${mes}-${ano}.${fileExt}`;
    const filePath = `mensalidades/${fileName}`;

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

  const { error } = await supabase.from('mensalidade').insert([
    { desbravador_id, mes, ano, valor, status, anexo_url }
  ]);

  if (error) {
    Swal.fire('Erro', error.message, 'error');
  } else {
    Swal.fire('Sucesso', 'Mensalidade registrada.', 'success');
    document.getElementById('mes').value = '';
    document.getElementById('ano').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('status').value = 'pago';
    document.getElementById('anexo').value = '';
    carregarMensalidades();
  }
});

carregarDesbravadores();
carregarMensalidades();