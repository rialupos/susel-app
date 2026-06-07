import { formatDateTime } from "@/lib/utils";
import { Activity } from "lucide-react";

interface HistoryItem {
  id: string;
  acao: string;
  detalhes: string | null;
  createdAt: Date;
  usuario: { nome: string };
  estagiario: { nome: string };
}

interface HistoryFeedProps {
  items: HistoryItem[];
}

export function HistoryFeed({ items }: HistoryFeedProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
        Nenhuma ação registrada ainda.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 px-4 py-3">
          <div className="mt-0.5 p-1.5 bg-slate-100 rounded-full">
            <Activity className="w-3 h-3 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-800">
              <span className="font-medium">{item.usuario.nome}</span>
              {" · "}
              <span className="text-primary font-medium">{item.acao}</span>
              {" em "}
              <span className="font-medium">{item.estagiario.nome}</span>
            </p>
            {item.detalhes && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{item.detalhes}</p>
            )}
          </div>
          <span className="text-xs text-slate-400 shrink-0">{formatDateTime(item.createdAt)}</span>
        </div>
      ))}
    </div>
  );
}
