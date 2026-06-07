"use client";

import { useState, useEffect, useRef } from "react";
import { BlobProvider } from "@react-pdf/renderer";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { selectClass } from "@/components/ui/form-field";
import { PdfAtivos } from "./pdf-ativos";
import { PdfEntradasSaidas } from "./pdf-entradas-saidas";
import { PdfExpirando } from "./pdf-expirando";
import { PdfHistorico } from "./pdf-historico";
import { PdfQuantitativo } from "./pdf-quantitativo";
import {
  buscarDadosAtivos,
  buscarDadosEntradasSaidas,
  buscarDadosExpirando,
  buscarDadosHistorico,
  buscarDadosQuantitativo,
} from "@/actions/relatorios";

type AtivoData = Awaited<ReturnType<typeof buscarDadosAtivos>>;
type EsData = Awaited<ReturnType<typeof buscarDadosEntradasSaidas>>;
type ExpirandoData = Awaited<ReturnType<typeof buscarDadosExpirando>>;
type HistoricoData = Awaited<ReturnType<typeof buscarDadosHistorico>>;
type QuantData = Awaited<ReturnType<typeof buscarDadosQuantitativo>>;

type Phase = "idle" | "fetching" | "ready";

// Generic hook: fetching → ready → idle after PDF opens
function useRelatorio<T>() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [data, setData] = useState<T | null>(null);

  async function trigger(fetchFn: () => Promise<T>) {
    setPhase("fetching");
    try {
      const result = await fetchFn();
      setData(result);
      setPhase("ready");
    } catch (e: unknown) {
      setPhase("idle");
      toast.error(e instanceof Error ? e.message : "Erro ao gerar relatório.");
    }
  }

  function reset() {
    setData(null);
    setPhase("idle");
  }

  return { phase, data, trigger, reset };
}

// Opens the PDF blob URL in a new tab once, then resets state
function AutoOpen({ url, onDone }: { url: string; onDone: () => void }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    window.open(url, "_blank");
    onDone();
  }, [url, onDone]);
  return null;
}

// Wraps BlobProvider and triggers AutoOpen when the PDF blob is ready
function PdfAutoOpen({
  document,
  onDone,
}: {
  document: React.ReactElement;
  onDone: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <BlobProvider document={document as any}>
      {({ url, loading, error }) => {
        if (error) {
          return <ErrorReset onDone={onDone} />;
        }
        if (!loading && url) {
          return <AutoOpen url={url} onDone={onDone} />;
        }
        return null;
      }}
    </BlobProvider>
  );
}

function ErrorReset({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    toast.error("Erro ao gerar o PDF.");
    onDone();
  }, [onDone]);
  return null;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

type EstagiarioOpt = { id: string; nome: string; vagaCodigo: string; status: string };

export function RelatoriosUI({ estagiarios }: { estagiarios: EstagiarioOpt[] }) {
  const hoje = new Date();

  // Filters
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [dias, setDias] = useState<30 | 60 | 90>(30);
  const [estagiarioId, setEstagiarioId] = useState("");

  // Per-report state
  const ativos = useRelatorio<AtivoData>();
  const es = useRelatorio<EsData>();
  const expirando = useRelatorio<ExpirandoData>();
  const historico = useRelatorio<HistoricoData>();
  const quant = useRelatorio<QuantData>();

  const anos = Array.from(
    { length: hoje.getFullYear() - 2022 + 1 },
    (_, i) => 2023 + i
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Ativos por Secretaria */}
      <ReportCard
        title="Estagiários Ativos por Secretaria"
        description="Lista completa agrupada por secretaria, com lotação, supervisor e datas de contrato."
      >
        {ativos.phase === "ready" && ativos.data && (
          <PdfAutoOpen
            document={<PdfAtivos grupos={ativos.data.grupos} total={ativos.data.total} />}
            onDone={ativos.reset}
          />
        )}
        <GerarBtn
          phase={ativos.phase}
          onClick={() => ativos.trigger(buscarDadosAtivos)}
        />
      </ReportCard>

      {/* Quantitativo de Vagas */}
      <ReportCard
        title="Quantitativo Geral de Vagas"
        description="Vagas autorizadas, cadastradas, ocupadas e disponíveis por secretaria, com taxa de ocupação."
      >
        {quant.phase === "ready" && quant.data && (
          <PdfAutoOpen
            document={<PdfQuantitativo linhas={quant.data.linhas} totais={quant.data.totais} />}
            onDone={quant.reset}
          />
        )}
        <GerarBtn
          phase={quant.phase}
          onClick={() => quant.trigger(buscarDadosQuantitativo)}
        />
      </ReportCard>

      {/* Entradas e Saídas */}
      <ReportCard
        title="Entradas e Saídas Mensal"
        description="Estagiários que iniciaram ou foram desligados em um mês/ano específico."
      >
        <div className="flex gap-3">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className={selectClass}
          >
            {MESES.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className={selectClass}
          >
            {anos.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        {es.phase === "ready" && es.data && (
          <PdfAutoOpen
            document={
              <PdfEntradasSaidas
                mes={es.data.mes}
                ano={es.data.ano}
                entradas={es.data.entradas}
                saidas={es.data.saidas}
              />
            }
            onDone={es.reset}
          />
        )}
        <GerarBtn
          phase={es.phase}
          onClick={() => es.trigger(() => buscarDadosEntradasSaidas(mes, ano))}
        />
      </ReportCard>

      {/* Contratos Expirando */}
      <ReportCard
        title="Contratos Expirando"
        description="Estagiários ativos com contrato próximo ao vencimento. Dias restantes em destaque."
      >
        <div className="flex gap-2">
          {([30, 60, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDias(d)}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${
                dias === d
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {d} dias
            </button>
          ))}
        </div>
        {expirando.phase === "ready" && expirando.data && (
          <PdfAutoOpen
            document={
              <PdfExpirando
                dias={expirando.data.dias}
                estagiarios={expirando.data.estagiarios}
              />
            }
            onDone={expirando.reset}
          />
        )}
        <GerarBtn
          phase={expirando.phase}
          onClick={() => expirando.trigger(() => buscarDadosExpirando(dias))}
        />
      </ReportCard>

      {/* Histórico do Estagiário */}
      <ReportCard
        title="Histórico Completo do Estagiário"
        description="Ficha individual com dados contratuais, recessos, renovações e log de ações."
      >
        <select
          value={estagiarioId}
          onChange={(e) => setEstagiarioId(e.target.value)}
          className={selectClass}
        >
          <option value="">Selecione um estagiário...</option>
          {estagiarios.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome} — {e.vagaCodigo}{" "}
              ({e.status === "ATIVO" ? "Ativo" : e.status === "DESLIGADO" ? "Desligado" : "Ag. CIDE"})
            </option>
          ))}
        </select>
        {historico.phase === "ready" && historico.data && (
          <PdfAutoOpen
            document={<PdfHistorico estagiario={historico.data} />}
            onDone={historico.reset}
          />
        )}
        <GerarBtn
          phase={historico.phase}
          disabled={!estagiarioId}
          onClick={() => historico.trigger(() => buscarDadosHistorico(estagiarioId))}
        />
      </ReportCard>
    </div>
  );
}

// Shared button component
function GerarBtn({
  phase,
  onClick,
  disabled,
}: {
  phase: Phase;
  onClick: () => void;
  disabled?: boolean;
}) {
  const busy = phase !== "idle";
  return (
    <Button onClick={onClick} disabled={busy || disabled} className="w-full">
      {busy ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {phase === "fetching" ? "Buscando dados..." : "Gerando PDF..."}
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          Gerar PDF
        </>
      )}
    </Button>
  );
}

// Shared card layout
function ReportCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}
