import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IniciarButton } from "@/components/modules/kanban/iniciar-button";

async function getContratacoes() {
  return await prisma.estagiario.findMany({
    where: { status: { in: ["AGUARDANDO_CIDE", "ENVIADO_CIDE", "ATIVO"] } },
    include: { vaga: { select: { codigo: true, secretaria: true } } },
    orderBy: { createdAt: "asc" },
  });
}

function diasNaEtapa(data: Date) {
  const diff = Date.now() - new Date(data).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default async function KanbanPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const contratacoes = await getContratacoes();
  const aguardando = contratacoes.filter((e) => e.status === "AGUARDANDO_CIDE");
  const enviados = contratacoes.filter((e) => e.status === "ENVIADO_CIDE");
  const aptos = contratacoes.filter((e) => e.status === "ATIVO" && new Date(e.dataInicio) >= new Date());

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contratacoes em Andamento</h1>
        <p className="text-gray-500 mt-1">Acompanhe o fluxo de cada contratacao</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Coluna 1 - Cadastrado */}
        <div className="bg-white rounded-xl shadow-sm border-t-4 border-yellow-400 border border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="font-semibold text-gray-700 text-sm">Cadastrado no Sistema</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">{aguardando.length}</span>
            </div>
            <p className="text-xs text-gray-400">Aguardando envio ao CIDE</p>
          </div>
          <div className="p-3 space-y-2 flex-1">
            {aguardando.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Nenhuma contratacao aqui.</p>
            ) : (
              aguardando.map((e) => (
                <Link href={`/estagiarios/${e.id}`} key={e.id} className="block bg-gray-50 hover:bg-yellow-50 border border-gray-200 rounded-lg p-3 transition-colors">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-yellow-400" />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{e.nome}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{e.vaga.secretaria} — {e.vaga.codigo}</p>
                      <p className="text-xs text-gray-400 mt-1">{diasNaEtapa(e.updatedAt)} dias nesta etapa</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2 - Enviado ao CIDE */}
        <div className="bg-white rounded-xl shadow-sm border-t-4 border-blue-400 border border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="font-semibold text-gray-700 text-sm">Enviado ao Ag. Integrador</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{enviados.length}</span>
            </div>
            <p className="text-xs text-gray-400">Contrato em elaboracao</p>
          </div>
          <div className="p-3 space-y-2 flex-1">
            {enviados.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Nenhuma contratacao aqui.</p>
            ) : (
              enviados.map((e) => (
                <Link href={`/estagiarios/${e.id}`} key={e.id} className="block bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg p-3 transition-colors">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-blue-400" />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{e.nome}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{e.vaga.secretaria} — {e.vaga.codigo}</p>
                      <p className="text-xs text-gray-400 mt-1">{diasNaEtapa(e.updatedAt)} dias nesta etapa</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Coluna 3 - Apto para Inicio */}
        <div className="bg-white rounded-xl shadow-sm border-t-4 border-green-400 border border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="font-semibold text-gray-700 text-sm">Apto para Inicio</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">{aptos.length}</span>
            </div>
            <p className="text-xs text-gray-400">Contrato assinado</p>
          </div>
          <div className="p-3 space-y-2 flex-1">
            {aptos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Nenhuma contratacao aqui.</p>
            ) : (
              aptos.map((e) => (
                <div key={e.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-green-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{e.nome}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{e.vaga.secretaria} — {e.vaga.codigo}</p>
                      <p className="text-xs text-gray-400 mt-1">{diasNaEtapa(e.updatedAt)} dias nesta etapa</p>
                      <IniciarButton estagiarioId={e.id} nome={e.nome} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}