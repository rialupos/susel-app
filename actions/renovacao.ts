"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { daysBetween } from "@/lib/utils";

async function getUsuarioId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autenticado");
  return (session.user as { id: string }).id;
}

export async function buscarEstagiáriosParaRenovação() {
  const hoje = new Date();
  const em60dias = new Date(hoje);
  em60dias.setDate(hoje.getDate() + 60);

  const estagiarios = await prisma.estagiario.findMany({
    where: { status: "ATIVO", dataFim: { lte: em60dias } },
    include: {
      vaga: { select: { codigo: true, secretaria: true } },
      renovacoes: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { dataFim: "asc" },
  });

  return estagiarios.map((e) => {
    const hoje = new Date();
    const diasParaFim = daysBetween(hoje, new Date(e.dataFim));
    const diasContratoTotal = daysBetween(new Date(e.dataInicio), new Date(e.dataLimiteContrato));
    const diasUsados = daysBetween(new Date(e.dataInicio), hoje);
    const proximoDoLimite = daysBetween(hoje, new Date(e.dataLimiteContrato)) <= 90;
    const atingiu2Anos = diasUsados >= 700; // ~2 anos com margem
    const ultimaRenovacao = e.renovacoes[0] ?? null;

    return {
      ...e,
      diasParaFim,
      proximoDoLimite,
      atingiu2Anos,
      ultimaRenovacao,
      sugerirDesligamento: proximoDoLimite || atingiu2Anos,
    };
  });
}

export async function registrarEnvioCide(input: {
  estagiarioId: string;
  dataNovaFim: string;
  observacoes?: string;
}) {
  const usuarioId = await getUsuarioId();

  const renovacao = await prisma.renovacao.create({
    data: {
      estagiarioId: input.estagiarioId,
      dataNovaFim: new Date(input.dataNovaFim),
      status: "AGUARDANDO_CIDE",
      enviadoCideEm: new Date(),
      observacoes: input.observacoes,
    },
  });

  await prisma.historicoAcao.create({
    data: {
      estagiarioId: input.estagiarioId,
      usuarioId,
      acao: "RENOVACAO",
      detalhes: `Renovação enviada ao CIDE. Nova data de fim proposta: ${new Date(input.dataNovaFim).toLocaleDateString("pt-BR")}`,
    },
  });

  revalidatePath("/renovacao");
  revalidatePath(`/estagiarios/${input.estagiarioId}`);
  return renovacao;
}

export async function registrarRetornoCide(input: {
  renovacaoId: string;
  estagiarioId: string;
  aprovada: boolean;
  observacoes?: string;
}) {
  const usuarioId = await getUsuarioId();

  const renovacao = await prisma.renovacao.findUnique({ where: { id: input.renovacaoId } });
  if (!renovacao) throw new Error("Renovação não encontrada");

  await prisma.renovacao.update({
    where: { id: input.renovacaoId },
    data: {
      status: input.aprovada ? "APROVADA" : "RECUSADA",
      observacoes: input.observacoes,
    },
  });

  if (input.aprovada) {
    await prisma.estagiario.update({
      where: { id: input.estagiarioId },
      data: { dataFim: renovacao.dataNovaFim },
    });
  }

  await prisma.historicoAcao.create({
    data: {
      estagiarioId: input.estagiarioId,
      usuarioId,
      acao: "RENOVACAO",
      detalhes: input.aprovada
        ? `Renovação aprovada pelo CIDE. Nova data de fim: ${renovacao.dataNovaFim.toLocaleDateString("pt-BR")}`
        : `Renovação recusada pelo CIDE.${input.observacoes ? " " + input.observacoes : ""}`,
    },
  });

  revalidatePath("/renovacao");
  revalidatePath(`/estagiarios/${input.estagiarioId}`);
}
