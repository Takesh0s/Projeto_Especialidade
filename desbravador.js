const unidadeSelect = document.getElementById('unidadeSelect');
const classeSelect = document.getElementById('classeSelect');
const especialidadesLista = document.getElementById('especialidadesLista');
const tabelaCorpo = document.querySelector('#tabelaDesbravadores tbody');

async function carregarUnidades() {
  const { data, error } = await supabase.from('unidade').select('*');
  if (error) return console.error(error);
  unidadeSelect.innerHTML = '<option value="">Selecione</option>';
  data.forEach(u => unidadeSelect.innerHTML += `<option value="${u.id}">${u.nome}</option>`);
}

async function carregarClasses() {
  const { data, error } = await supabase.from('classe').select('*');
  if (error) return console.error(error);
  classeSelect.innerHTML = '<option value="">Selecione</option>';
  data.forEach(c => classeSelect.innerHTML += `<option value="${c.id}">${c.nome}</option>`);
}

async function carregarEspecialidades() {
  const { data, error } = await supabase.from('especialidades').select('*');
  if (error) return console.error(error);
  especialidadesLista.innerHTML = '';
  data.forEach(e => {
    especialidadesLista.innerHTML += `
      <label>
        <input type="checkbox" value="${e.id}"> ${e.nome}
      </label><br>`;
  });
}

async function listarDesbravadores() {
  const { data, error } = await supabase
    .from('desbravador')
    .select('*, unidade(nome), classe(nome)')
    .order('nome');

  if (error) return console.error(error);
  tabelaCorpo.innerHTML = '';
  data.forEach(d => {
    tabelaCorpo.innerHTML += `
      <tr>
        <td>${d.nome}</td>
        <td>${d.data_nascimento || '-'}</td>
        <td>${d.contato || '-'}</td>
        <td>${d.unidade?.nome || '-'}</td>
        <td>${d.classe?.nome || '-'}</td>
        <td>
        <button onclick="verPerfil('${d.id}')">👤 Ver Perfil</button>
        </td>
      </tr>`;
  });
}

document.getElementById('cadastrarDesbravador').addEventListener('click', async () => {
  const nome = document.getElementById('nome').value.trim();
  const data_nascimento = document.getElementById('dataNascimento').value;
  const contato = document.getElementById('contato').value.trim();
  const unidade_id = unidadeSelect.value;
  const classe_id = classeSelect.value;

  if (!nome || !unidade_id || !classe_id) {
    Swal.fire('Atenção', 'Preencha nome, unidade e classe.', 'warning');
    return;
  }

  const { data, error } = await supabase
    .from('desbravador')
    .insert([{ nome, data_nascimento, contato, unidade_id, classe_id }])
    .select().single();

  if (error) {
    Swal.fire('Erro', error.message, 'error');
    return;
  }

  const checkboxes = document.querySelectorAll('#especialidadesLista input:checked');
  for (let c of checkboxes) {
    await supabase.from('desbravador_especialidade').insert({
      desbravador_id: data.id,
      especialidade_id: c.value
    });
  }

  Swal.fire('Sucesso', 'Desbravador cadastrado.', 'success');
  document.getElementById('nome').value = '';
  document.getElementById('dataNascimento').value = '';
  document.getElementById('contato').value = '';
  unidadeSelect.value = '';
  classeSelect.value = '';
  checkboxes.forEach(c => c.checked = false);
  listarDesbravadores();
});

carregarUnidades();
carregarClasses();
carregarEspecialidades();
listarDesbravadores();

function verPerfil(id) {
  window.location.href = `perfil-desbravador.html?id=${id}`;
}