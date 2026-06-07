import Link from "next/link";
import { formatDate, formatCPF, secretariaLabel } from "@/lib/utils";
import { StatusBadge, TipoBadge } from "./status-badge";
import { ExternalLink } from "lucide-react";

type Estagiario = {
  id: string;
  nome: string;
  cpf: string;
  nivel: string;
  curso: string;
  tipo: string;
  status: string;
  dataFim: Date;
  dataLimiteContrato: Date;
  vaga: { codigo: string; secretaria: string };
};

interface EstagiarioTableProps {
  estagiarios: Estagiario[];
}

export function EstagiarioTable({ estagiarios }: EstagiarioTableProps) {
  if (estagiarios.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
        Nenhum estagiário encontrado com os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">CPF</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Vaga</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Secretaria</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Nível</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Fim do Contrato</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {estagiarios.map((e) => {
              const hoje = new Date();
              const diasParaFim = Math.ceil(
                (new Date(e.dataFim).getTime() - hoje.getTime()) / 86400000
              );
              const alertaFim = diasParaFim <= 30 && e.status === "ATIVO";

              return (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{e.nome}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                    {formatCPF(e.cpf)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {e.vaga.codigo}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {secretariaLabel(e.vaga.secretaria)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {e.nivel === "MEDIO" ? "Médio" : "Superior"}
                  </td>
                  <td className="px-4 py-3">
                    <TipoBadge tipo={e.tipo} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={alertaFim ? "text-alert-red font-medium" : "text-slate-600"}>
                      {formatDate(e.dataFim)}
                      {alertaFim && (
                        <span className="ml-1 text-xs">({diasParaFim}d)</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/estagiarios/${e.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary-light text-xs font-medium"
                    >
                      Ver <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
        {estagiarios.length} registro(s) encontrado(s)
      </div>
    </div>
  );
}
