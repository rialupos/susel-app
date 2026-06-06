"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adicionarNaFila, removerDaFila } from "@/actions/fila-espera";
import { UserPlus, Trash2, Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface FilaEsperaItem {
  id: string;
  nome: string;
  contato?: string | null;
  observacoes?: string | null;
  posicao: number;
  createdAt: Date;
}

interface FilaEsperaSectionProps {
  vagaId: string;
  vagaCodigo: string;
  fila: FilaEsperaItem[];
  vagaDisponivel: boolean;
}

export function FilaEsperaSection({ vagaId, vagaCodigo, fila, vagaDisponivel }: FilaEsperaSectionProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removendo, setRemovendo] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [observacoes, setObservacoes] = useState("");

  async function handleAdicionar() {
    if (!nome.trim()) {
      toast.error("Informe o nome do candidato.");
      return;
    }
    setLoading(true);
    try {
      await adicionarNaFila(vagaId, { nome: nome.trim(), contato: contato.trim() || undefined, observacoes: observacoes.trim() || undefined });
      toast.success("Candidato adicionado à fila!");
      setNome("");
      setContato("");
      setObservacoes("");
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error("Erro ao adicionar à fila.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemover(id: string) {
    setRemovendo(id);
    try {
      await removerDaFila(id, vagaId);
      toast.success("Candidato removido da fila.");
      router.refresh();
    } catch {
      toast.error("Erro ao remover da fila.");
    } finally {
      setRemovendo(null);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Fila de Espera</h3>
          {fila.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {fila.length} aguardando
            </span>
          )}
        </div>
        <Button size="sm" variant="secondary" onClick={() => setShowForm(!showForm)}>
          <UserPlus className="w-3.5 h-3.5" />
          Adicionar
        </Button>
      </div>

      {/* Formulário de adição */}
      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">Novo candidato na fila</p>
          <input
            type="text"
            placeholder="Nome completo *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="text"
            placeholder="Contato (e-mail ou telefone)"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <textarea
            placeholder="Observações"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowForm(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleAdicionar} disabled={loading}>
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</> : "Confirmar"}
            </Button>
          </div>
        </div>
      )}

      {/* Lista da fila */}
      {fila.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          Nenhum candidato na fila de espera.
        </p>
      ) : (
        <div className="space-y-2">
          {fila.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                {item.posicao}º
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{item.nome}</p>
                {item.contato && (
                  <p className="text-xs text-slate-500">{item.contato}</p>
                )}
                {item.observacoes && (
                  <p className="text-xs text-slate-400 italic">{item.observacoes}</p>
                )}
              </div>
              {vagaDisponivel && item.posicao === 1 && (
                <a href={`/estagiarios/novo?vagaId=${vagaId}`}>
                  <Button size="sm" className="text-xs shrink-0">
                    Contratar
                  </Button>
                </a>
              )}
              <button
                onClick={() => handleRemover(item.id)}
                disabled={removendo === item.id}
                className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
              >
                {removendo === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {vagaDisponivel && fila.length > 0 && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          ⚠️ <strong>Vaga disponível!</strong> Há {fila.length} candidato{fila.length !== 1 ? "s" : ""} aguardando. O 1º da fila pode ser contratado.
        </div>
      )}
    </div>
  );
}
