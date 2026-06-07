import { Header } from "@/components/layout/header";
import { RelatoriosUI } from "@/components/modules/relatorios/relatorios-ui";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const estagiarios = await prisma.estagiario.findMany({
    select: {
      id: true,
      nome: true,
      status: true,
      vaga: { select: { codigo: true } },
    },
    orderBy: { nome: "asc" },
  });

  const opts = estagiarios.map((e) => ({
    id: e.id,
    nome: e.nome,
    vagaCodigo: e.vaga.codigo,
    status: e.status,
  }));

  return (
    <>
      <Header title="Relatórios PDF" />
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <p className="text-slate-500 text-sm">
            Selecione o relatório desejado. O PDF será aberto em uma nova aba do navegador.
          </p>
        </div>
        <RelatoriosUI estagiarios={opts} />
      </div>
    </>
  );
}
