"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField, inputClass } from "@/components/ui/form-field";
import { formatDate, secretariaLabel } from "@/lib/utils";
import { registrarEnvioCide, registrarRetornoCide } from "@/actions/renovacao";
import { AlertTriangle, Clock, Send, CheckCircle, XCircle, Loader2, AlertOctagon } from "lucide-react";
import Link from "next/link";

type EstagiarioRenovacao = {
  id: string;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  dataLimiteContrato: Date;
  diasParaFim: number;
  proximoDoLimite: boolean;
  atingiu2Anos: boolean;
  sugerirDesligamento: boolean;
  vaga: { codigo: string; secretaria: string };
  ultimaRenovacao: {
    id: string;
    status: string;
    dataNovaFim: Date;
    enviadoCideEm: Date | null;
  } | null;
};

interface RenovacaoListProps {
  estagiarios: EstagiarioRenovacao[];
}

export function RenovacaoList({ estagiarios }: RenovacaoListProps) {
  const router = useRouter();
  const [dialogEnvio, setDialogEnvio] = useState<EstagiarioRenovacao | null>(null);
  const [dialogRetorno, setDialogRetorno] = useState<EstagiarioRenovacao | null>(null);
  const [novaDataFim, setNovaDataFim] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);

  if (estagiarios.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-sm">
        Nenhum estagiário com contrato vencendo nos próximos 60 dias.
      </div>
    );
  }

  async function handleEnviarCide() {
    if (!dialogEnvio || !novaDataFim) return toast.error("Informe a nova data de fim.");
    setLoading(true);
    try {
      await registrarEnvioCide({
        estagiarioId: dialogEnvio.id,
        dataNovaFim: novaDataFim,
        observacoes,
      });
      toast.success("Envio ao CIDE registrado com sucesso!");
      setDialogEnvio(null);
      setNovaDataFim("");
      setObservacoes("");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao registrar envio.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRetornoCide(aprovada: boolean) {
    if (!dialogRetorno?.ultimaRenovacao) return;
    setLoading(true);
    try {
      await registrarRetornoCide({
        renovacaoId: dialogRetorno.ultimaRenovacao.id,
        estagiarioId: dialogRetorno.id,
        aprovada,
        observacoes,
      });
      toast.success(aprovada ? "Renovação aprovada! Data de fim atualizada." : "Recusa registrada.");
      setDialogRetorno(null);
      setObservacoes("");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao registrar retorno.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Estagiário</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Vaga</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Fim do Contrato</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Situação</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {estagiarios.map((e) => {
              const urgente = e.diasParaFim <= 30;
              const aguardandoCide = e.ultimaRenovacao?.status === "AGUARDANDO_CIDE";

              return (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/estagiarios/${e.id}`} className="font-medium text-slate-800 hover:text-primary">
                      {e.nome}
                    </Link>
                    {e.sugerirDesligamento && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertOctagon className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600 font-medium">
                          {e.atingiu2Anos ? "2 anos atingidos — considere desligamento" : "Próximo do limite máximo"}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {e.vaga.codigo} · {secretariaLabel(e.vaga.secretaria)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={urgente ? "text-alert-red font-semibold" : "text-alert-yellow font-medium"}>
                      {formatDate(e.dataFim)}
                    </span>
                    <span className={`ml-1.5 text-xs ${urgente ? "text-alert-red" : "text-slate-400"}`}>
                      ({e.diasParaFim}d)
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {aguardandoCide ? (
                      <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit">
                        <Clock className="w-3 h-3" /> Aguardando CIDE
                      </span>
                    ) : e.ultimaRenovacao?.status === "APROVADA" ? (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full w-fit">
                        <CheckCircle className="w-3 h-3" /> Renovada até {formatDate(e.ultimaRenovacao.dataNovaFim)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-700">
                        <AlertTriangle className="w-3 h-3" /> Sem renovação enviada
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e.sugerirDesligamento ? (
                      <Link href={`/desligamento?estagiarioId=${e.id}`}>
                        <Button size="sm" variant="danger">Desligar</Button>
                      </Link>
                    ) : aguardandoCide ? (
                      <Button size="sm" variant="secondary" onClick={() => { setDialogRetorno(e); setObservacoes(""); }}>
                        <CheckCircle className="w-3.5 h-3.5" /> Registrar Retorno
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => { setDialogEnvio(e); setNovaDataFim(""); setObservacoes(""); }}>
                        <Send className="w-3.5 h-3.5" /> Enviar ao CIDE
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dialog — Envio ao CIDE */}
      <Dialog
        open={!!dialogEnvio}
        onClose={() => setDialogEnvio(null)}
        title={`Enviar renovação ao CIDE — ${dialogEnvio?.nome}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Contrato atual vence em <strong>{dialogEnvio ? formatDate(dialogEnvio.dataFim) : ""}</strong>.
            Informe a nova data proposta.
          </p>
          <FormField label="Nova data de fim do contrato" required>
            <input
              type="date"
              value={novaDataFim}
              onChange={(e) => setNovaDataFim(e.target.value)}
              min={dialogEnvio ? new Date(dialogEnvio.dataFim).toISOString().split("T")[0] : ""}
              className={inputClass}
            />
          </FormField>
          <FormField label="Observações">
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Observações opcionais..."
            />
          </FormField>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDialogEnvio(null)} disabled={loading}>Cancelar</Button>
            <Button onClick={handleEnviarCide} disabled={loading || !novaDataFim}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Registrar Envio</>}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Dialog — Retorno do CIDE */}
      <Dialog
        open={!!dialogRetorno}
        onClose={() => setDialogRetorno(null)}
        title={`Retorno do CIDE — ${dialogRetorno?.nome}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Nova data proposta: <strong>{dialogRetorno?.ultimaRenovacao ? formatDate(dialogRetorno.ultimaRenovacao.dataNovaFim) : ""}</strong>
          </p>
          <FormField label="Observações">
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Motivo (obrigatório em caso de recusa)..."
            />
          </FormField>
          <div className="flex justify-end gap-3">
            <Button variant="danger" onClick={() => handleRetornoCide(false)} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4" /> Recusada</>}
            </Button>
            <Button onClick={() => handleRetornoCide(true)} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Aprovada</>}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
