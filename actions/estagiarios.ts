"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estagiarioSchema } from "@/lib/validations/estagiario";
import { revalidatePath } from "next/cache";

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Nao autenticado");
  return session;
}

async function registrarHistorico(estagiarioId: string, usuarioId: string, acao: string, detalhes?: string) {
  await prisma.historicoAcao.create({ data: { estagiarioId, usuarioId, acao, detalhes } });
}

export async function criarEstagiario(raw: unknown) {
  const session = await getSession();
  const data = estagiarioSchema.parse(raw);
  const vaga = await prisma.vaga.findUnique({ where: { id: data.vagaId } });
  if (!vaga || !vaga.ativa) throw new Error("Vaga indisponivel");
  const jaOcupada = await prisma.estagiario.findFirst({ where: { vagaId: data.vagaId, status: { in: ["ATIVO", "AGUARDANDO_CIDE", "ENVIADO_CIDE"] } } });
  if (jaOcupada) throw new Error("Vaga ja esta ocupada");
  const cpfLimpo = data.cpf.replace(/\D/g, "");
  const estagiario = await prisma.estagiario.create({
    data: { ...data, cpf: cpfLimpo, status: "AGUARDANDO_CIDE", dataInicio: new Date(data.dataInicio), dataFim: new Date(data.dataFim), dataLimiteContrato: new Date(data.dataLimiteContrato) },
  });
  await registrarHistorico(estagiario.id, (session.user as { id: string }).id, "CADASTRO", `Estagiario cadastrado na vaga ${vaga.codigo}`);
  revalidatePath("/estagiarios");
  return { id: estagiario.id };
}

export async function enviarParaCide(estagiarioId: string) {
  const session = await getSession();
  await prisma.estagiario.update({ where: { id: estagiarioId }, data: { status: "ENVIADO_CIDE" } });
  await registrarHistorico(estagiarioId, (session.user as { id: string }).id, "ENVIO_CIDE", "Contratacao enviada ao Agente Integrador");
  revalidatePath("/estagiarios");
  revalidatePath(`/estagiarios/${estagiarioId}`);
  revalidatePath("/kanban");
  return { ok: true };
}

export async function ativarEstagiario(estagiarioId: string) {
  const session = await getSession();
  const estagiario = await prisma.estagiario.update({ where: { id: estagiarioId }, data: { status: "ATIVO" }, include: { vaga: true } });
  await prisma.vaga.update({ where: { id: estagiario.vagaId }, data: { ativa: false } });
  await registrarHistorico(estagiarioId, (session.user as { id: string }).id, "ATIVACAO", "Contratacao finalizada - estagiario ativado");
  revalidatePath("/estagiarios");
  revalidatePath(`/estagiarios/${estagiarioId}`);
  revalidatePath("/vagas");
  revalidatePath("/kanban");
  return { ok: true };
}

export async function confirmarInicio(estagiarioId: string) {
  const session = await getSession();
  await prisma.estagiario.update({ where: { id: estagiarioId }, data: { status: "INICIADO" } });
  await registrarHistorico(estagiarioId, (session.user as { id: string }).id, "INICIO", "Estagiario confirmou inicio das atividades");
  revalidatePath("/kanban");
  revalidatePath(`/estagiarios/${estagiarioId}`);
  return { ok: true };
}

export async function buscarEstagiarios(filtros: { secretaria?: string; status?: string; tipo?: string; nivel?: string; busca?: string; }) {
  const where: Record<string, unknown> = {};
  if (filtros.status) where.status = filtros.status;
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.nivel) where.nivel = filtros.nivel;
  if (filtros.busca) {
    const term = filtros.busca.replace(/\D/g, "").length >= 5 ? { cpf: { contains: filtros.busca.replace(/\D/g, "") } } : { nome: { contains: filtros.busca, mode: "insensitive" as const } };
    Object.assign(where, term);
  }
  const estagiarios = await prisma.estagiario.findMany({
    where: { ...where, ...(filtros.secretaria ? { vaga: { secretaria: filtros.secretaria } } : {}) },
    include: { vaga: { select: { codigo: true, secretaria: true } } },
    orderBy: { nome: "asc" },
  });
  return estagiarios;
}

export async function buscarEstagiarioPorId(id: string) {
  return prisma.estagiario.findUnique({
    where: { id },
    include: {
      vaga: true,
      recessos: { orderBy: { createdAt: "desc" } },
      renovacoes: { orderBy: { createdAt: "desc" } },
      desligamentos: { orderBy: { createdAt: "desc" } },
      historico: { include: { usuario: { select: { nome: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
}