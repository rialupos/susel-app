"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { MotivoDesligamento } from "@/lib/constants";

async function getUsuarioId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autenticado");
  return (session.user as { id: string }).id;
}

export async function buscarEstagiáriosParaDesligamento() {
  return prisma.estagiario.findMany({
    where: { status: "ATIVO" },
    select: {
      id: true,
      nome: true,
      cpf: true,
      dataInicio: true,
      dataFim: true,
      dataLimiteContrato: true,
      tipo: true,
      vaga: { select: { id: true, codigo: true, secretaria: true } },
    },
    orderBy: { nome: "asc" },
  });
}

export async function registrarDesligamento(input: {
  estagiarioId: string;
  dataUltimoDia: string;
  motivo: MotivoDesligamento;
  observacoes?: string;
}) {
  const usuarioId = await getUsuarioId();

  if (input.motivo !== "TERMINO_CONTRATO" && !input.observacoes?.trim()) {
    throw new Error("Observações são obrigatórias para este motivo de desligamento.");
  }

  const estagiario = await prisma.estagiario.findUnique({
    where: { id: input.estagiarioId },
    select: { status: true, vagaId: true, nome: true },
  });

  if (!estagiario) throw new Error("Estagiário não encontrado.");
  if (estagiario.status !== "ATIVO") throw new Error("Estagiário não está ativo.");

  await prisma.$transaction([
    prisma.desligamento.create({
      data: {
        estagiarioId: input.estagiarioId,
        dataUltimoDia: new Date(input.dataUltimoDia),
        motivo: input.motivo,
        observacoes: input.observacoes,
      },
    }),
    prisma.estagiario.update({
      where: { id: input.estagiarioId },
      data: { status: "DESLIGADO" },
    }),
    prisma.vaga.update({
      where: { id: estagiario.vagaId },
      data: { ativa: true },
    }),
    prisma.historicoAcao.create({
      data: {
        estagiarioId: input.estagiarioId,
        usuarioId,
        acao: "DESLIGAMENTO",
        detalhes: `Desligado em ${new Date(input.dataUltimoDia).toLocaleDateString("pt-BR")}. Motivo: ${input.motivo.replace(/_/g, " ")}${input.observacoes ? ". " + input.observacoes : ""}`,
      },
    }),
  ]);

  revalidatePath("/desligamento");
  revalidatePath("/estagiarios");
  revalidatePath("/vagas");
  revalidatePath(`/estagiarios/${input.estagiarioId}`);
  return { ok: true };
}
