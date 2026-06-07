"use client";

import { useState } from "react";
import { secretariaLabel } from "@/lib/utils";
import { CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type VagaDisponivel = { id: string; codigo: string; secretaria: string };

interface StepVagaProps {
  vagas: VagaDisponivel[];
  vagaIdInicial?: string;
  onNext: (vagaId: string, secretaria: string) => void;
}

const SECRETARIAS = ["SEGEDAM", "SEGECEX", "PRESIDENCIA", "GABINETES", "ESTAGIDATA", "PCD"];

export function StepVaga({ vagas, vagaIdInicial, onNext }: StepVagaProps) {
  const [selecionada, setSelecionada] = useState<VagaDisponivel | null>(
    vagas.find((v) => v.id === vagaIdInicial) ?? null
  );
  const [filtroSecretaria, setFiltroSecretaria] = useState("");
  const [busca, setBusca] = useState("");

  const vagasFiltradas = vagas.filter((v) => {
    if (filtroSecretaria && v.secretaria !== filtroSecretaria) return false;
    if (busca && !v.codigo.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Selecionar Vaga</h2>
        <p className="text-sm text-slate-500 mt-1">
          {vagas.length} vaga(s) disponível(is). Clique em uma vaga para selecioná-la.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar código da vaga..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={filtroSecretaria}
          onChange={(e) => setFiltroSecretaria(e.target.value)}
          className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todas as secretarias</option>
          {SECRETARIAS.map((s) => (
            <option key={s} value={s}>{secretariaLabel(s)}</option>
          ))}
        </select>
      </div>

      {/* Seleção atual */}
      {selecionada && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <CheckCircle className="w-5 h-5 text-primary shrink-0" />
          <div>
            <span className="font-mono font-bold text-primary">{selecionada.codigo}</span>
            <span className="text-sm text-slate-600 ml-2">— {secretariaLabel(selecionada.secretaria)}</span>
          </div>
        </div>
      )}

      {/* Grid de vagas */}
      <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl p-4">
        {vagasFiltradas.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Nenhuma vaga encontrada.</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {vagasFiltradas.map((vaga) => (
              <button
                key={vaga.id}
                onClick={() => setSelecionada(vaga)}
                className={`
                  h-14 rounded-lg border text-xs font-mono font-medium transition-all
                  hover:scale-105
                  ${
                    selecionada?.id === vaga.id
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                  }
                `}
              >
                {vaga.codigo}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!selecionada}
          onClick={() => selecionada && onNext(selecionada.id, selecionada.secretaria)}
        >
          Próximo: Dados do Estagiário →
        </Button>
      </div>
    </div>
  );
}
