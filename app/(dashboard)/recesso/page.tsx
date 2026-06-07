import { Header } from "@/components/layout/header";
import { RecessoForm } from "@/components/modules/recesso/recesso-form";
import { RecessosPendentes } from "@/components/modules/recesso/recessos-pendentes";
import { buscarEstagiáriosAtivos, buscarRecessosPendentes } from "@/actions/recesso";

interface PageProps {
  searchParams: { estagiarioId?: string };
}

export default async function RecessoPage({ searchParams }: PageProps) {
  const [estagiarios, pendentes] = await Promise.all([
    buscarEstagiáriosAtivos(),
    buscarRecessosPendentes(),
  ]);

  return (
    <>
      <Header title="Recesso" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <p className="text-sm text-slate-500">
          Gerencie os recessos dos estagiários. Recesso 1 exige 1 ano de contrato; Recesso 2 exige 2 anos e o Recesso 1 confirmado.
        </p>

        {/* Pendentes no topo */}
        {pendentes.length > 0 && (
          <RecessosPendentes recessos={pendentes} />
        )}

        {/* Formulário de novo recesso */}
        <div>
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
            Registrar Novo Recesso
          </h3>
          <RecessoForm
            estagiarios={estagiarios}
            estagiarioIdInicial={searchParams.estagiarioId}
          />
        </div>
      </div>
    </>
  );
}
