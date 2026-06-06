"use client";

import { useState, useEffect } from "react";
import { buscarAvaliacaoPorToken, preencherAvaliacao } from "@/actions/avaliacoes";
import { formatDate } from "@/lib/utils";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const INDICADORES = [
  { key: "assiduidade", label: "1 - Assiduidade e pontualidade", definicao: "Cumpre os horários determinados pela supervisão e justifica as ausências?" },
  { key: "relacionamento", label: "2 - Relacionamento", definicao: "Participa e colabora nas atividades de grupo? Interage bem com os colegas e superiores?" },
  { key: "assimilacao", label: "3 - Assimilação", definicao: "Apresenta facilidade em aprender e pôr em prática aquilo que lhe é ensinado?" },
  { key: "iniciativa", label: "4 - Iniciativa", definicao: "Capacidade de buscar e propor soluções alternativas no desenvolvimento dos trabalhos?" },
  { key: "organizacao", label: "5 - Organização", definicao: "Planeja suas atividades de forma a cumprir seu plano de trabalho dentro de uma sequência de prioridades?" },
  { key: "desempenho", label: "6 - Desempenho", definicao: "Atende adequadamente a demanda de tarefas, dentro dos prazos estabelecidos?" },
  { key: "qualidade", label: "7 - Qualidade", definicao: "Capacidade de produzir trabalho sem erro, com cuidado e precisão?" },
  { key: "conhecimentos", label: "8 - Conhecimentos", definicao: "Demonstra possuir conhecimentos teóricos necessários à execução das tarefas?" },
  { key: "tomadaDecisao", label: "9 - Tomada de decisão", definicao: "Apresenta bom grau de autonomia, segurança, ponderação e adequação nas decisões tomadas sobre atividades de estágio." },
  { key: "seguranca", label: "10 - Segurança", definicao: "Acata o programa de segurança da empresa?" },
];

const OPCOES = [
  { value: "O", label: "Ótimo", cor: "bg-green-100 border-green-400 text-green-800" },
  { value: "B", label: "Bom", cor: "bg-blue-100 border-blue-400 text-blue-800" },
  { value: "M", label: "Mediano", cor: "bg-yellow-100 border-yellow-400 text-yellow-800" },
  { value: "R", label: "Ruim", cor: "bg-red-100 border-red-400 text-red-800" },
];

type AvaliacaoData = Awaited<ReturnType<typeof buscarAvaliacaoPorToken>>;

export default function AvaliarPage({ params }: { params: { token: string } }) {
  const [avaliacao, setAvaliacao] = useState<AvaliacaoData>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    buscarAvaliacaoPorToken(params.token).then(data => {
      setAvaliacao(data);
      setLoading(false);
    });
  }, [params.token]);

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleEnviar() {
    const faltando = INDICADORES.filter(i => !form[i.key]);
    if (faltando.length > 0) {
      toast.error(`Preencha todos os indicadores antes de enviar.`);
      return;
    }
    setEnviando(true);
    try {
      await preencherAvaliacao(params.token, {
        assiduidade: form.assiduidade,
        relacionamento: form.relacionamento,
        assimilacao: form.assimilacao,
        iniciativa: form.iniciativa,
        organizacao: form.organizacao,
        desempenho: form.desempenho,
        qualidade: form.qualidade,
        conhecimentos: form.conhecimentos,
        tomadaDecisao: form.tomadaDecisao,
        seguranca: form.seguranca,
        observacoes: observacoes || undefined,
      });
      setEnviado(true);
    } catch {
      toast.error("Erro ao enviar avaliação.");
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!avaliacao) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 font-medium">Link de avaliação inválido.</p>
          <p className="text-slate-400 text-sm mt-1">Verifique o link enviado pela SUSEL.</p>
        </div>
      </div>
    );
  }

  if (avaliacao.preenchidoEm || enviado) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Avaliação enviada!</h2>
          <p className="text-sm text-slate-500">
            A avaliação de <strong>{avaliacao.estagiario.nome}</strong> foi registrada com sucesso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Cabeçalho */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <p className="font-bold text-slate-800">SUSEL — TCDF</p>
              <p className="text-xs text-slate-500">Supervisão de Seleção e Gestão de Estágios</p>
            </div>
          </div>
          <h1 className="text-lg font-semibold text-slate-800">Relatório Semestral de Avaliação de Desempenho</h1>
          <p className="text-sm text-slate-500 mt-1">Preencha todos os indicadores e clique em Enviar.</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-500">Estagiário</p>
              <p className="font-medium text-slate-800">{avaliacao.estagiario.nome}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-500">Supervisor</p>
              <p className="font-medium text-slate-800">{avaliacao.estagiario.supervisorNome}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-500">Curso</p>
              <p className="font-medium text-slate-800">{avaliacao.estagiario.curso}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-slate-500">Período Avaliado</p>
              <p className="font-medium text-slate-800">{avaliacao.periodoAvaliado}</p>
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Legenda</p>
          <div className="flex gap-3 flex-wrap">
            {OPCOES.map(o => (
              <span key={o.value} className={`px-3 py-1 rounded-full text-xs font-medium border ${o.cor}`}>
                {o.value} — {o.label}
              </span>
            ))}
          </div>
        </div>

        {/* Indicadores */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Indicadores de Desempenho</p>
          {INDICADORES.map(ind => (
            <div key={ind.key} className="border border-slate-100 rounded-xl p-4">
              <p className="text-sm font-medium text-slate-800 mb-1">{ind.label}</p>
              <p className="text-xs text-slate-500 mb-3">{ind.definicao}</p>
              <div className="flex gap-2 flex-wrap">
                {OPCOES.map(o => (
                  <button
                    key={o.value}
                    onClick={() => set(ind.key, o.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      form[ind.key] === o.value
                        ? o.cor + " border-current scale-105 shadow-sm"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {o.value} — {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Observações */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-700 mb-2">Observações (opcional)</p>
          <textarea
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            rows={3}
            placeholder="Comentários adicionais sobre o desempenho do estagiário..."
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
          />
        </div>

        {/* Botão enviar */}
        <Button className="w-full py-3 text-base" onClick={handleEnviar} disabled={enviando}>
          {enviando ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</> : "Enviar Avaliação"}
        </Button>

        <p className="text-center text-xs text-slate-400 pb-4">
          SUSEL · Tribunal de Contas do Distrito Federal · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
