import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { HistoryFeed } from "@/components/modules/dashboard/history-feed";

async function getAtividades() {
  return prisma.historicoAcao.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      usuario: { select: { nome: true } },
      estagiario: { select: { nome: true } },
    },
  });
}

export default async function AtividadesPage() {
  const historico = await getAtividades();

  return (
    <>
      <Header title="Historico de Atividades" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl">
          <p className="text-sm text-slate-500 mb-4">
            {historico.length} registro(s) encontrado(s)
          </p>
          <HistoryFeed items={historico} />
        </div>
      </div>
    </>
  );
}
