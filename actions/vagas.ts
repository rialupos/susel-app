"use server";

import { prisma } from "@/lib/prisma";

export async function buscarVagasPorSecretaria() {
  const vagas = await prisma.vaga.findMany({
    orderBy: [{ secretaria: "asc" }, { codigo: "asc" }],
    include: {
      estagiarios: {
        where: { status: { in: ["ATIVO", "AGUARDANDO_CIDE"] } },
        select: { id: true, nome: true, status: true, dataInicio: true, dataFim: true },
        take: 1,
      },
    },
  });

  const porSecretaria: Record<string, typeof vagas> = {};
  for (const v of vagas) {
    if (!porSecretaria[v.secretaria]) porSecretaria[v.secretaria] = [];
    porSecretaria[v.secretaria].push(v);
  }
  return porSecretaria;
}

export async function buscarVagaDisponivel() {
  return prisma.vaga.findMany({
    where: { ativa: true },
    orderBy: [{ secretaria: "asc" }, { codigo: "asc" }],
    select: { id: true, codigo: true, secretaria: true },
  });
}

export async function buscarVagaPorId(id: string) {
  return prisma.vaga.findUnique({
    where: { id },
    include: {
      estagiarios: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          nome: true,
          cpf: true,
          status: true,
          dataInicio: true,
          dataFim: true,
          tipo: true,
        },
      },
    },
  });
}
