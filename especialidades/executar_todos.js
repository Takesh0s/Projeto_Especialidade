const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pasta = './coletar_especialidades';

const arquivos = fs.readdirSync(pasta).filter(file => file.endsWith('.js'));

for (const arquivo of arquivos) {
  const caminhoCompleto = path.join(pasta, arquivo);
  console.log(`\n🚀 Executando: ${arquivo}`);
  try {
    execSync(`node "${caminhoCompleto}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Erro ao executar ${arquivo}:\n`, err.message);
  }
}