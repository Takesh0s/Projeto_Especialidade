const fs = require('fs');
const supabase = require('./supabase'); // ✅ importa o client já configurado

const arquivo = 'especialidades_limpo.json';

async function inserirEspecialidades() {
  try {
    const dados = JSON.parse(fs.readFileSync(arquivo, 'utf-8'));

    for (const area of dados.especialidades) {
      for (const esp of area.lista) {
        console.log(`➡️ Inserindo: ${esp.nome}`);

        const { error } = await supabase
          .from('especialidades')
          .insert([{
            area: area.area,
            nome: esp.nome,
            descricao: esp.descricao || '',
            codigo: esp.codigo || '',
            nivel: esp.nivel || null,
            ano: esp.ano || null,
            requisitos: esp.requisitos || [],
            foto_url: esp.foto_url || ''
          }]);

        if (error) {
          console.error(`❌ Erro ao inserir ${esp.nome}:`, error.message);
        } else {
          console.log(`✅ Inserido: ${esp.nome}`);
        }
      }
    }

    console.log('🎉 Todas as especialidades foram inseridas!');
  } catch (err) {
    console.error('Erro ao ler ou inserir:', err.message);
  }
}

inserirEspecialidades();