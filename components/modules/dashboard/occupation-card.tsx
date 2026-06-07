import { secretariaLabel } from "@/lib/utils";

interface OccupationCardProps {
  secretaria: string;
  autorizadas: number;
  ocupadas: number;
}

export function OccupationCard({ secretaria, autorizadas, ocupadas }: OccupationCardProps) {
  const pct = autorizadas > 0 ? Math.min((ocupadas / autorizadas) * 100, 100) : 0;
  const disponíveis = Math.max(autorizadas - ocupadas, 0);

  const barColor =
    pct >= 90 ? "bg-alert-red" : pct >= 70 ? "bg-alert-yellow" : "bg-green-500";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-slate-800 text-sm">{secretariaLabel(secretaria)}</h4>
        <span className="text-xs text-slate-500">
          {ocupadas}/{autorizadas}
        </span>
      </div>

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>{pct.toFixed(0)}% ocupado</span>
        <span className={disponíveis === 0 ? "text-alert-red font-medium" : "text-green-600"}>
          {disponíveis} disponível{disponíveis !== 1 ? "is" : ""}
        </span>
      </div>
    </div>
  );
}
