"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDate, formatCPF, secretariaLabel } from "@/lib/utils";
import { Copy, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { criarEstagiario, ativarEstagiario } from "@/actions/estagiarios";
import { useRouter } from "next/navigation";

interface WizardData {
  vagaId: string;
  vagaCodigo: string;
  secretaria: string;
  nome: string;
  cpf: string;
  nivel: string;
  curso: string;
  horario: string;
  instituicaoEnsino: string;
  tipoVaga: string;
  tipo: string;
  estagiarioSubstituidoNome?: string;
  dataInicio: string;
  dataFim: string;
  dataLimiteContrato: string;
  lotacao: string;
  unidadeGestora: string;
  secretariaInterna?: string;
  atividadesDesenvolvidas?: string;
  edocContratacao?: string;
  observacoes?: string;
  supervisorNome: string;
  supervisorCargo?: string;
  supervisorFormacao?: string;
  supervisorRamal?: string;
  supervisorEmail?: string;
}

interface StepRevisaoProps {
  data: WizardData;
  onBack: () => void;
}

function gerarEmailCide(data: WizardData): string {
  return `Assunto: Contratação de Estagiário – ${data.vagaCodigo} / ${secretariaLabel(data.secretaria)}

Prezados,

Solicitamos a contratação do(a) estudante ${data.nome} com a data prevista para início no dia xx/xx/xxxx.
e-mail do(a) supervisor(a): ${data.supervisorEmail ?? ""}

Segue em anexo o currículo e o formulário da solicitação.

Atenciosamente,
Supervisão de Seleção e Gestão de Estágios - SUSEL
Secretaria de Gestão de Pessoas - SEGEP
Tribunal de Contas do Distrito Federal - TCDF`;
}

function ResumoItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-500 w-40 shrink-0">{label}:</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );
}

export function StepRevisao({ data, onBack }: StepRevisaoProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [estagiarioId, setEstagiarioId] = useState<string | null>(null);
  const [ativando, setAtivando] = useState(false);
  const [emailText, setEmailText] = useState(gerarEmailCide(data));
  const [emailCopiado, setEmailCopiado] = useState(false);

  async function handleSalvar() {
    setLoading(true);
    try {
      const result = await criarEstagiario({
        ...data,
        cpf: data.cpf.replace(/\D/g, ""),
      });
      setEstagiarioId(result.id);
      toast.success("Estagiário cadastrado! Agora envie o e-mail ao CIDE.");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar cadastro.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAtivar() {
    if (!estagiarioId) return;
    setAtivando(true);
    try {
      await ativarEstagiario(estagiarioId);
      toast.success("Contratação finalizada! Estagiário ativado.");
      router.push(`/estagiarios/${estagiarioId}`);
    } catch (e) {
      toast.error("Erro ao ativar estagiário.");
      setAtivando(false);
    }
  }

  function copiarEmail() {
    navigator.clipboard.writeText(emailText);
    setEmailCopiado(true);
    toast.success("E-mail copiado para a área de transferência!");
    setTimeout(() => setEmailCopiado(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Revisão e Confirmação</h2>
        <p className="text-sm text-slate-500 mt-1">Confira os dados antes de confirmar o cadastro.</p>
      </div>

      {/* Resumo */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Estagiário</p>
        <ResumoItem label="Nome" value={data.nome} />
        <ResumoItem label="CPF" value={formatCPF(data.cpf)} />
        <ResumoItem label="Nível" value={data.nivel === "MEDIO" ? "Médio" : "Superior"} />
        <ResumoItem label="Curso" value={data.curso} />
        <ResumoItem label="Instituição" value={data.instituicaoEnsino} />
        <ResumoItem label="Horário" value={data.horario} />

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-2">Contrato</p>
        <ResumoItem label="Vaga" value={`${data.vagaCodigo} — ${secretariaLabel(data.secretaria)}`} />
        <ResumoItem label="Tipo de vaga" value={data.tipoVaga === "NOVA" ? "Nova" : "Substituição"} />
        <ResumoItem label="Início" value={formatDate(data.dataInicio)} />
        <ResumoItem label="Fim" value={formatDate(data.dataFim)} />
        <ResumoItem label="Limite" value={formatDate(data.dataLimiteContrato)} />

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-2">Supervisor</p>
        <ResumoItem label="Nome" value={data.supervisorNome} />
        <ResumoItem label="Cargo" value={data.supervisorCargo} />
      </div>

      {/* Botão salvar ou email */}
      {!estagiarioId ? (
        <div className="flex justify-between">
          <Button type="button" variant="secondary" onClick={onBack} disabled={loading}>
            ← Voltar
          </Button>
          <Button onClick={handleSalvar} disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
            ) : (
              "Confirmar Cadastro"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Cadastrado com sucesso!</span>
            </div>
            <p className="text-sm text-green-700">
              Status: <strong>AGUARDANDO CIDE</strong>. Envie o e-mail abaixo ao CIDE para processar a contratação.
            </p>
          </div>

          {/* Template de e-mail */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <span className="text-sm font-medium text-slate-700">Rascunho do E-mail para o CIDE</span>
              <Button size="sm" variant="secondary" onClick={copiarEmail}>
                {emailCopiado ? (
                  <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Copiado!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copiar E-mail</>
                )}
              </Button>
            </div>
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 text-xs font-mono text-slate-700 focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>

          {/* Aviso de anexos */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Lembre-se de anexar</strong> o currículo do(a) estagiário(a) e o formulário da solicitação antes de enviar o e-mail.
            </p>
          </div>

          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={() => router.push(`/estagiarios/${estagiarioId}`)}
            >
              Ver cadastro
            </Button>
            <Button onClick={handleAtivar} disabled={ativando}>
              {ativando ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Ativando...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Contratação enviada ao Agente Integrador</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
