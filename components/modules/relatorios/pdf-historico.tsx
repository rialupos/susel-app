import { Document, Page, View, Text } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";
import { estilos, cores, PdfHeader, PdfFooter, formatarData } from "./pdf-base";

const local = StyleSheet.create({
  infoGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  infoItem: { width: "33%", marginBottom: 8 },
  infoLabel: { fontSize: 7, color: cores.muted, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  infoValue: { fontSize: 9, color: cores.texto, marginTop: 2 },
  historicoRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    gap: 8,
  },
  historicoData: { fontSize: 7, color: cores.muted, width: 80 },
  historicoAcao: { fontSize: 7, fontFamily: "Helvetica-Bold", color: cores.primario, width: 100 },
  historicoDetalhe: { fontSize: 7, color: cores.texto, flex: 1 },
  historicoUsuario: { fontSize: 7, color: cores.muted, width: 80, textAlign: "right" },
});

const STATUS_LABEL: Record<string, string> = {
  AGUARDANDO_CIDE: "Aguardando CIDE",
  ATIVO: "Ativo",
  DESLIGADO: "Desligado",
};

const MOTIVO_LABEL: Record<string, string> = {
  TERMINO_CONTRATO: "Término de contrato",
  INICIATIVA_ESTAGIARIO: "Iniciativa do estagiário",
  INICIATIVA_TCDF: "Iniciativa do TCDF",
  OUTROS: "Outros",
};

type Recesso = {
  numeroRecesso: number;
  dataInicioPeriodo: Date | string;
  dataFimPeriodo: Date | string;
  quantidadeDias: number;
  confirmado: boolean;
  observacoes?: string | null;
};

type Renovacao = {
  dataNovaFim: Date | string;
  status: string;
  observacoes?: string | null;
  createdAt: Date | string;
};

type Desligamento = {
  dataUltimoDia: Date | string;
  motivo: string;
  observacoes?: string | null;
};

type Historico = {
  acao: string;
  detalhes?: string | null;
  createdAt: Date | string;
  usuario: { nome: string };
};

type Props = {
  estagiario: {
    nome: string;
    cpf: string;
    nivel: string;
    curso: string;
    horario: string;
    instituicaoEnsino: string;
    tipo: string;
    dataInicio: Date | string;
    dataFim: Date | string;
    dataLimiteContrato: Date | string;
    status: string;
    lotacao: string;
    supervisorNome: string;
    unidadeGestora: string;
    vaga: { codigo: string; secretaria: string; secretariaLabel: string };
    recessos: Recesso[];
    renovacoes: Renovacao[];
    desligamentos: Desligamento[];
    historico: Historico[];
  };
};

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={local.infoItem}>
      <Text style={local.infoLabel}>{label}</Text>
      <Text style={local.infoValue}>{value || "—"}</Text>
    </View>
  );
}

export function PdfHistorico({ estagiario: e }: Props) {
  return (
    <Document>
      <Page size="A4" style={estilos.page}>
        <PdfHeader
          titulo="Histórico do Estagiário"
          subtitulo={e.nome}
        />

        {/* Dados Pessoais */}
        <View style={estilos.secao}>
          <Text style={estilos.secaoTitulo}>Dados Pessoais e Contratuais</Text>
          <View style={local.infoGrid}>
            <InfoItem label="Nome" value={e.nome} />
            <InfoItem label="CPF" value={e.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")} />
            <InfoItem label="Status" value={STATUS_LABEL[e.status] ?? e.status} />
            <InfoItem label="Vaga" value={e.vaga.codigo} />
            <InfoItem label="Secretaria" value={e.vaga.secretariaLabel} />
            <InfoItem label="Lotação" value={e.lotacao} />
            <InfoItem label="Unidade Gestora" value={e.unidadeGestora} />
            <InfoItem label="Supervisor" value={e.supervisorNome} />
            <InfoItem label="Tipo" value={e.tipo} />
            <InfoItem label="Nível" value={e.nivel} />
            <InfoItem label="Curso" value={e.curso} />
            <InfoItem label="Instituição" value={e.instituicaoEnsino} />
            <InfoItem label="Horário" value={e.horario} />
            <InfoItem label="Início" value={formatarData(e.dataInicio)} />
            <InfoItem label="Fim Atual" value={formatarData(e.dataFim)} />
            <InfoItem label="Limite Contrato" value={formatarData(e.dataLimiteContrato)} />
          </View>
        </View>

        {/* Recessos */}
        {e.recessos.length > 0 && (
          <View style={estilos.secao}>
            <Text style={estilos.secaoTitulo}>Recessos</Text>
            <View style={estilos.table}>
              <View style={estilos.tableHeader}>
                <Text style={[estilos.tableHeaderCell, { flex: 0.5 }]}>Nº</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 1.5 }]}>Período Início</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 1.5 }]}>Período Fim</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 0.8 }]}>Dias</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 1 }]}>Situação</Text>
              </View>
              {e.recessos.map((r, i) => (
                <View
                  key={i}
                  style={i % 2 === 1 ? [estilos.tableRow, estilos.tableRowAlt] : estilos.tableRow}
                >
                  <Text style={[estilos.tableCell, { flex: 0.5 }]}>{r.numeroRecesso}º</Text>
                  <Text style={[estilos.tableCell, { flex: 1.5 }]}>{formatarData(r.dataInicioPeriodo)}</Text>
                  <Text style={[estilos.tableCell, { flex: 1.5 }]}>{formatarData(r.dataFimPeriodo)}</Text>
                  <Text style={[estilos.tableCell, { flex: 0.8 }]}>{r.quantidadeDias}</Text>
                  <Text style={[estilos.tableCell, { flex: 1, color: r.confirmado ? "#16a34a" : cores.amarelo }]}>
                    {r.confirmado ? "Confirmado" : "Pendente"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Renovações */}
        {e.renovacoes.length > 0 && (
          <View style={estilos.secao}>
            <Text style={estilos.secaoTitulo}>Renovações</Text>
            <View style={estilos.table}>
              <View style={estilos.tableHeader}>
                <Text style={[estilos.tableHeaderCell, { flex: 1.5 }]}>Solicitação</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 1.5 }]}>Nova Data Fim</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 1 }]}>Status</Text>
                <Text style={[estilos.tableHeaderCell, { flex: 2 }]}>Observações</Text>
              </View>
              {e.renovacoes.map((r, i) => (
                <View
                  key={i}
                  style={i % 2 === 1 ? [estilos.tableRow, estilos.tableRowAlt] : estilos.tableRow}
                >
                  <Text style={[estilos.tableCell, { flex: 1.5 }]}>{formatarData(r.createdAt)}</Text>
                  <Text style={[estilos.tableCell, { flex: 1.5 }]}>{formatarData(r.dataNovaFim)}</Text>
                  <Text style={[estilos.tableCell, { flex: 1 }]}>{r.status.replace(/_/g, " ")}</Text>
                  <Text style={[estilos.tableCell, { flex: 2 }]}>{r.observacoes ?? "—"}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Desligamento */}
        {e.desligamentos.length > 0 && (
          <View style={estilos.secao}>
            <Text style={estilos.secaoTitulo}>Desligamento</Text>
            {e.desligamentos.map((d, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 8 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>Último dia: </Text>
                  {formatarData(d.dataUltimoDia)}
                  {"   "}
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>Motivo: </Text>
                  {MOTIVO_LABEL[d.motivo] ?? d.motivo}
                </Text>
                {d.observacoes && (
                  <Text style={{ fontSize: 8, color: cores.muted, marginTop: 2 }}>
                    {d.observacoes}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Histórico de Ações */}
        <View style={estilos.secao}>
          <Text style={estilos.secaoTitulo}>Histórico de Ações</Text>
          {e.historico.length === 0 ? (
            <Text style={{ fontSize: 8, color: cores.muted }}>Nenhuma ação registrada.</Text>
          ) : (
            e.historico.map((h, i) => (
              <View key={i} style={[local.historicoRow, i % 2 === 1 ? { backgroundColor: cores.fundoHeader } : {}]}>
                <Text style={local.historicoData}>{formatarData(h.createdAt)}</Text>
                <Text style={local.historicoAcao}>{h.acao.replace(/_/g, " ")}</Text>
                <Text style={local.historicoDetalhe}>{h.detalhes ?? "—"}</Text>
                <Text style={local.historicoUsuario}>{h.usuario.nome}</Text>
              </View>
            ))
          )}
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
