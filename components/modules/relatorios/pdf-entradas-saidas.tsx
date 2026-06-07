import { Document, Page, View, Text } from "@react-pdf/renderer";
import { estilos, cores, PdfHeader, PdfFooter, formatarData } from "./pdf-base";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MOTIVO_LABEL: Record<string, string> = {
  TERMINO_CONTRATO: "Término de contrato",
  INICIATIVA_ESTAGIARIO: "Iniciativa do estagiário",
  INICIATIVA_TCDF: "Iniciativa do TCDF",
  OUTROS: "Outros",
};

type EntradaData = {
  nome: string;
  vagaCodigo: string;
  secretariaLabel: string;
  dataInicio: Date | string;
};

type SaidaData = {
  nome: string;
  vagaCodigo: string;
  secretariaLabel: string;
  dataUltimoDia: Date | string;
  motivo: string;
};

type Props = {
  mes: number;
  ano: number;
  entradas: EntradaData[];
  saidas: SaidaData[];
};

export function PdfEntradasSaidas({ mes, ano, entradas, saidas }: Props) {
  const titulo = `Entradas e Saídas — ${MESES[mes - 1]}/${ano}`;

  return (
    <Document>
      <Page size="A4" style={estilos.page}>
        <PdfHeader
          titulo={titulo}
          subtitulo={`${entradas.length} entrada(s) · ${saidas.length} saída(s)`}
        />

        <View style={estilos.secao}>
          <Text style={estilos.secaoTitulo}>Entradas ({entradas.length})</Text>
          {entradas.length === 0 ? (
            <Text style={{ fontSize: 8, color: cores.muted, marginTop: 4 }}>
              Nenhuma entrada registrada neste período.
            </Text>
          ) : (
            <View style={estilos.table}>
              <View style={estilos.tableHeader}>
                <Text style={[estilos.tableHeaderCell, { flex: 3 }]}>Nome</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 1 }]}>Vaga</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 2 }]}>Secretaria</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 1.5 }]}>Data Início</Text>
              </View>
              {entradas.map((e, i) => (
                <View
                  key={`e-${i}`}
                  style={i % 2 === 1 ? [estilos.tableRow, estilos.tableRowAlt] : estilos.tableRow}
                >
                  <Text style={[estilos.tableCell, { flex: 3 }]}>{e.nome}</Text>
                  <Text style={[estilos.tableCell, { flex: 1 }]}>{e.vagaCodigo}</Text>
                  <Text style={[estilos.tableCell, { flex: 2 }]}>{e.secretariaLabel}</Text>
                  <Text style={[estilos.tableCell, { flex: 1.5 }]}>{formatarData(e.dataInicio)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.secaoTitulo}>Saídas / Desligamentos ({saidas.length})</Text>
          {saidas.length === 0 ? (
            <Text style={{ fontSize: 8, color: cores.muted, marginTop: 4 }}>
              Nenhum desligamento registrado neste período.
            </Text>
          ) : (
            <View style={estilos.table}>
              <View style={estilos.tableHeader}>
                <Text style={[estilos.tableHeaderCell, { flex: 3 }]}>Nome</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 1 }]}>Vaga</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 2 }]}>Secretaria</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 1.5 }]}>Último Dia</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 2 }]}>Motivo</Text>
              </View>
              {saidas.map((s, i) => (
                <View
                  key={`s-${i}`}
                  style={i % 2 === 1 ? [estilos.tableRow, estilos.tableRowAlt] : estilos.tableRow}
                >
                  <Text style={[estilos.tableCell, { flex: 3 }]}>{s.nome}</Text>
                  <Text style={[estilos.tableCell, { flex: 1 }]}>{s.vagaCodigo}</Text>
                  <Text style={[estilos.tableCell, { flex: 2 }]}>{s.secretariaLabel}</Text>
                  <Text style={[estilos.tableCell, { flex: 1.5 }]}>{formatarData(s.dataUltimoDia)}</Text>
                  <Text style={[estilos.tableCell, { flex: 2 }]}>{MOTIVO_LABEL[s.motivo] ?? s.motivo}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
