import { Document, Page, View, Text } from "@react-pdf/renderer";
import { estilos, cores, PdfHeader, PdfFooter, formatarData } from "./pdf-base";

type ExpirandoData = {
  nome: string;
  vagaCodigo: string;
  secretariaLabel: string;
  dataFim: Date | string;
  diasRestantes: number;
};

type Props = {
  dias: number;
  estagiarios: ExpirandoData[];
};

function urgenciaColor(diasRestantes: number): string {
  if (diasRestantes <= 15) return cores.alerta;
  if (diasRestantes <= 30) return cores.amarelo;
  return cores.texto;
}

export function PdfExpirando({ dias, estagiarios }: Props) {
  return (
    <Document>
      <Page size="A4" style={estilos.page}>
        <PdfHeader
          titulo={`Contratos Expirando em ${dias} Dias`}
          subtitulo={`${estagiarios.length} estagiário(s) com contrato próximo ao vencimento`}
        />

        {estagiarios.length === 0 ? (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 9, color: cores.muted, textAlign: "center" }}>
              Nenhum contrato expirando nos próximos {dias} dias.
            </Text>
          </View>
        ) : (
          <View style={estilos.table}>
            <View style={estilos.tableHeader}>
              <Text style={[estilos.tableHeaderCell, { flex: 3 }]}>Nome</Text>
              <Text style={[estilos.tableHeaderCell, { flex: 1 }]}>Vaga</Text>
              <Text style={[estilos.tableHeaderCell, { flex: 2 }]}>Secretaria</Text>
              <Text style={[estilos.tableHeaderCell, { flex: 1.5 }]}>Data Fim</Text>
              <Text style={[estilos.tableHeaderCell, { flex: 1 }]}>Dias Rest.</Text>
            </View>
            {estagiarios.map((e, i) => (
              <View
                key={`${e.vagaCodigo}-${i}`}
                style={i % 2 === 1 ? [estilos.tableRow, estilos.tableRowAlt] : estilos.tableRow}
              >
                <Text style={[estilos.tableCell, { flex: 3 }]}>{e.nome}</Text>
                <Text style={[estilos.tableCell, { flex: 1 }]}>{e.vagaCodigo}</Text>
                <Text style={[estilos.tableCell, { flex: 2 }]}>{e.secretariaLabel}</Text>
                <Text style={[estilos.tableCell, { flex: 1.5 }]}>{formatarData(e.dataFim)}</Text>
                <Text style={[estilos.tableCell, { flex: 1, color: urgenciaColor(e.diasRestantes), fontFamily: "Helvetica-Bold" }]}>
                  {e.diasRestantes}d
                </Text>
              </View>
            ))}
          </View>
        )}

        <PdfFooter />
      </Page>
    </Document>
  );
}
