"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function listarUsuarios() {
  return prisma.usuario.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, email: true, ativo: true, createdAt: true },
  });
}

export async function criarUsuario(data: { nome: string; email: string; senha: string }) {
  const existente = await prisma.usuario.findUnique({ where: { email: data.email } });
  if (existente) throw new Error("E-mail já cadastrado.");

  const senhaHash = await bcrypt.hash(data.senha, 12);
  await prisma.usuario.create({
    data: { nome: data.nome, email: data.email, senhaHash },
  });

  revalidatePath("/configuracoes");
}

export async function alterarSenha(id: string, novaSenha: string) {
  const senhaHash = await bcrypt.hash(novaSenha, 12);
  await prisma.usuario.update({ where: { id }, data: { senhaHash } });
  revalidatePath("/configuracoes");
}

export async function toggleUsuario(id: string, ativo: boolean) {
  await prisma.usuario.update({ where: { id }, data: { ativo } });
  revalidatePath("/configuracoes");
}
