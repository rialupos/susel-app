import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getAvaliacoes() {
  return await prisma.avaliacao.findMany({
    include: {
      estagiario: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AvaliacoesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const avaliacoes = await getAvaliacoes();
  const pendentes = avaliacoes.filter((a) => !a.preenchidoEm);
  const concluidas = avaliacoes.filter((a) => a.preenchidoEm);
  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Avaliacoes Semestrais</h1>
        <p className="text-gray-500 mt-1">Acompanhe as avaliacoes enviadas aos supervisores</p>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Pendentes ({pendentes.length})</h2>
        {pendentes.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma avaliacao pendente.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estagiario</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Unidade</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Periodo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendentes.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/estagiarios/${a.estagiario.id}`} className="text-blue-600 hover:underline font-medium">{a.estagiario.nome}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.estagiario.unidade}</td>
                    <td className="px-4 py-3 text-gray-600">{a.periodoAvaliado}</td>
                    <td className="px-4 py-3">
                      <a href={`/avaliar/${a.token}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Abrir formulario</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Concluidas ({concluidas.length})</h2>
        {concluidas.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma avaliacao concluida ainda.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estagiario</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Unidade</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Periodo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nota Final</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Preenchido em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {concluidas.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/estagiarios/${a.estagiario.id}`} className="text-blue-600 hover:underline font-medium">{a.estagiario.nome}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.estagiario.unidade}</td>
                    <td className="px-4 py-3 text-gray-600">{a.periodoAvaliado}</td>
                    <td className="px-4 py-3"><span className="font-semibold text-green-600">{a.notaFinal != null ? a.notaFinal.toFixed(1) : "---"}</span></td>
                    <td className="px-4 py-3 text-gray-600">{a.preenchidoEm ? new Date(a.preenchidoEm).toLocaleDateString("pt-BR") : "---"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
