import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { StatusBadge, TipoBadge } from "@/components/modules/estagiarios/status-badge";
import { buscarVagaPorId } from "@/actions/vagas";
import { buscarFilaEspera } from "@/actions/fila-espera";
import { formatDate, formatCPF, secretariaLabel } from "@/lib/utils";
import { ArrowLeft, CheckCircle, XCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilaEsperaSection } from "@/components/modules/vagas/fila-espera-section";

interface PageProps {
  params: { id: string };
}

export default async function VagaDetailPage({ params }: PageProps) {
  const vaga = await buscarVagaPorId(params.id);
  if (!vaga) notFound();

  const fila = await buscarFilaEspera(params.id);

  const estagiarioAtual = vaga.estagiarios.find(
    (e) => e.status === "ATIVO" || e.status === "AGUARDANDO_CIDE"
  );

  return (
    <>
      <Header title={`Vaga ${vaga.codigo}`} />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <Link
          href="/vagas"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Vagas
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info da vaga */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold font-mono text-slate-800">{vaga.codigo}</h2>
                {vaga.ativa ? (
                  <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> Disponível
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                    <XCircle className="w-4 h-4" /> Ocupada
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Secretaria: <span className="font-medium">{secretariaLabel(vaga.secretaria)}</span>
              </p>

              {vaga.ativa && (
                <Link href={`/estagiarios/novo?vagaId=${vaga.id}`}>
                  <Button className="w-full">
                    <PlusCircle className="w-4 h-4" />
                    Iniciar Contratação
                  </Button>
                </Link>
              )}
            </div>

            {/* Estagiário atual */}
            {estagiarioAtual && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Ocupante Atual</h3>
                <Link
                  href={`/estagiarios/${estagiarioAtual.id}`}
                  className="block hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition"
                >
                  <p className="font-medium text-slate-800">{estagiarioAtual.nome}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {formatCPF(estagiarioAtual.cpf)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={estagiarioAtual.status} />
                    <TipoBadge tipo={estagiarioAtual.tipo} />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {formatDate(estagiarioAtual.dataInicio)} → {formatDate(estagiarioAtual.dataFim)}
                  </p>
                </Link>
              </div>
            )}

            {/* Fila de espera */}
            <FilaEsperaSection
              vagaId={vaga.id}
              vagaCodigo={vaga.codigo}
              fila={fila}
              vagaDisponivel={vaga.ativa}
            />
          </div>

          {/* Histórico de ocupação */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-800 mb-4">
                Histórico de Ocupação ({vaga.estagiarios.length} estagiário(s))
              </h3>

              {vaga.estagiarios.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  Esta vaga ainda não foi ocupada.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left pb-3 font-medium text-slate-500">Nome</th>
                        <th className="text-left pb-3 font-medium text-slate-500">Tipo</th>
                        <th className="text-left pb-3 font-medium text-slate-500">Período</th>
                        <th className="text-left pb-3 font-medium text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {vaga.estagiarios.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50">
                          <td className="py-3">
                            <Link
                              href={`/estagiarios/${e.id}`}
                              className="font-medium text-slate-800 hover:text-primary"
                            >
                              {e.nome}
                            </Link>
                            <p className="text-xs text-slate-400 font-mono">{formatCPF(e.cpf)}</p>
                          </td>
                          <td className="py-3">
                            <TipoBadge tipo={e.tipo} />
                          </td>
                          <td className="py-3 text-slate-600 text-xs">
                            {formatDate(e.dataInicio)} → {formatDate(e.dataFim)}
                          </td>
                          <td className="py-3">
                            <StatusBadge status={e.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
