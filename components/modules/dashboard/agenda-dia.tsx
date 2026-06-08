"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RefreshCw, ClipboardCheck, Palmtree } from "lucide-react";

interface EstagiarioAlerta {
  id: string;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  renovacoes: { id: string }[];
  recessos: { id: string }[];
  avaliacoes: { id: string }[];
}

interface AgendaDiaProps {
  estagiarios: EstagiarioAlerta[];
}

function formatarData(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function mesesDeEstagio(dataInicio: Date, referencia: Date) {
  const anos = referencia.getFullYear() - dataInicio.getFullYear();
  const meses = referencia.getMonth() - dataInicio.getMonth();
  return anos * 12 + meses;
}

function calcularAlertas(estagiarios: EstagiarioAlerta[], data: Date) {
  const renovacoes: { id: string; nome: string; diasRestantes: number }[] = [];
  const avaliacoes: { id: string; nome: string; meses: number }[] = [];
  const recessos: { id: string; nome: string }[] = [];

  for (const e of estagiarios) {
    const dataInicio = new Date(e.dataInicio);
    const dataFim = new Date(e.dataFim);
    const meses = mesesDeEstagio(dataInicio, data);

    const diasRestantes = Math.ceil((dataFim.getTime() - data.getTime()) / 86400000);
    if (diasRestantes >= 0 && diasRestantes <= 30 && e.renovacoes.length === 0) {
      renovacoes.push({ id: e.id, nome: e.nome, diasRestantes });
    }

    const marcosAvaliacao = [6, 12];
    if (e.renovacoes.length > 0) marcosAvaliacao.push(18);
    for (const marco of marcosAvaliacao) {
      const dataMarco = new Date(dataInicio);
      dataMarco.setMonth(dataMarco.getMonth() + marco);
      if (
        dataMarco.getDate() === data.getDate() &&
        dataMarco.getMonth() === data.getMonth() &&
        dataMarco.getFullYear() === data.getFullYear()
      ) {
        avaliacoes.push({ id: e.id, nome: e.nome, meses: marco });
      }
    }

    if (meses >= 12 && e.recessos.length === 0) {
      const dataAniversario = new Date(dataInicio);
      dataAniversario.setFullYear(dataAniversario.getFullYear() + 1);
      if (
        dataAniversario.getDate() === data.getDate() &&
        dataAniversario.getMonth() === data.getMonth() &&
        dataAniversario.getFullYear() === data.getFullYear()
      ) {
        recessos.push({ id: e.id, nome: e.nome });
      }
    }
  }

  return { renovacoes, avaliacoes, recessos };
}

export function AgendaDia({ estagiarios }: AgendaDiaProps) {
  const [data, setData] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const isHoje = data.getTime() === hoje.getTime();

  function avancar() {
    const nova = new Date(data);
    nova.setDate(nova.getDate() + 1);
    setData(nova);
  }

  function recuar() {
    const nova = new Date(data);
    nova.setDate(nova.getDate() - 1);
    setData(nova);
  }

  const { renovacoes, avaliacoes, recessos } = calcularAlertas(estagiarios, data);
  const total = renovacoes.length + avaliacoes.length + recessos.length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={recuar} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800">{formatarData(data)}</p>
          {isHoje && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">hoje</span>
          )}
        </div>
        <button onClick={avancar} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {total === 0 ? (
        <p className="text-center text-sm text-slate-400 py-6">Nenhum compromisso para este dia.</p>
      ) : (
        <div className="space-y-4">
          {renovacoes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Renovacao
              </p>
              <div className="space-y-2">
                {renovacoes.map((r) => (
                  <Link key={r.id} href={`/renovacao?estagiarioId=${r.id}`} className="flex items-center justify-between p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg hover:bg-amber-100 transition">
                    <div>
                      <p className="text-sm font-medium text-amber-900">{r.nome}</p>
                      <p className="text-xs text-amber-700">Contrato vence em {r.diasRestantes} dias</p>
                    </div>
                    <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{r.diasRestantes}d</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {avaliacoes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <ClipboardCheck className="w-3 h-3" /> Avaliacao Semestral
              </p>
              <div className="space-y-2">
                {avaliacoes.map((a) => (
                  <Link key={a.id} href={`/estagiarios/${a.id}`} className="flex items-center justify-between p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg hover:bg-blue-100 transition">
                    <div>
                      <p className="text-sm font-medium text-blue-900">{a.nome}</p>
                      <p className="text-xs text-blue-700">Completa {a.meses} meses hoje — enviar avaliacao ao supervisor</p>
                    </div>
                    <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">{a.meses}m</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {recessos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Palmtree className="w-3 h-3" /> Recesso
              </p>
              <div className="space-y-2">
                {recessos.map((r) => (
                  <Link key={r.id} href={`/recesso?estagiarioId=${r.id}`} className="flex items-center justify-between p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg hover:bg-green-100 transition">
                    <div>
                      <p className="text-sm font-medium text-green-900">{r.nome}</p>
                      <p className="text-xs text-green-700">Completou 1 ano de estagio — marcar recesso</p>
                    </div>
                    <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded-full">1 ano</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}