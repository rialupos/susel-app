"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { daysBetween, isMondayToWednesday } from "@/lib/utils";

async function getUsuarioId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autenticado");
  return (session.user as { id: string }).id;
}

export interface ValidacaoRecessoResult {
  elegivel: boolean;
  proximoNumero: number;
  erros: string[];
  diasDesdeInicio: number;
  diasParaElegibilidade?: number;
}

export async function validarElegibilidadeRecesso(
  estagiarioId: string
): Promise<ValidacaoRecessoResult> {
  const estagiario = await prisma.estagiario.findUnique({
    where: { id: estagiarioId },
    include: { recessos: { orderBy: { numeroRecesso: "asc" } } },
  });

  if (!estagiario) throw new Error("Estagiário não encontrado");
  if (estagiario.status !== "ATIVO")
    return { elegivel: false, proximoNumero: 0, erros: ["Estagiário não está ativo."], diasDesdeInicio: 0 };

  const hoje = new Date();
  const diasDesdeInicio = daysBetween(new Date(estagiario.dataInicio), hoje);
  const recessosConfirmados = estagiario.recessos.filter((r) => r.confirmado);
  const recessosPendentes = estagiario.recessos.filter((r) => !r.confirmado);
  const proximoNumero = recessosPendentes.length > 0
    ? recessosPendentes[0].numeroRecesso
    : recessosConfirmados.length + 1;
  const erros: string[] = [];

  if (recessosPendentes.length > 0) {
    return {
      elegivel: false,
      proximoNumero,
      erros: [`Já existe o Recesso ${proximoNumero} pendente de confirmação.`],
      diasDesdeInicio,
    };
  }

  if (recessosConfirmados.length >= 2) {
    return { elegivel: false, proximoNumero: 0, erros: ["Máximo de 2 recessos já utilizados."], diasDesdeInicio };
  }

  if (proximoNumero === 1) {
    if (diasDesdeInicio < 365) {
      const faltam = 365 - diasDesdeInicio;
      erros.push(`Recesso 1 exige 1 ano de contrato. Faltam ${faltam} dia(s).`);
      return { elegivel: false, proximoNumero, erros, diasDesdeInicio, diasParaElegibilidade: faltam };
    }
  } else if (proximoNumero === 2) {
    if (recessosConfirmados.length < 1) {
      erros.push("O Recesso 1 precisa estar confirmado antes de solicitar o Recesso 2.");
    }
    if (diasDesdeInicio < 730) {
      const faltam = 730 - diasDesdeInicio;
      erros.push(`Recesso 2 exige 2 anos de contrato. Faltam ${faltam} dia(s).`);
      return { elegivel: false, proximoNumero, erros, diasDesdeInicio, diasParaElegibilidade: faltam };
    }
  }

  return { elegivel: erros.length === 0, proximoNumero, erros, diasDesdeInicio };
}

export async function registrarRecesso(input: {
  estagiarioId: string;
  dataInicioPeriodo: string;
  dataFimPeriodo: string;
  quantidadeDias: number;
  observacoes?: string;
}) {
  const usuarioId = await getUsuarioId();

  const elegibilidade = await validarElegibilidadeRecesso(input.estagiarioId);
  if (!elegibilidade.elegivel) {
    throw new Error(elegibilidade.erros[0]);
  }

  const dataInicio = new Date(input.dataInicioPeriodo);
  if (!isMondayToWednesday(dataInicio)) {
    throw new Error("O início do recesso deve ser em dia útil (segunda a quarta-feira).");
  }

  const recesso = await prisma.recesso.create({
    data: {
      estagiarioId: input.estagiarioId,
      numeroRecesso: elegibilidade.proximoNumero,
      dataInicioPeriodo: new Date(input.dataInicioPeriodo),
      dataFimPeriodo: new Date(input.dataFimPeriodo),
      quantidadeDias: input.quantidadeDias,
      observacoes: input.observacoes,
      confirmado: false,
    },
  });

  await prisma.historicoAcao.create({
    data: {
      estagiarioId: input.estagiarioId,
      usuarioId,
      acao: "RECESSO",
      detalhes: `Recesso ${elegibilidade.proximoNumero} registrado: ${new Date(input.dataInicioPeriodo).toLocaleDateString("pt-BR")} a ${new Date(input.dataFimPeriodo).toLocaleDateString("pt-BR")} (${input.quantidadeDias} dias)`,
    },
  });

  revalidatePath("/recesso");
  revalidatePath(`/estagiarios/${input.estagiarioId}`);
  return recesso;
}

export async function confirmarRecesso(recessoId: string) {
  const usuarioId = await getUsuarioId();

  const recesso = await prisma.recesso.update({
    where: { id: recessoId },
    data: { confirmado: true },
  });

  await prisma.historicoAcao.create({
    data: {
      estagiarioId: recesso.estagiarioId,
      usuarioId,
      acao: "RECESSO",
      detalhes: `Recesso ${recesso.numeroRecesso} confirmado pela SUSEL`,
    },
  });

  revalidatePath("/recesso");
  revalidatePath(`/estagiarios/${recesso.estagiarioId}`);
  return recesso;
}

export async function buscarRecessosPendentes() {
  return prisma.recesso.findMany({
    where: { confirmado: false },
    include: {
      estagiario: {
        select: { id: true, nome: true, vaga: { select: { codigo: true, secretaria: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function buscarEstagiáriosAtivos() {
  return prisma.estagiario.findMany({
    where: { status: "ATIVO" },
    select: {
      id: true,
      nome: true,
      dataInicio: true,
      dataFim: true,
      vaga: { select: { codigo: true, secretaria: true } },
      recessos: { select: { id: true, numeroRecesso: true, confirmado: true } },
    },
    orderBy: { nome: "asc" },
  });
}
