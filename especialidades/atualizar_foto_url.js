const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://whbikqoslxlgdxawqoal.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYmlrcW9zbHhsZ2R4YXdxb2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5ODQ2NzEsImV4cCI6MjA2NjU2MDY3MX0.nI2hECPnxF-IxVNvwfURJhtHTxjBlLnXgSJId1l0di0'
);

(async () => {
  const { data, error } = await supabase.from('especialidades').select('id, nome');

  if (error) {
    console.error(error);
    return;
  }

  for (const esp of data) {
    const nomeImagem = esp.nome
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9]+/g, '_') // troca espaços e símbolos por _
      .replace(/^_|_$/g, ''); // remove underscores extras

    const url = `https://whbikqoslxlgdxawqoal.supabase.co/storage/v1/object/public/especialidades/${nomeImagem}.png`;

    const { error: updateError } = await supabase
      .from('especialidades')
      .update({ foto_url: url })
      .eq('id', esp.id);

    if (updateError) {
      console.error(`❌ Falha ao atualizar ${esp.nome}:`, updateError.message);
    } else {
      console.log(`🖼️ Atualizado: ${esp.nome}`);
    }
  }
})();