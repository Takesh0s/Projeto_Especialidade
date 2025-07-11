const conselheiroSelect = document.getElementById('conselheiroSelect');
const associadosContainer = document.getElementById('associadosContainer');
const tabelaCorpo = document.querySelector('#tabelaUnidades tbody');
const adicionarAssociadoBtn = document.getElementById('adicionarAssociado');

supabase.auth.getSession().then(({ data }) => {
  if (!data.session) {
    window.location.href = 'index.html';
  }
});

function criarCampoAssociado(id = '') {
  const div = document.createElement('div');
  div.classList.add('associado-wrapper');

  const select = document.createElement('select');
  select.classList.add('associadoSelect');
  select.innerHTML = `<option value="">Selecione</option>`;
  div.appendChild(select);

  const btn = document.createElement('button');
  btn.textContent = '−';
  btn.classList.add('remover-associado');
  btn.onclick = () => div.remove();
  div.appendChild(btn);

  associadosContainer.appendChild(div);

  carregarOpcoesSelect(select);
}

function carregarOpcoesSelect(select) {
  supabase.from('desbravador').select('id, nome').then(({ data, error }) => {
    if (error) return console.error(error);
    select.innerHTML = `<option value="">Selecione</option>`;
    data.forEach(d => {
      const option = document.createElement('option');
      option.value = d.id;
      option.textContent = d.nome;
      select.appendChild(option);
    });
  });
}

function carregarConselheiros() {
  supabase.from('desbravador').select('id, nome').then(({ data, error }) => {
    if (error) return console.error(error);
    conselheiroSelect.innerHTML = '<option value="">Selecione</option>';
    data.forEach(d => {
      const option = document.createElement('option');
      option.value = d.id;
      option.textContent = d.nome;
      conselheiroSelect.appendChild(option);
    });
  });
}

function carregarUnidades() {
  supabase
    .from('unidade')
    .select('*, conselheiro:conselheiro_id (nome), associado1:associado1_id (nome), associado2:associado2_id (nome)')
    .then(({ data, error }) => {
      if (error) return console.error(error);
      tabelaCorpo.innerHTML = '';

      data.forEach(u => {
        const associados = [u.associado1?.nome, u.associado2?.nome]
          .filter(Boolean)
          .join(', ') || '-';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${u.nome}</td>
          <td>${u.conselheiro?.nome || '-'}</td>
          <td>${associados}</td>
          <td><button class="removerUnidadeBtn" data-id="${u.id}">🗑️</button></td>
        `;
        tabelaCorpo.appendChild(row);
      });

      document.querySelectorAll('.removerUnidadeBtn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          const confirm = await Swal.fire({
            title: 'Tem certeza?',
            text: 'Essa unidade será excluída.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
          });

          if (confirm.isConfirmed) {
            const { error } = await supabase.from('unidade').delete().eq('id', id);
            if (error) {
              Swal.fire('Erro', error.message, 'error');
            } else {
              Swal.fire('Sucesso', 'Unidade excluída.', 'success');
              carregarUnidades();
            }
          }
        });
      });
    });
}

document.getElementById('cadastrarUnidade').addEventListener('click', async () => {
  const nome = document.getElementById('nomeUnidade').value.trim();
  const conselheiro_id = conselheiroSelect.value;

  const associadoSelects = Array.from(document.querySelectorAll('.associadoSelect'))
    .map(select => select.value)
    .filter(v => v !== '');

  if (!nome || !conselheiro_id) {
    Swal.fire('Atenção', 'Preencha o nome e selecione pelo menos o conselheiro.', 'warning');
    return;
  }

  const associado1_id = associadoSelects[0] || null;
  const associado2_id = associadoSelects[1] || null;

  const { error } = await supabase.from('unidade').insert([{
    nome,
    conselheiro_id,
    associado1_id,
    associado2_id
  }]);

  if (error) {
    Swal.fire('Erro', error.message, 'error');
  } else {
    Swal.fire('Sucesso', 'Unidade cadastrada com sucesso.', 'success');
    document.getElementById('nomeUnidade').value = '';
    conselheiroSelect.value = '';
    associadosContainer.innerHTML = '';
    criarCampoAssociado();
    carregarUnidades();
  }
});

adicionarAssociadoBtn.addEventListener('click', () => criarCampoAssociado());

carregarConselheiros();
carregarUnidades();
criarCampoAssociado();