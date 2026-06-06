"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function criarAvaliacao(estagiarioId: string, periodoAvaliado: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autenticado.");

  const avaliacao = await prisma.avaliacao.create({
    data: { estagiarioId, periodoAvaliado },
  });

  revalidatePath(`/estagiarios/${estagiarioId}`);
  return avaliacao;
}

export async function buscarAvaliacaoPorToken(token: string) {
  return prisma.avaliacao.findUnique({
    where: { token },
    include: {
      estagiario: {
        select: {
          nome: true,
          curso: true,
          horario: true,
          supervisorNome: true,
          dataInicio: true,
          vaga: { select: { secretaria: true } },
        },
      },
    },
  });
}

export async function preencherAvaliacao(token: string, data: {
  assiduidade: string;
  relacionamento: string;
  assimilacao: string;
  iniciativa: string;
  organizacao: string;
  desempenho: string;
  qualidade: string;
  conhecimentos: string;
  tomadaDecisao: string;
  seguranca: string;
  observacoes?: string;
}) {
  const pesos: Record<string, number> = { O: 10, B: 8, M: 6, R: 3 };
  const valores = Object.values(data).filter(v => ["O","B","M","R"].includes(v));
  const soma = valores.reduce((acc, v) => acc + (pesos[v] ?? 0), 0);
  const notaFinal = valores.length > 0 ? soma / 10 : 0;

  const avaliacao = await prisma.avaliacao.update({
    where: { token },
    data: { ...data, notaFinal, preenchidoEm: new Date() },
  });

  revalidatePath(`/estagiarios/${avaliacao.estagiarioId}`);
  return avaliacao;
}

export async function buscarAvaliacoesPorEstagiario(estagiarioId: string) {
  return prisma.avaliacao.findMany({
    where: { estagiarioId },
    orderBy: { createdAt: "desc" },
  });
}
