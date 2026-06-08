import { Header } from "@/components/layout/header";
import { VagasGrid } from "@/components/modules/vagas/vagas-grid";
import { buscarVagasPorSecretaria } from "@/actions/vagas";

export default async function VagasPage() {
  const porSecretaria = await buscarVagasPorSecretaria();
  const todasVagas = Object.values(porSecretaria).flat();
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
          <VagasGrid porSecretaria={porSecretaria} />
        </div>
      </div>
    </>
  );
}