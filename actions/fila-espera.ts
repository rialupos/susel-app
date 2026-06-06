"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function buscarFilaEspera(vagaId: string) {
  return prisma.filaEspera.findMany({
    where: { vagaId },
    orderBy: { posicao: "asc" },
  });
}

export async function adicionarNaFila(vagaId: string, data: {
  nome: string;
  contato?: string;
  observacoes?: string;
}) {
  const ultima = await prisma.filaEspera.findFirst({
    where: { vagaId },
    orderBy: { posicao: "desc" },
  });

  await prisma.filaEspera.create({
    data: {
      vagaId,
      nome: data.nome,
      contato: data.contato,
      observacoes: data.observacoes,
      posicao: (ultima?.posicao ?? 0) + 1,
    },
  });

  revalidatePath(`/vagas/${vagaId}`);
}

export async function removerDaFila(id: string, vagaId: string) {
  await prisma.filaEspera.delete({ where: { id } });
  
  // Reordenar posições
  const restantes = await prisma.filaEspera.findMany({
    where: { vagaId },
    orderBy: { posicao: "asc" },
  });

  for (let i = 0; i < restantes.length; i++) {
    await prisma.filaEspera.update({
      where: { id: restantes[i].id },
      data: { posicao: i + 1 },
    });
  }

  revalidatePath(`/vagas/${vagaId}`);
}
