"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { confirmarRecesso } from "@/actions/recesso";
import { formatDate, secretariaLabel } from "@/lib/utils";
import { CheckCircle, Loader2, Clock } from "lucide-react";

type RecessoPendente = {
  id: string;
  numeroRecesso: number;
  dataInicioPeriodo: Date;
  dataFimPeriodo: Date;
  quantidadeDias: number;
  observacoes: string | null;
  estagiario: {
    id: string;
    nome: string;
    vaga: { codigo: string; secretaria: string };
  };
};

interface RecessosPendentesProps {
  recessos: RecessoPendente[];
}

export function RecessosPendentes({ recessos }: RecessosPendentesProps) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState<string | null>(null);

  async function handleConfirmar(recessoId: string, nome: string) {
    if (!confirm(`Confirmar o recesso de ${nome}?`)) return;
    setConfirmando(recessoId);
    try {
      await confirmarRecesso(recessoId);
      toast.success("Recesso confirmado com sucesso!");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao confirmar recesso.");
    } finally {
      setConfirmando(null);
    }
  }

  if (recessos.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
        Nenhum recesso pendente de confirmação.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <Clock className="w-4 h-4 text-amber-500" />
        <h3 className="font-semibold text-slate-800">Pendentes de Confirmação</h3>
        <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold rounded-full px-2 py-0.5">
          {recessos.length}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {recessos.map((r) => (
          <div key={r.id} className="px-5 py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-slate-800 text-sm">{r.estagiario.nome}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  Recesso {r.numeroRecesso}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {r.estagiario.vaga.codigo} · {secretariaLabel(r.estagiario.vaga.secretaria)}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {formatDate(r.dataInicioPeriodo)} → {formatDate(r.dataFimPeriodo)} ({r.quantidadeDias} dias)
              </p>
              {r.observacoes && (
                <p className="text-xs text-slate-400 mt-0.5 italic">{r.observacoes}</p>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => handleConfirmar(r.id, r.estagiario.nome)}
              disabled={confirmando === r.id}
            >
              {confirmando === r.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <><CheckCircle className="w-3.5 h-3.5" /> Confirmar</>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
