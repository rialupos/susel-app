import { Header } from "@/components/layout/header";
import { VagasGrid } from "@/components/modules/vagas/vagas-grid";
import { buscarVagasPorSecretaria } from "@/actions/vagas";

export default async function VagasPage() {
  const porSecretaria = await buscarVagasPorSecretaria();

  const total = Object.values(porSecretaria).flat().length;
  const disponiveis = Object.values(porSecretaria).flat().filter((v) => v.ativa).length;

  return (
    <>
      <Header title="Vagas" />
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-500">{total} vagas no total</span>
          <span className="text-green-600 font-medium">{disponiveis} disponíveis</span>
          <span className="text-slate-500">{total - disponiveis} ocupadas</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-4 text-xs mb-6 pb-4 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-green-100 border border-green-300 inline-block" />
              Disponível
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-slate-100 border border-slate-300 inline-block" />
              Ocupada
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-yellow-50 border border-yellow-300 inline-block" />
              Aguardando CIDE
            </span>
          </div>

          <VagasGrid porSecretaria={porSecretaria} />
        </div>
      </div>
    </>
  );
}
