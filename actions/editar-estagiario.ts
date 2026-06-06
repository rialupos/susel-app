"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function editarEstagiario(id: string, data: {
  nome: string;
  cpf: string;
  nivel: string;
  curso: string;
  horario: string;
  instituicaoEnsino: string;
  tipoVaga: string;
  estagiarioSubstituidoNome?: string;
  dataInicio: string;
  dataFim: string;
  dataLimiteContrato: string;
  lotacao: string;
  unidadeGestora: string;
  secretariaInterna?: string;
  atividadesDesenvolvidas?: string;
  edocContratacao?: string;
  observacoes?: string;
  supervisorNome: string;
  supervisorCargo?: string;
  supervisorFormacao?: string;
  supervisorRamal?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autenticado.");

  const cpfLimpo = data.cpf.replace(/\D/g, "");

  // Verificar se CPF já existe em outro estagiário
  const existente = await prisma.estagiario.findFirst({
    where: { cpf: cpfLimpo, NOT: { id } },
  });
  if (existente) throw new Error("CPF já cadastrado em outro estagiário.");

  await prisma.estagiario.update({
    where: { id },
    data: {
      nome: data.nome,
      cpf: cpfLimpo,
      nivel: data.nivel,
      curso: data.curso,
      horario: data.horario,
      instituicaoEnsino: data.instituicaoEnsino,
      tipoVaga: data.tipoVaga,
      estagiarioSubstituidoNome: data.estagiarioSubstituidoNome || null,
      dataInicio: new Date(data.dataInicio),
      dataFim: new Date(data.dataFim),
      dataLimiteContrato: new Date(data.dataLimiteContrato),
      lotacao: data.lotacao,
      unidadeGestora: data.unidadeGestora,
      secretariaInterna: data.secretariaInterna || null,
      atividadesDesenvolvidas: data.atividadesDesenvolvidas || null,
      edocContratacao: data.edocContratacao || null,
      observacoes: data.observacoes || null,
      supervisorNome: data.supervisorNome,
      supervisorCargo: data.supervisorCargo || null,
      supervisorFormacao: data.supervisorFormacao || null,
      supervisorRamal: data.supervisorRamal || null,
    },
  });

  await prisma.historicoAcao.create({
    data: {
      estagiarioId: id,
      usuarioId: (session.user as any).id,
      acao: "EDICAO",
      detalhes: "Cadastro editado manualmente.",
    },
  });

  revalidatePath(`/estagiarios/${id}`);
}
