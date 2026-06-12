const fs = require('fs');

// ============================================================
// PROBLEMA 1: Botao Contratar nao aparecia (icone errado)
// ============================================================
let c1 = fs.readFileSync('components/modules/talentos/talentos-client.tsx', 'utf8');
// Verificar se o botao ja existe, se nao, adicionar
if (!c1.includes('Contratar')) {
  c1 = c1.replace(
    '                <div className="flex items-center gap-2">\n                  {t.curriculoNome && (',
    '                <div className="flex items-center gap-2">\n                  <Button size="sm" onClick={() => router.push(`/estagiarios/novo?nome=${encodeURIComponent(t.nome)}&instituicao=${encodeURIComponent(t.instituicaoEnsino)}&curso=${encodeURIComponent(t.area)}`)}>\n                    <UserCheck className="w-3.5 h-3.5" />\n                    Contratar\n                  </Button>\n                  {t.curriculoNome && ('
  );
  c1 = c1.replace(
    'import { Upload, FileText, Trash2, Loader2, UserPlus, Search } from "lucide-react";',
    'import { Upload, FileText, Trash2, Loader2, UserPlus, Search, UserCheck } from "lucide-react";'
  );
  fs.writeFileSync('components/modules/talentos/talentos-client.tsx', c1);
}
console.log('OK1 - Talentos verificado');

// ============================================================
// PROBLEMA 2: isSusel nao funciona - corrigir step-revisao
// ============================================================
let c2 = fs.readFileSync('components/modules/wizard/step-revisao.tsx', 'utf8');
c2 = c2.replace(
  '  const isSusel = (session?.user as any)?.perfil !== "GRANDE_AREA";',
  '  const perfil = (session?.user as any)?.perfil ?? "SUSEL";\n  const isSusel = perfil === "SUSEL" || perfil === "ADMIN" || !perfil;'
);
fs.writeFileSync('components/modules/wizard/step-revisao.tsx', c2);
console.log('OK2 - Revisao corrigido');

// ============================================================
// PROBLEMA 3: Vagas page filtrar por secretaria do perfil
// ============================================================
const vagasPage = `import { Header } from "@/components/layout/header";
import { VagasGrid } from "@/components/modules/vagas/vagas-grid";
import { buscarVagasPorSecretaria } from "@/actions/vagas";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function VagasPage() {
  const session = await getServerSession(authOptions);
  const perfil = (session?.user as any)?.perfil ?? "SUSEL";
  const secretaria = (session?.user as any)?.secretaria;

  const porSecretaria = await buscarVagasPorSecretaria();

  // Filtrar vagas para GRANDE_AREA: apenas sua secretaria + ESTAGIDATA + PCD
  const porSecretariaFiltrado = perfil === "GRANDE_AREA" && secretaria
    ? Object.fromEntries(
        Object.entries(porSecretaria).filter(([s]) =>
          s === secretaria || s === "ESTAGIDATA" || s === "PCD"
        )
      )
    : porSecretaria;

  const todasVagas = Object.values(porSecretariaFiltrado).flat();
  const total = todasVagas.length;
  const disponiveis = todasVagas.filter((v) => v.ativa).length;
  const emContratacao = todasVagas.filter((v) => v.estagiarios[0]?.status === "AGUARDANDO_CIDE" || v.estagiarios[0]?.status === "ENVIADO_CIDE").length;
  const ocupadas = todasVagas.filter((v) => v.estagiarios[0]?.status === "ATIVO").length;

  return (
    <>
      <Header title="Vagas" />
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-500">{total} vagas no total</span>
          <span className="text-green-600 font-medium">{disponiveis} disponiveis</span>
          <span className="text-slate-500">{emContratacao} em contratacao</span>
          <span className="text-red-500 font-medium">{ocupadas} ocupadas</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-4 text-xs mb-6 pb-4 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-green-50 border border-green-300 inline-block" />
              Disponivel
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-slate-100 border border-slate-300 inline-block" />
              Em contratacao
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-red-50 border border-red-300 inline-block" />
              Ocupada
            </span>
          </div>
          <VagasGrid porSecretaria={porSecretariaFiltrado} />
        </div>
      </div>
    </>
  );
}
`;
fs.writeFileSync('app/(dashboard)/vagas/page.tsx', vagasPage);
console.log('OK3 - Vagas page corrigido');

// ============================================================
// PROBLEMA 3b: Wizard step-vaga filtrar vagas por secretaria
// ============================================================
let c4 = fs.readFileSync('app/(dashboard)/estagiarios/novo/page.tsx', 'utf8');
console.log('Conteudo novo page:', c4.substring(0, 200));