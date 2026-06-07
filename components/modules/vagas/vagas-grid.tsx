import Link from "next/link";
import { secretariaLabel, formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, Clock } from "lucide-react";

type VagaComEstagiario = {
  id: string;
  codigo: string;
  secretaria: string;
  ativa: boolean;
  estagiarios: {
    id: string;
    nome: string;
    status: string;
    dataInicio: Date;
    dataFim: Date;
  }[];
};

interface VagasGridProps {
  porSecretaria: Record<string, VagaComEstagiario[]>;
}

const ORDEM_SECRETARIA = ["SEGEDAM", "SEGECEX", "PRESIDENCIA", "GABINETES", "ESTAGIDATA", "PCD"];

export function VagasGrid({ porSecretaria }: VagasGridProps) {
  const secretarias = ORDEM_SECRETARIA.filter((s) => porSecretaria[s]);

  return (
    <div className="space-y-8">
      {secretarias.map((secretaria) => {
        const vagas = porSecretaria[secretaria] ?? [];
        const disponiveis = vagas.filter((v) => v.ativa).length;
        const ocupadas = vagas.filter((v) => !v.ativa).length;

        return (
          <section key={secretaria}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-800">
                {secretariaLabel(secretaria)}
              </h3>
              <div className="flex gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> {disponiveis} disponíveis
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <XCircle className="w-3.5 h-3.5" /> {ocupadas} ocupadas
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
              {vagas.map((vaga) => {
                const estagiario = vaga.estagiarios[0];
                const aguardando = estagiario?.status === "AGUARDANDO_CIDE";

                return (
                  <Link
                    key={vaga.id}
                    href={`/vagas/${vaga.id}`}
                    title={
                      estagiario
                        ? `${estagiario.nome} — ${estagiario.status}`
                        : "Disponível"
                    }
                    className={`
                      group relative flex flex-col items-center justify-center
                      h-16 rounded-lg border text-xs font-mono font-medium transition-all
                      hover:scale-105 hover:shadow-md
                      ${
                        aguardando
                          ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                          : !vaga.ativa
                          ? "bg-slate-100 border-slate-300 text-slate-500 cursor-pointer"
                          : "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                      }
                    `}
                  >
                    <span className="text-[11px] leading-tight">{vaga.codigo}</span>
                    {!vaga.ativa && (
                      <span className="text-[9px] mt-0.5 opacity-70 truncate w-full text-center px-1">
                        {estagiario?.nome.split(" ")[0] ?? "Ocupada"}
                      </span>
                    )}
                    {aguardando && (
                      <Clock className="absolute top-1 right-1 w-2.5 h-2.5 text-yellow-500" />
                    )}
                    {vaga.ativa && (
                      <span className="text-[9px] mt-0.5 text-green-500">livre</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
