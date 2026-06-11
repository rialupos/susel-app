"use client";
import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvaliacaoParaPDF {
  id: string;
  periodoAvaliado: string;
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
  notaFinal: number | null;
  observacoes: string | null;
  preenchidoEm: Date | null;
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
  { key: "assiduidade", label: "1 - Assiduidade e pontualidade" },
  { key: "relacionamento", label: "2 - Relacionamento" },
  { key: "assimilacao", label: "3 - Assimilacao" },
  { key: "iniciativa", label: "4 - Iniciativa" },
  { key: "organizacao", label: "5 - Organizacao" },
  { key: "desempenho", label: "6 - Desempenho" },
  { key: "qualidade", label: "7 - Qualidade" },
  { key: "conhecimentos", label: "8 - Conhecimentos" },
  { key: "tomadaDecisao", label: "9 - Tomada de decisao" },
  { key: "seguranca", label: "10 - Seguranca" },
];

const LABELS: Record<string, string> = { O: "Otimo", B: "Bom", M: "Mediano", R: "Ruim" };

export function GerarPdfButton({ avaliacao }: { avaliacao: AvaliacaoParaPDF }) {
  const [loading, setLoading] = useState(false);

  async function handleGerar() {
    setLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W = 210;
      const margin = 20;
      let y = 20;

      const azul = [24, 78, 149] as [number, number, number];
      const cinza = [100, 100, 100] as [number, number, number];
      const preto = [30, 30, 30] as [number, number, number];

      doc.setFillColor(...azul);
      doc.rect(0, 0, W, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("TRIBUNAL DE CONTAS DO DISTRITO FEDERAL", margin, 11);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Supervisao de Selecao e Gestao de Estagios - SUSEL", margin, 17);
      doc.text("Secretaria de Gestao de Pessoas - SEGEP", margin, 22);
      y = 38;

      doc.setTextColor(...preto);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("RELATORIO SEMESTRAL DE AVALIACAO DE DESEMPENHO", W / 2, y, { align: "center" });
      y += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...cinza);
      doc.text(`Periodo Avaliado: ${avaliacao.periodoAvaliado}`, W / 2, y, { align: "center" });
      y += 10;

      doc.setDrawColor(...azul);
      doc.setLineWidth(0.5);
      doc.line(margin, y, W - margin, y);
      y += 6;

      doc.setTextColor(...azul);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("DADOS DO ESTAGIARIO", margin, y);
      y += 5;

      doc.setTextColor(...preto);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      const dados = [
        ["Nome:", avaliacao.estagiario.nome],
        ["Curso:", avaliacao.estagiario.curso],
        ["Unidade:", avaliacao.estagiario.unidadeGestora],
        ["Supervisor:", avaliacao.estagiario.supervisorNome + (avaliacao.estagiario.supervisorCargo ? ` (${avaliacao.estagiario.supervisorCargo})` : "")],
        ["Data de Inicio:", new Date(avaliacao.estagiario.dataInicio).toLocaleDateString("pt-BR")],
        ["Avaliado em:", avaliacao.preenchidoEm ? new Date(avaliacao.preenchidoEm).toLocaleDateString("pt-BR") : "---"],
      ];

      for (const [label, valor] of dados) {
        doc.setFont("helvetica", "bold");
        doc.text(label, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(valor, margin + 28, y);
        y += 5;
      }

      y += 3;
      doc.setDrawColor(...azul);
      doc.line(margin, y, W - margin, y);
      y += 6;

      doc.setTextColor(...azul);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("INDICADORES DE DESEMPENHO", margin, y);
      y += 5;

      doc.setFillColor(240, 244, 248);
      doc.rect(margin, y, W - margin * 2, 6, "F");
      doc.setTextColor(...preto);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Indicador", margin + 2, y + 4);
      doc.text("Conceito", W - margin - 25, y + 4);
      y += 8;

      for (const ind of INDICADORES) {
        const valor = avaliacao[ind.key as keyof AvaliacaoParaPDF] as string | null;
        const conceito = valor ? `${valor} - ${LABELS[valor] ?? valor}` : "---";

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...preto);
        doc.text(ind.label, margin + 2, y);
        doc.setFont("helvetica", "bold");
        doc.text(conceito, W - margin - 25, y);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(margin, y + 2, W - margin, y + 2);
        y += 7;
      }

      y += 3;
      doc.setFillColor(...azul);
      doc.rect(margin, y, W - margin * 2, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("NOTA FINAL:", margin + 2, y + 5.5);
      doc.text(`${avaliacao.notaFinal?.toFixed(1) ?? "---"} / 10,0`, W - margin - 30, y + 5.5);
      y += 14;

      if (avaliacao.observacoes) {
        doc.setDrawColor(...azul);
        doc.setLineWidth(0.5);
        doc.line(margin, y, W - margin, y);
        y += 6;
        doc.setTextColor(...azul);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("OBSERVACOES", margin, y);
        y += 5;
        doc.setTextColor(...preto);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const linhas = doc.splitTextToSize(avaliacao.observacoes, W - margin * 2);
        doc.text(linhas, margin, y);
        y += linhas.length * 4 + 5;
      }

      y += 5;
      doc.setDrawColor(...azul);
      doc.setLineWidth(0.5);
      doc.line(margin, y, W - margin, y);
      y += 10;

      doc.setTextColor(...azul);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("ASSINATURAS", margin, y);
      y += 10;

      const col1 = margin;
      const col2 = W / 2 + 5;
      const larguraAssinatura = W / 2 - margin - 5;

      doc.setDrawColor(...cinza);
      doc.setLineWidth(0.3);
      doc.line(col1, y, col1 + larguraAssinatura, y);
      doc.line(col2, y, col2 + larguraAssinatura, y);
      y += 4;

      doc.setTextColor(...preto);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Supervisor(a)", col1, y);
      doc.text("Estagiario(a)", col2, y);
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.text(avaliacao.estagiario.supervisorNome, col1, y);
      doc.text(avaliacao.estagiario.nome, col2, y);
      y += 4;
      if (avaliacao.estagiario.supervisorCargo) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...cinza);
        doc.text(avaliacao.estagiario.supervisorCargo, col1, y);
      }

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(...cinza);
        doc.text(`SUSEL/SEGEP/TCDF - Documento gerado em ${new Date().toLocaleDateString("pt-BR")}`, margin, 290);
        doc.text(`Pagina ${i} de ${pageCount}`, W - margin, 290, { align: "right" });
      }

      const nomeArquivo = `Avaliacao_${avaliacao.estagiario.nome.replace(/\s+/g, "_")}_${avaliacao.periodoAvaliado.replace(/\s+/g, "_")}.pdf`;
      doc.save(nomeArquivo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleGerar} disabled={loading} variant="secondary" size="sm">
      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</> : <><FileDown className="w-4 h-4" /> Baixar PDF</>}
    </Button>
  );
}