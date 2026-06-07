import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { prisma } from "@/lib/prisma";

async function getAlertCount(): Promise<number> {
  const hoje = new Date();
  const em30dias = new Date(hoje);
  em30dias.setDate(hoje.getDate() + 30);

  const [renovacoes, contratos] = await Promise.all([
    prisma.estagiario.count({
      where: {
        status: "ATIVO",
        dataFim: { lte: em30dias },
      },
    }),
    prisma.estagiario.count({
      where: {
        status: "ATIVO",
        dataLimiteContrato: { lte: em30dias },
      },
    }),
  ]);

  return renovacoes + contratos;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const alertCount = await getAlertCount();

  return (
    <Providers>
      <div className="flex min-h-screen">
        <Sidebar alertCount={alertCount} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </Providers>
  );
}
