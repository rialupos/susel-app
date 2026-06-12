const fs = require('fs');
let c = fs.readFileSync('components/modules/talentos/talentos-client.tsx', 'utf8');

// 1. Adicionar Link ao import do router
c = c.replace(
  'import { Upload, FileText, Trash2, Loader2, UserPlus, Search } from "lucide-react";',
  'import { Upload, FileText, Trash2, Loader2, UserPlus, Search, UserCheck } from "lucide-react";'
);

// 2. Adicionar botao Contratar ao lado do Ver PDF
c = c.replace(
  '                <div className="flex items-center gap-2">\n                  {t.curriculoNome && (\n                    <Button size="sm" variant="secondary" onClick={() => abrirPdf(t.id)}>\n                      <FileText className="w-3.5 h-3.5" />\n                      Ver PDF\n                    </Button>\n                  )}',
  '                <div className="flex items-center gap-2">\n                  <Button size="sm" onClick={() => router.push(`/estagiarios/novo?nome=${encodeURIComponent(t.nome)}&instituicao=${encodeURIComponent(t.instituicaoEnsino)}&curso=${encodeURIComponent(t.area)}`)}>\n                    <UserCheck className="w-3.5 h-3.5" />\n                    Contratar\n                  </Button>\n                  {t.curriculoNome && (\n                    <Button size="sm" variant="secondary" onClick={() => abrirPdf(t.id)}>\n                      <FileText className="w-3.5 h-3.5" />\n                      Ver PDF\n                    </Button>\n                  )}'
);

fs.writeFileSync('components/modules/talentos/talentos-client.tsx', c);
console.log('OK1');