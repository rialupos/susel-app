import { formatDateTime } from "@/lib/utils";
import { Activity, CheckCircle, UserMinus, RefreshCw, Palmtree, Edit } from "lucide-react";

const acaoIcones: Record<string, React.ElementType> = {
  CADASTRO: Edit,
  ATIVACAO: CheckCircle,
  DESLIGAMENTO: UserMinus,
  RENOVACAO: RefreshCw,
  RECESSO: Palmtree,
};

const acaoCores: Record<string, string> = {
  CADASTRO: "bg-blue-100 text-blue-600",
  ATIVACAO: "bg-green-100 text-green-600",
  DESLIGAMENTO: "bg-red-100 text-red-600",
  RENOVACAO: "bg-yellow-100 text-yellow-600",
  RECESSO: "bg-purple-100 text-purple-600",
};

interface HistoricoItem {
  id: string;
  acao: string;
  detalhes: string | null;
  createdAt: Date;
  usuario: { nome: string };
}

export function HistoricoTimeline({ items }: { items: HistoricoItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4">Sem histórico registrado.</p>
    );
  }

  return (
    <ol className="relative border-l border-slate-200 space-y-4 ml-3">
      {items.map((item) => {
        const Icon = acaoIcones[item.acao] ?? Activity;
        const cor = acaoCores[item.acao] ?? "bg-slate-100 text-slate-600";

        return (
          <li key={item.id} className="ml-6">
            <span
              className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ${cor}`}
            >
              <Icon className="w-3 h-3" />
            </span>
            <div className="bg-white border border-slate-100 rounded-lg px-4 py-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800">{item.acao}</span>
                <time className="text-xs text-slate-400">{formatDateTime(item.createdAt)}</time>
              </div>
              {item.detalhes && (
                <p className="text-xs text-slate-500 mt-0.5">{item.detalhes}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">por {item.usuario.nome}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
