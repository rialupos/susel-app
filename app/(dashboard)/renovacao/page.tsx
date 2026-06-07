import { Header } from "@/components/layout/header";
import { RenovacaoList } from "@/components/modules/renovacao/renovacao-list";
import { buscarEstagiáriosParaRenovação } from "@/actions/renovacao";
import { RefreshCw } from "lucide-react";

export default async function RenovacaoPage() {
  const estagiarios = await buscarEstagiáriosParaRenovação();

  const urgentes = estagiarios.filter((e) => e.diasParaFim <= 30).length;
  const sugeremDesligamento = estagiarios.filter((e) => e.sugerirDesligamento).length;

  return (
    <>
      <Header title="Renovação" alertCount={urgentes} />
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="flex items-center gap-6 text-sm">
          <p className="text-slate-500">
            Estagiários com contrato vencendo nos próximos 60 dias
          </p>
          {urgentes > 0 && (
            <span className="text-alert-red font-semibold">
              {urgentes} urgente(s) — menos de 30 dias
            </span>
          )}
          {sugeremDesligamento > 0 && (
            <span className="text-orange-600 font-semibold">
              {sugeremDesligamento} próximo(s) do limite — verificar desligamento
            </span>
          )}
        </div>

        {estagiarios.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
            <RefreshCw className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhuma renovação pendente</p>
            <p className="text-slate-400 text-sm mt-1">
              Não há estagiários com contrato vencendo nos próximos 60 dias.
            </p>
          </div>
        ) : (
          <RenovacaoList estagiarios={estagiarios} />
        )}
      </div>
    </>
  );
}
