import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";
import { formatDate, secretariaLabel } from "@/lib/utils";

interface AlertItem {
  id: string;
  nome: string;
  vaga: { secretaria: string; codigo: string };
}

interface RenovacaoAlerta extends AlertItem {
  dataFim: Date;
}

interface ContratoAlerta extends AlertItem {
  dataLimiteContrato: Date;
}

interface AlertPanelProps {
  renovacoes: RenovacaoAlerta[];
  contratos: ContratoAlerta[];
}

export function AlertPanel({ renovacoes, contratos }: AlertPanelProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-alert-red" />
        <h3 className="font-semibold text-red-800">
          Alertas — {renovacoes.length + contratos.length} item(s) requerem atenção
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renovacoes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">
              Renovações vencendo em 30 dias ({renovacoes.length})
            </p>
            <ul className="space-y-1.5">
              {renovacoes.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-red-100">
                  <Link href={`/estagiarios/${e.id}`} className="font-medium text-slate-800 hover:text-primary truncate">
                    {e.nome}
                  </Link>
                  <div className="flex items-center gap-1 text-xs text-red-600 shrink-0 ml-2">
                    <Clock className="w-3 h-3" />
                    {formatDate(e.dataFim)}
                  </div>
                </li>
              ))}
              {renovacoes.length > 5 && (
                <li className="text-xs text-red-600 pl-1">+{renovacoes.length - 5} mais...</li>
              )}
            </ul>
          </div>
        )}

        {contratos.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">
              Contratos limite vencendo em 30 dias ({contratos.length})
            </p>
            <ul className="space-y-1.5">
              {contratos.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-orange-100">
                  <Link href={`/estagiarios/${e.id}`} className="font-medium text-slate-800 hover:text-primary truncate">
                    {e.nome}
                  </Link>
                  <div className="flex items-center gap-1 text-xs text-orange-600 shrink-0 ml-2">
                    <Clock className="w-3 h-3" />
                    {formatDate(e.dataLimiteContrato)}
                  </div>
                </li>
              ))}
              {contratos.length > 5 && (
                <li className="text-xs text-orange-600 pl-1">+{contratos.length - 5} mais...</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
