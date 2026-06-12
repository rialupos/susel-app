const fs = require('fs');

const content = `import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { OccupationCard } from "@/components/modules/dashboard/occupation-card";
import { AlertPanel } from "@/components/modules/dashboard/alert-panel";
import { HistoryFeed } from "@/components/modules/dashboard/history-feed";
import { AgendaDia } from "@/components/modules/dashboard/agenda-dia";
import Link from "next/link";
import { ClipboardList } from "lucide-react";

async function getDashboardData(perfil: string) {
  const hoje = new Date();
  const em30dias = new Date(hoje);
  em30dias.setDate(hoje.getDate() + 30);

  const [configs, vagasAtivas, historico, renovacoesAlerta, contratosAlerta, estagiarios, pendentesSupel] =
    await Promise.all([
      prisma.configuracaoVagas.findMany({ orderBy: { secretaria: "asc" } }),
      prisma.estagiario.findMany({
        where: { status: "ATIVO" },
        select: { vaga: { select: { secretaria: true } } },
      }),
      prisma.historicoAcao.findMany({
        take: 5,
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
          vaga: { select: { codigo: true, secretaria: true } },
          dataInicio: true,
          dataFim: true,
          renovacoes: { select: { id: true } },
          recessos: { select: { id: true } },
          avaliacoes: { select: { id: true } },
        },
      }),
      perfil !== "GRANDE_AREA" ? prisma.estagiario.findMany({
        where: { status: "AGUARDANDO_CIDE" },
        select: {
          id: true,
          nome: true,
          createdAt: true,
          vaga: { select: { codigo: true, secretaria: true } },
        },
        orderBy: { createdAt: "desc" },
      }) : Promise.resolve([]),
    ]);

  const ocupadasPorSecretaria: Record<string, number> = {};
  for (const e of vagasAtivas) {
    const s = e.vaga.secretaria;
    ocupadasPorSecretaria[s] = (ocupadasPorSecretaria[s] ?? 0) + 1;
  }

  return { configs, ocupadasPorSecretaria, historico, renovacoesAlerta, contratosAlerta, estagiarios, pendentesSupel };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const perfil = (session?.user as any)?.perfil ?? "SUSEL";
  const data = await getDashboardData(perfil);
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

        {perfil !== "GRANDE_AREA" && data.pendentesSupel.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">
                {data.pendentesSupel.length} contratacao(s) aguardando envio ao CIDE
              </h3>
            </div>
            <div className="space-y-2">
              {data.pendentesSupel.map((e) => (
                <Link
                  key={e.id}
                  href={\`/estagiarios/\${e.id}\`}
                  className="flex items-center justify-between p-3 bg-white border border-orange-100 rounded-lg hover:border-orange-300 transition"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{e.nome}</p>
                    <p className="text-xs text-slate-500">{e.vaga.codigo} / {e.vaga.secretaria}</p>
                  </div>
                  <span className="text-xs text-orange-600 font-medium">Aguardando CIDE →</span>
                </Link>
              ))}
            </div>
          </div>
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  Ultimas Acoes
                </h3>
                <Link href="/atividades" className="text-xs text-primary hover:underline">
                  Ver todas →
                </Link>
              </div>
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
`;

fs.writeFileSync('app/(dashboard)/dashboard/page.tsx', content);
console.log('OK4');