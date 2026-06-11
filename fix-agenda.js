const fs = require('fs');

const c = fs.readFileSync('components/modules/dashboard/agenda-dia.tsx', 'utf8');

// 1. Adicionar vaga na interface
let novo = c.replace(
  'interface EstagiarioAlerta {\n  id: string;\n  nome: string;\n  dataInicio: Date;',
  'interface EstagiarioAlerta {\n  id: string;\n  nome: string;\n  vaga?: { codigo: string; secretaria: string };\n  dataInicio: Date;'
);

// 2. Adicionar declaracao do array inicios
novo = novo.replace(
  '  const recessos: { id: string; nome: string }[] = [];',
  '  const recessos: { id: string; nome: string }[] = [];\n  const inicios: { id: string; nome: string; vaga: string }[] = [];'
);

// 3. Corrigir return
novo = novo.replace(
  'return { renovacoes, avaliacoes, recessos };',
  'return { renovacoes, avaliacoes, recessos, inicios };'
);

// 4. Corrigir destructuring e total
novo = novo.replace(
  'const { renovacoes, avaliacoes, recessos } = calcularAlertas(estagiarios, data);\n  const total = renovacoes.length + avaliacoes.length + recessos.length;',
  'const { renovacoes, avaliacoes, recessos, inicios } = calcularAlertas(estagiarios, data);\n  const total = renovacoes.length + avaliacoes.length + recessos.length + inicios.length;'
);

fs.writeFileSync('components/modules/dashboard/agenda-dia.tsx', novo);
console.log('OK');