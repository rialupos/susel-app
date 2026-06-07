import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { StatusBadge, TipoBadge } from "@/components/modules/estagiarios/status-badge";
import { HistoricoTimeline } from "@/components/modules/estagiarios/historico-timeline";
import { AtivarButton } from "@/components/modules/estagiarios/ativar-button";
import { buscarEstagiarioPorId } from "@/actions/estagiarios";
import { formatDate, formatCPF, secretariaLabel } from "@/lib/utils";
import { ArrowLeft, Calendar, GraduationCap, User, Building } from "lucide-react";

interface PageProps {
  params: { id: string };
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="py-2 grid grid-cols-3 gap-2">
      <dt className="text-sm text-slate-500 font-medium">{label}</dt>
      <dd className="text-sm text-slate-800 col-span-2">{value}</dd>
    </div>
  );
}

export default async function EstagiarioDetailPage({ params }: PageProps) {
  const estagiario = await buscarEstagiarioPorId(params.id);
  if (!estagiario) notFound();

  const hoje = new Date();
  const diasParaFim = Math.ceil(
    (new Date(estagiario.dataFim).getTime() - hoje.getTime()) / 86400000
  );

  return (
    <>
      <Header title={estagiario.nome} />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <Link
          href="/estagiarios"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Estagiários
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-4">
            <section className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{estagiario.nome}</h2>
                  <p className="text-sm text-slate-500 font-mono">{formatCPF(estagiario.cpf)}</p>
                </div>
                <div className="flex gap-2">
                  <TipoBadge tipo={estagiario.tipo} />
                  <StatusBadge status={estagiario.status} />
                </div>
              </div>

              {estagiario.status === "AGUARDANDO_CIDE" && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2 font-medium">
                    Aguardando finalização pelo CIDE
                  </p>
                  <AtivarButton estagiarioId={estagiario.id} nome={estagiario.nome} />
                </div>
              )}

              <div className="border-t border-slate-100 mt-4 divide-y divide-slate-50">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-4 pb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Dados Acadêmicos
                </h3>
                <InfoRow label="Nível" value={estagiario.nivel === "MEDIO" ? "Médio" : "Superior"} />
                <InfoRow label="Curso" value={estagiario.curso} />
                <InfoRow label="Instituição" value={estagiario.instituicaoEnsino} />
                <InfoRow label="Horário" value={estagiario.horario} />

                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-4 pb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Contrato
                </h3>
                <InfoRow label="Vaga" value={`${estagiario.vaga.codigo} — ${secretariaLabel(estagiario.vaga.secretaria)}`} />
                <InfoRow label="Tipo de Vaga" value={estagiario.tipoVaga === "NOVA" ? "Nova" : "Substituição"} />
                {estagiario.estagiarioSubstituidoNome && (
                  <InfoRow label="Substitui" value={estagiario.estagiarioSubstituidoNome} />
                )}
                <InfoRow label="Início" value={formatDate(estagiario.dataInicio)} />
                <InfoRow
                  label="Fim do contrato"
                  value={`${formatDate(estagiario.dataFim)}${diasParaFim <= 30 && estagiario.status === "ATIVO" ? ` (${diasParaFim} dias restantes)` : ""}`}
                />
                <InfoRow label="Limite do contrato" value={formatDate(estagiario.dataLimiteContrato)} />
                <InfoRow label="e-DOC Contratação" value={estagiario.edocContratacao} />

                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-4 pb-2 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> Lotação
                </h3>
                <InfoRow label="Lotação" value={estagiario.lotacao} />
                <InfoRow label="Unidade Gestora" value={estagiario.unidadeGestora} />
                <InfoRow label="Secretaria Interna" value={estagiario.secretariaInterna} />
                <InfoRow label="Atividades" value={estagiario.atividadesDesenvolvidas} />

                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-4 pb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Supervisor
                </h3>
                <InfoRow label="Nome" value={estagiario.supervisorNome} />
                <InfoRow label="Cargo" value={estagiario.supervisorCargo} />
                <InfoRow label="Formação" value={estagiario.supervisorFormacao} />
                <InfoRow label="Ramal" value={estagiario.supervisorRamal} />

                {estagiario.tipo === "ESTAGIDATA" && estagiario.nomeProjeto && (
                  <>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide pt-4 pb-2">
                      Projeto ESTAGIDATA
                    </h3>
                    <InfoRow label="Projeto" value={estagiario.nomeProjeto} />
                    <InfoRow label="Justificativa" value={estagiario.justificativaProjeto} />
                    <InfoRow label="Escopo" value={estagiario.escopoProjeto} />
                    <InfoRow label="Cronograma" value={estagiario.cronogramaProjeto} />
                  </>
                )}

                {estagiario.observacoes && (
                  <div className="py-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Observações</p>
                    <p className="text-sm text-slate-600">{estagiario.observacoes}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Recessos */}
            {estagiario.recessos.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 mb-3">Recessos ({estagiario.recessos.length})</h3>
                <div className="space-y-2">
                  {estagiario.recessos.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                      <span className="font-medium">Recesso {r.numeroRecesso}</span>
                      <span className="text-slate-500">
                        {formatDate(r.dataInicioPeriodo)} → {formatDate(r.dataFimPeriodo)} ({r.quantidadeDias}d)
                      </span>
                      <span className={r.confirmado ? "text-green-600 font-medium" : "text-yellow-600"}>
                        {r.confirmado ? "Confirmado" : "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Renovações */}
            {estagiario.renovacoes.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 mb-3">Renovações ({estagiario.renovacoes.length})</h3>
                <div className="space-y-2">
                  {estagiario.renovacoes.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                      <span>Nova data de fim: <strong>{formatDate(r.dataNovaFim)}</strong></span>
                      <span className="text-slate-500">{r.status.replace(/_/g, " ")}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Desligamento */}
            {estagiario.desligamentos.length > 0 && (
              <section className="bg-white border border-red-100 rounded-xl p-6">
                <h3 className="font-semibold text-red-800 mb-3">Desligamento</h3>
                {estagiario.desligamentos.map((d) => (
                  <div key={d.id} className="text-sm divide-y divide-slate-50">
                    <InfoRow label="Último dia" value={formatDate(d.dataUltimoDia)} />
                    <InfoRow label="Motivo" value={d.motivo.replace(/_/g, " ")} />
                    {d.observacoes && <InfoRow label="Observações" value={d.observacoes} />}
                  </div>
                ))}
              </section>
            )}
          </div>

          {/* Coluna lateral */}
          <div className="space-y-4">
            <section className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Histórico de Ações</h3>
              <HistoricoTimeline items={estagiario.historico} />
            </section>

            {estagiario.status === "ATIVO" && (
              <section className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 mb-3">Ações Rápidas</h3>
                <div className="space-y-1">
                  <Link href={`/recesso?estagiarioId=${estagiario.id}`}
                    className="block text-sm text-slate-700 hover:text-primary px-3 py-2 rounded-lg hover:bg-slate-50 transition">
                    → Registrar Recesso
                  </Link>
                  <Link href={`/renovacao?estagiarioId=${estagiario.id}`}
                    className="block text-sm text-slate-700 hover:text-primary px-3 py-2 rounded-lg hover:bg-slate-50 transition">
                    → Iniciar Renovação
                  </Link>
                  <Link href={`/desligamento?estagiarioId=${estagiario.id}`}
                    className="block text-sm text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50 transition">
                    → Registrar Desligamento
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
