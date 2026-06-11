"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { criarAvaliacao } from "@/actions/avaliacoes";
import { useRouter } from "next/navigation";
import { ClipboardList, Loader2, Copy, CheckCircle, ExternalLink } from "lucide-react";
import { GerarPdfButton } from "@/components/modules/avaliacoes/gerar-pdf-button";

interface Avaliacao {
  id: string;
  token: string;
  periodoAvaliado: string;
  notaFinal: number | null;
  preenchidoEm: Date | null;
  assiduidade: string | null;
  relacionamento: string | null;
  assimilacao: string | null;
  iniciativa: string | null;
  organizacao: string | null;
  desempenho: string | null;
  qualidade: string | null;
  conhecimentos: string | null;
  tomadaDecisao: string | null;
  seguranca: string | null;
  observacoes: string | null;
  createdAt: Date;
}

interface AvaliacoesSectionProps {
  estagiarioId: string;
  avaliacoes: Avaliacao[];
  estagiario: {
    nome: string;
    curso: string;
    supervisorNome: string;
    supervisorCargo?: string | null;
    unidadeGestora: string;
    dataInicio: Date;
  };
}

const INDICADORES = [
  { key: "assiduidade", label: "Assiduidade e pontualidade" },
  { key: "relacionamento", label: "Relacionamento" },
  { key: "assimilacao", label: "Assimilacao" },
  { key: "iniciativa", label: "Iniciativa" },
  { key: "organizacao", label: "Organizacao" },
  { key: "desempenho", label: "Desempenho" },
  { key: "qualidade", label: "Qualidade" },
  { key: "conhecimentos", label: "Conhecimentos" },
  { key: "tomadaDecisao", label: "Tomada de decisao" },
  { key: "seguranca", label: "Seguranca" },
];

const corNota = (nota: number) => {
  if (nota >= 8) return "text-green-600";
  if (nota >= 6) return "text-yellow-600";
  return "text-red-600";
};

const corConceito = (c: string | null) => {
  if (c === "O") return "bg-green-100 text-green-700";
  if (c === "B") return "bg-blue-100 text-blue-700";
  if (c === "M") return "bg-yellow-100 text-yellow-700";
  if (c === "R") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-500";
};

export function AvaliacoesSection({ estagiarioId, avaliacoes, estagiario }: AvaliacoesSectionProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState("");
  const [copiado, setCopiado] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  async function handleCriar() {
    if (!periodo.trim()) {
      toast.error("Informe o periodo avaliado.");
      return;
    }
    setLoading(true);
    try {
      await criarAvaliacao(estagiarioId, periodo.trim());
      toast.success("Avaliacao criada! Copie o link e envie ao supervisor.");
      setPeriodo("");
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error("Erro ao criar avaliacao.");
    } finally {
      setLoading(false);
    }
  }

  function copiarLink(token: string) {
    navigator.clipboard.writeText(`${baseUrl}/avaliar/${token}`);
    setCopiado(token);
    toast.success("Link copiado!");
    setTimeout(() => setCopiado(null), 3000);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Avaliacoes</h3>
          {avaliacoes.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {avaliacoes.length}
            </span>
          )}
        </div>
        <Button size="sm" variant="secondary" onClick={() => setShowForm(!showForm)}>
          <ClipboardList className="w-3.5 h-3.5" />
          Nova avaliacao
        </Button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">Nova avaliacao semestral</p>
          <input
            type="text"
            placeholder="Periodo avaliado (ex: 1 Semestre/2026)"
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowForm(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleCriar} disabled={loading}>
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Criando...</> : "Criar e gerar link"}
            </Button>
          </div>
        </div>
      )}

      {avaliacoes.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Nenhuma avaliacao registrada.</p>
      ) : (
        <div className="space-y-3">
          {avaliacoes.map(av => (
            <div key={av.id} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-800">{av.periodoAvaliado}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {av.preenchidoEm ? (
                      <span className="text-green-600 font-medium">Preenchida pelo supervisor</span>
                    ) : (
                      <span className="text-amber-600">Aguardando supervisor</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {av.notaFinal !== null && (
                    <span className={`text-sm font-bold ${corNota(av.notaFinal)}`}>
                      {av.notaFinal.toFixed(1)}
                    </span>
                  )}
                  {av.preenchidoEm && (
                    <GerarPdfButton
                      avaliacao={{
                        ...av,
                        estagiario,
                      }}
                    />
                  )}
                  {!av.preenchidoEm && (
                    <button
                      onClick={() => copiarLink(av.token)}
                      className="text-slate-400 hover:text-primary transition-colors"
                      title="Copiar link"
                    >
                      {copiado === av.token ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  {av.preenchidoEm && (
                    <button
                      onClick={() => setExpandido(expandido === av.id ? null : av.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      {expandido === av.id ? "Ocultar" : "Ver detalhes"}
                    </button>
                  )}
                </div>
              </div>

              {!av.preenchidoEm && (
                <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 truncate flex-1">
                    {baseUrl}/avaliar/{av.token}
                  </p>
                  <button
                    onClick={() => copiarLink(av.token)}
                    className="text-xs text-amber-700 font-medium hover:underline shrink-0"
                  >
                    Copiar
                  </button>
                </div>
              )}

              {expandido === av.id && av.preenchidoEm && (
                <div className="px-4 py-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {INDICADORES.map(ind => (
                      <div key={ind.key} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{ind.label}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${corConceito((av as any)[ind.key])}`}>
                          {(av as any)[ind.key] ?? "---"}
                        </span>
                      </div>
                    ))}
                  </div>
                  {av.observacoes && (
                    <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-2">
                      {av.observacoes}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Nota final</span>
                    <span className={`text-sm font-bold ${corNota(av.notaFinal ?? 0)}`}>
                      {av.notaFinal?.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}