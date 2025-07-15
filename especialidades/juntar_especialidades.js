const fs = require('fs');

const ordemDesejada = [
  { arquivo: 'especialidades_adra.json', area: 'ADRA' },
  { arquivo: 'especialidades_artes_e_habilidades_manuais.json', area: 'Artes e Habilidades Manuais' },
  { arquivo: 'especialidades_atividades_agrícolas.json', area: 'Atividades Agrícolas' },
  { arquivo: 'especialidades_atividades_missionárias_e_comunitárias.json', area: 'Atividades Missionárias e Comunitárias' },
  { arquivo: 'especialidades_atividades_profissionais.json', area: 'Atividades Profissionais' },
  { arquivo: 'especialidades_atividades_recreativas.json', area: 'Atividades Recreativas' },
  { arquivo: 'especialidades_ciência_e_saúde.json', area: 'Ciência e Saúde' },
  { arquivo: 'especialidades_estudos_da_natureza.json', area: 'Estudos da Natureza' },
  { arquivo: 'especialidades_habilidades_domésticas.json', area: 'Habilidades Domésticas' },
  { arquivo: 'especialidades_mestrados.json', area: 'Mestrados' }
];

const especialidades = [];

for (const { arquivo, area } of ordemDesejada) {
  if (fs.existsSync(arquivo)) {
    const conteudo = JSON.parse(fs.readFileSync(arquivo, 'utf-8'));
    especialidades.push({
      area,
      lista: conteudo.lista || []
    });
  } else {
    console.warn(`⚠️ Arquivo não encontrado: ${arquivo}`);
  }
}

fs.writeFileSync('especialidades.json', JSON.stringify({ especialidades }, null, 2), 'utf-8');
console.log('✅ Arquivo "especialidades.json" gerado com a ordem correta!');