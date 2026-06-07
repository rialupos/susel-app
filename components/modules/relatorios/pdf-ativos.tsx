import { Document, Page, View, Text } from "@react-pdf/renderer";
import { estilos, PdfHeader, PdfFooter, formatarData } from "./pdf-base";

type Estagiario = {
  nome: string;
  vagaCodigo: string;
  lotacao: string;
  supervisorNome: string;
  dataInicio: Date | string;
  dataFim: Date | string;
};

type Grupo = {
  secretaria: string;
  label: string;
  estagiarios: Estagiario[];
};

type Props = {
  grupos: Grupo[];
  total: number;
};

export function PdfAtivos({ grupos, total }: Props) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={estilos.page}>
        <PdfHeader
          titulo="Estagiários Ativos por Secretaria"
          subtitulo={`Total: ${total} estagiário(s) ativo(s)`}
        />

        {grupos.map((grupo) => (
          <View key={grupo.secretaria} style={estilos.secao}>
            <Text style={estilos.secaoTitulo}>
              {grupo.label} ({grupo.estagiarios.length})
            </Text>
            <View style={estilos.table}>
              <View style={estilos.tableHeader}>
                <Text style={[estilos.tableHeaderCell, { flex: 3 }]}>Nome</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 1 }]}>Vaga</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 2 }]}>Lotação</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 2 }]}>Supervisor</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 1.2 }]}>Início</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 1.2 }]}>Fim</Text>
              </View>
              {grupo.estagiarios.map((e, i) => (
                <View
                  key={`${e.vagaCodigo}-${i}`}
                  style={i % 2 === 1 ? [estilos.tableRow, estilos.tableRowAlt] : estilos.tableRow}
                >
                  <Text style={[estilos.tableCell, { flex: 3 }]}>{e.nome}</Text>
                  <Text style={[estilos.tableCell, { flex: 1 }]}>{e.vagaCodigo}</Text>
                  <Text style={[estilos.tableCell, { flex: 2 }]}>{e.lotacao}</Text>
                  <Text style={[estilos.tableCell, { flex: 2 }]}>{e.supervisorNome}</Text>
                  <Text style={[estilos.tableCell, { flex: 1.2 }]}>{formatarData(e.dataInicio)}</Text>
                  <Text style={[estilos.tableCell, { flex: 1.2 }]}>{formatarData(e.dataFim)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <PdfFooter />
      </Page>
    </Document>
  );
}
