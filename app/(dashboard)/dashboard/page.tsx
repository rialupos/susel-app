import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { OccupationCard } from "@/components/modules/dashboard/occupation-card";
import { AlertPanel } from "@/components/modules/dashboard/alert-panel";
import { HistoryFeed } from "@/components/modules/dashboard/history-feed";
import { AgendaDia } from "@/components/modules/dashboard/agenda-dia";

async function getDashboardData() {
  const hoje = new Date();
  const em30dias = new Date(hoje);
  em30dias.setDate(hoje.getDate() + 30);

  const [configs, vagasAtivas, historico, renovacoesAlerta, contratosAlerta, estagiarios] =
    await Promise.all([
      prisma.configuracaoVagas.findMany({ orderBy: { secretaria: "asc" } }),
      prisma.estagiario.findMany({
        where: { status: "ATIVO" },
        select: { vaga: { select: { secretaria: true } } },
      }),
      prisma.historicoAcao.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          usuario: { select: { nome: true } },
          estagiario: { select: { nome: true } },
        },
      }),
      prisma.estagiario.findMany({
        where: { status: "ATIVO", dataFim: { lte: em30dias } },
        select: {
          id: true,
          nome: true,
          dataFim: true,
          vaga: { select: { secretaria: true, codigo: true } },
        },
        orderBy: { dataFim: "asc" },
      }),
      prisma.estagiario.findMany({
        where: { status: "ATIVO", dataLimiteContrato: { lte: em30dias } },
        select: {
          id: true,
          nome: true,
          dataLimiteContrato: true,
          vaga: { select: { secretaria: true, codigo: true } },
        },
        orderBy: { dataLimiteContrato: "asc" },
      }),
      prisma.estagiario.findMany({
        where: { status: "ATIVO" },
        select: {
          id: true,
          nome: true,
          dataInicio: true,
          dataFim: true,
          renovacoes: { select: { id: true } },
          recessos: { select: { id: true } },
          avaliacoes: { select: { id: true } },
        },
      }),
    ]);

  const ocupadasPorSecretaria: Record<string, number> = {};
  for (const e of vagasAtivas) {
    const s = e.vaga.secretaria;
    ocupadasPorSecretaria[s] = (ocupadasPorSecretaria[s] ?? 0) + 1;
  }

  return { configs, ocupadasPorSecretaria, historico, renovacoesAlerta, contratosAlerta, estagiarios };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const alertCount = data.renovacoesAlerta.length + data.contratosAlerta.length;

  return (
    <>
      <Header title="Dashboard" alertCount={alertCount} />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {alertCount > 0 && (
          <AlertPanel
            renovacoes={data.renovacoesAlerta}
            contratos={data.contratosAlerta}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Ocupacao por Secretaria
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {data.configs.map((config) => (
                  <OccupationCard
                    key={config.id}
                    secretaria={config.secretaria}
                    autorizadas={config.vagasAutorizadas}
                    ocupadas={data.ocupadasPorSecretaria[config.secretaria] ?? 0}
                  />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Ultimas Acoes
              </h3>
              <HistoryFeed items={data.historico} />
            </section>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Agenda do Dia
            </h3>
            <AgendaDia estagiarios={data.estagiarios} />
          </div>
        </div>
      </div>
    </>
  );
}