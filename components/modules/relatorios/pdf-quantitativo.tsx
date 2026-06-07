import { Document, Page, View, Text } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";
import { estilos, cores, PdfHeader, PdfFooter } from "./pdf-base";

const local = StyleSheet.create({
  totaisRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: cores.primario,
    marginTop: 2,
  },
  totaisCell: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: cores.fundoHeader,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 4,
    padding: 8,
    alignItems: "center",
  },
  statNum: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: cores.primario,
  },
  statLabel: {
    fontSize: 7,
    color: cores.muted,
    marginTop: 2,
    textAlign: "center",
  },
});

type Linha = {
  secretaria: string;
  label: string;
  autorizadas: number;
  total: number;
  ocupadas: number;
  disponiveis: number;
};

type Props = {
  linhas: Linha[];
  totais: {
    autorizadas: number;
    total: number;
    ocupadas: number;
    disponiveis: number;
  };
};

export function PdfQuantitativo({ linhas, totais }: Props) {
  const taxaOcupacao = totais.total > 0
    ? Math.round((totais.ocupadas / totais.total) * 100)
    : 0;

  return (
    <Document>
      <Page size="A4" style={estilos.page}>
        <PdfHeader
          titulo="Quantitativo Geral de Vagas"
          subtitulo={`Taxa de ocupação: ${taxaOcupacao}%`}
        />

        {/* Resumo geral */}
        <View style={local.statsRow}>
          <View style={local.statBox}>
            <Text style={local.statNum}>{totais.autorizadas}</Text>
            <Text style={local.statLabel}>Vagas Autorizadas</Text>
          </View>
          <View style={local.statBox}>
            <Text style={local.statNum}>{totais.total}</Text>
            <Text style={local.statLabel}>Vagas Cadastradas</Text>
          </View>
          <View style={[local.statBox, { borderColor: cores.alerta }]}>
            <Text style={[local.statNum, { color: cores.alerta }]}>{totais.ocupadas}</Text>
            <Text style={local.statLabel}>Ocupadas</Text>
          </View>
          <View style={[local.statBox, { borderColor: "#16a34a" }]}>
            <Text style={[local.statNum, { color: "#16a34a" }]}>{totais.disponiveis}</Text>
            <Text style={local.statLabel}>Disponíveis</Text>
          </View>
        </View>

        {/* Tabela por secretaria */}
        <View style={estilos.table}>
          <View style={estilos.tableHeader}>
            <Text style={[estilos.tableHeaderCell, { flex: 2 }]}>Secretaria</Text>
            <Text style={[estilos.tableHeaderCell, { flex: 1, textAlign: "center" }]}>Autorizadas</Text>
            <Text style={[estilos.tableHeaderCell, { flex: 1, textAlign: "center" }]}>Cadastradas</Text>
            <Text style={[estilos.tableHeaderCell, { flex: 1, textAlign: "center" }]}>Ocupadas</Text>
            <Text style={[estilos.tableHeaderCell, { flex: 1, textAlign: "center" }]}>Disponíveis</Text>
            <Text style={[estilos.tableHeaderCell, { flex: 1, textAlign: "center" }]}>% Ocup.</Text>
          </View>

          {linhas.map((l, i) => {
            const pct = l.total > 0 ? Math.round((l.ocupadas / l.total) * 100) : 0;
            return (
              <View
                key={l.secretaria}
                style={i % 2 === 1 ? [estilos.tableRow, estilos.tableRowAlt] : estilos.tableRow}
              >
                <Text style={[estilos.tableCell, { flex: 2, fontFamily: "Helvetica-Bold" }]}>{l.label}</Text>
                <Text style={[estilos.tableCell, { flex: 1, textAlign: "center" }]}>{l.autorizadas}</Text>
                <Text style={[estilos.tableCell, { flex: 1, textAlign: "center" }]}>{l.total}</Text>
                <Text style={[estilos.tableCell, { flex: 1, textAlign: "center", color: l.ocupadas > 0 ? cores.alerta : cores.texto }]}>
                  {l.ocupadas}
                </Text>
                <Text style={[estilos.tableCell, { flex: 1, textAlign: "center", color: "#16a34a" }]}>
                  {l.disponiveis}
                </Text>
                <Text style={[estilos.tableCell, { flex: 1, textAlign: "center" }]}>{pct}%</Text>
              </View>
            );
          })}

          {/* Linha de totais */}
          <View style={local.totaisRow}>
            <Text style={[local.totaisCell, { flex: 2 }]}>TOTAL</Text>
            <Text style={[local.totaisCell, { flex: 1, textAlign: "center" }]}>{totais.autorizadas}</Text>
            <Text style={[local.totaisCell, { flex: 1, textAlign: "center" }]}>{totais.total}</Text>
            <Text style={[local.totaisCell, { flex: 1, textAlign: "center" }]}>{totais.ocupadas}</Text>
            <Text style={[local.totaisCell, { flex: 1, textAlign: "center" }]}>{totais.disponiveis}</Text>
            <Text style={[local.totaisCell, { flex: 1, textAlign: "center" }]}>{taxaOcupacao}%</Text>
          </View>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
