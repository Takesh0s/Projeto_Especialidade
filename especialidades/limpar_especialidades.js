const fs = require('fs');

function normalizarTexto(txt) {
  return txt?.toLowerCase().trim();
}

function removerRequisitosDuplicados(requisitos) {
  const vistos = new Set();
  const resultado = [];

  for (const req of requisitos) {
    const key = typeof req === 'string'
      ? normalizarTexto(req)
      : JSON.stringify({
          texto: normalizarTexto(req.texto),
          subitens: req.subitens?.map(normalizarTexto)
        });

    if (!vistos.has(key)) {
      vistos.add(key);
      resultado.push(req);
    }
  }

  return resultado;
}

function limparEspecialidades(json) {
  return {
    especialidades: json.especialidades.map(area => {
      const vistos = new Set();
      const listaLimpa = [];

      for (const esp of area.lista) {
        const chave = `${normalizarTexto(esp.nome)}|${normalizarTexto(esp.codigo)}`;
        if (!vistos.has(chave)) {
          vistos.add(chave);
          esp.requisitos = removerRequisitosDuplicados(esp.requisitos || []);
          listaLimpa.push(esp);
        }
      }

      return {
        area: area.area,
        lista: listaLimpa
      };
    })
  };
}

const entrada = 'especialidades.json';
const saida = 'especialidades_limpo.json';

const backupNome = `especialidades_backup_${Date.now()}.json`;
fs.copyFileSync(entrada, backupNome);
console.log(`✅ Backup criado: ${backupNome}`);

const original = JSON.parse(fs.readFileSync(entrada, 'utf-8'));
const limpo = limparEspecialidades(original);
fs.writeFileSync(saida, JSON.stringify(limpo, null, 2), 'utf-8');

console.log(`✅ Especialidades limpas e salvas em "${saida}"`);