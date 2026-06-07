import { StyleSheet, View, Text } from "@react-pdf/renderer";

export const cores = {
  primario: "#1e3a5f",
  primarioDark: "#0f2d4a",
  texto: "#1e293b",
  muted: "#64748b",
  borda: "#e2e8f0",
  fundoHeader: "#f8fafc",
  alerta: "#dc2626",
  amarelo: "#d97706",
};

export const estilos = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 40,
    color: cores.texto,
  },
  // Cabeçalho
  headerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: cores.primario,
    paddingBottom: 8,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLogo: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: cores.primario,
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: 7,
    color: cores.muted,
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: cores.primario,
    textAlign: "right",
  },
  headerDate: {
    fontSize: 7,
    color: cores.muted,
    textAlign: "right",
    marginTop: 2,
  },
  // Rodapé
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingTop: 4,
    fontSize: 7,
    color: cores.muted,
  },
  // Tabela
  table: { marginTop: 8 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: cores.primario,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  tableRowAlt: {
    backgroundColor: cores.fundoHeader,
  },
  tableCell: {
    flex: 1,
    fontSize: 8,
    color: cores.texto,
  },
  // Seções
  secao: {
    marginBottom: 16,
  },
  secaoTitulo: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: cores.primario,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: cores.primario,
  },
  // Info grid
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  infoItem: {
    width: "30%",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 7,
    color: cores.muted,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 9,
    color: cores.texto,
    marginTop: 1,
  },
  // Badge
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 7,
  },
});

export function formatarData(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export function dataGeracao(): string {
  return new Date().toLocaleString("pt-BR");
}

export function PdfHeader({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <View style={estilos.headerContainer}>
      <View>
        <Text style={estilos.headerLogo}>SUSEL</Text>
        <Text style={estilos.headerSub}>TCDF — Sistema de Gestão de Estágios</Text>
      </View>
      <View>
        <Text style={estilos.headerTitle}>{titulo}</Text>
        {subtitulo ? <Text style={estilos.headerDate}>{subtitulo}</Text> : null}
      </View>
    </View>
  );
}

export function PdfFooter() {
  return (
    <View style={estilos.footer} fixed>
      <Text>SUSEL — TCDF</Text>
      <Text>Gerado em {dataGeracao()}</Text>
      <Text
        render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
          `Pág. ${pageNumber}/${totalPages}`
        }
      />
    </View>
  );
}
