import { Header } from "@/components/layout/header";
import { DesligamentoForm } from "@/components/modules/desligamento/desligamento-form";
import { buscarEstagiáriosParaDesligamento } from "@/actions/desligamento";

interface PageProps {
  searchParams: { estagiarioId?: string };
}

export default async function DesligamentoPage({ searchParams }: PageProps) {
  const estagiarios = await buscarEstagiáriosParaDesligamento();

  return (
    <>
      <Header title="Desligamento" />
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <p className="text-sm text-slate-500">
          Registre o desligamento de um estagiário ativo. A vaga será liberada automaticamente.
        </p>
        <DesligamentoForm
          estagiarios={estagiarios}
          estagiarioIdInicial={searchParams.estagiarioId}
        />
      </div>
    </>
  );
}
