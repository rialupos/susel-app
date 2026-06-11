"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Nao autenticado");
  return session;
}

async function excluirExpirados() {
  const limite = new Date();
  limite.setFullYear(limite.getFullYear() - 1);
  await prisma.talento.deleteMany({
    where: { createdAt: { lte: limite } },
  });
}

export async function buscarTalentos(filtros: {
  area?: string;
  busca?: string;
}) {
  await excluirExpirados();
  const where: Record<string, unknown> = {};
  if (filtros.area) where.area = filtros.area;
  if (filtros.busca) where.nome = { contains: filtros.busca, mode: "insensitive" };
  return prisma.talento.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nome: true,
      instituicaoEnsino: true,
      semestre: true,
      area: true,
      curriculoNome: true,
      createdAt: true,
    },
  });
}

export async function cadastrarTalento(formData: FormData) {
  await getSession();
  const nome = formData.get("nome") as string;
  const instituicaoEnsino = formData.get("instituicaoEnsino") as string;
  const semestre = formData.get("semestre") as string;
  const area = formData.get("area") as string;
  const arquivo = formData.get("curriculo") as File | null;

  if (!nome || !instituicaoEnsino || !semestre || !area) {
    throw new Error("Preencha todos os campos obrigatorios.");
  }

  let curriculo: Buffer | undefined;
  let curriculoNome: string | undefined;

  if (arquivo && arquivo.size > 0) {
    const bytes = await arquivo.arrayBuffer();
    curriculo = Buffer.from(bytes);
    curriculoNome = arquivo.name;
  }

  await prisma.talento.create({
    data: { nome, instituicaoEnsino, semestre, area, curriculo, curriculoNome },
  });

  revalidatePath("/talentos");
}

export async function excluirTalento(id: string) {
  await getSession();
  await prisma.talento.delete({ where: { id } });
  revalidatePath("/talentos");
}

export async function buscarCurriculoPorId(id: string) {
  return prisma.talento.findUnique({
    where: { id },
    select: { curriculo: true, curriculoNome: true },
  });
}