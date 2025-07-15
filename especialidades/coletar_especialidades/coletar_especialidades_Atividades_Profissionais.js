const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const AREA_NOME = "Atividades Profissionais";
  const AREA_URL = "https://mda.wiki.br/Atividades_Profissionais/";

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(AREA_URL, { waitUntil: 'networkidle2' });

  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'))
      .filter(a => a.href.includes('/Especialidade_de_'))
      .map(a => ({ nome: a.innerText.trim(), url: a.href }));

    const uniqueLinks = Array.from(new Map(anchors.map(item => [item.url, item])).values());
    return uniqueLinks;
  });

  const lista = [];

  for (const { nome, url } of links) {
    console.log(`⏳ Coletando: ${nome}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const data = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText || '';
      const nome = h1.replace('Especialidade de ', '').trim();

      let areaSigla = "", codNumerico = "", nivel = "", ano = "";

      const linhas = Array.from(document.querySelectorAll('table tr'));
      for (const linha of linhas) {
        const titulo = linha.querySelector('th')?.innerText?.toLowerCase();
        const valor = linha.querySelector('td')?.innerText?.trim();

        if (!titulo || !valor) continue;

        if (titulo.includes('área')) areaSigla = valor;
        if (titulo.includes('código')) codNumerico = valor;
        if (titulo.includes('nível')) nivel = valor;
        if (titulo.includes('ano')) ano = valor;
      }

      const requisitosEl = Array.from(document.querySelectorAll('ol > li'));
      const requisitos = requisitosEl.map(li => {
        const sub = li.querySelectorAll('ol > li');
        if (sub.length > 0) {
          return {
            texto: li.childNodes[0]?.textContent?.trim(),
            subitens: Array.from(sub).map(sli => sli.innerText.trim())
          };
        } else {
          return li.innerText.trim();
        }
      });

      return {
        nome,
        codigo: `${areaSigla}-${codNumerico}`,
        nivel: parseInt(nivel) || 1,
        ano: parseInt(ano) || 2000,
        descricao: "",
        requisitos
      };
    });

    lista.push(data);
  }

  const jsonFinal = {
    area: AREA_NOME,
    lista
  };

  const nomeArquivo = `especialidades_${AREA_NOME.toLowerCase().replace(/\s+/g, '_')}.json`;
  fs.writeFileSync(nomeArquivo, JSON.stringify(jsonFinal, null, 2), 'utf-8');
  console.log(`✅ Arquivo salvo como ${nomeArquivo}`);

  await browser.close();
})();