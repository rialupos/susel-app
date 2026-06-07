"use server";

import { prisma } from "@/lib/prisma";
import { secretariaLabel } from "@/lib/utils";

const SECRETARIAS = ["SEGEDAM", "SEGECEX", "PRESIDENCIA", "GABINETES", "ESTAGIDATA", "PCD"];

export async function buscarDadosAtivos() {
  const estagiarios = await prisma.estagiario.findMany({
    where: { status: "ATIVO" },
    select: {
      nome: true,
      lotacao: true,
      supervisorNome: true,
      dataInicio: true,
      dataFim: true,
      vaga: { select: { codigo: true, secretaria: true } },
    },
    orderBy: [{ vaga: { secretaria: "asc" } }, { nome: "asc" }],
  });

  const grupos = SECRETARIAS.map((sec) => ({
    secretaria: sec,
    label: secretariaLabel(sec),
    estagiarios: estagiarios
      .filter((e) => e.vaga.secretaria === sec)
      .map((e) => ({
        nome: e.nome,
        vagaCodigo: e.vaga.codigo,
        lotacao: e.lotacao,
        supervisorNome: e.supervisorNome,
        dataInicio: e.dataInicio,
        dataFim: e.dataFim,
      })),
  })).filter((g) => g.estagiarios.length > 0);

  return { grupos, total: estagiarios.length };
}

export async function buscarDadosEntradasSaidas(mes: number, ano: number) {
  const inicio = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0, 23, 59, 59);

  const [estagiarios, desligamentos] = await Promise.all([
    prisma.estagiario.findMany({
      where: { dataInicio: { gte: inicio, lte: fim } },
      select: {
        nome: true,
        dataInicio: true,
        vaga: { select: { codigo: true, secretaria: true } },
      },
      orderBy: { dataInicio: "asc" },
    }),
    prisma.desligamento.findMany({
      where: { dataUltimoDia: { gte: inicio, lte: fim } },
      select: {
        dataUltimoDia: true,
        motivo: true,
        estagiario: {
          select: { nome: true, vaga: { select: { codigo: true, secretaria: true } } },
        },
      },
      orderBy: { dataUltimoDia: "asc" },
    }),
  ]);

  return {
    mes,
    ano,
    entradas: estagiarios.map((e) => ({
      nome: e.nome,
      vagaCodigo: e.vaga.codigo,
      secretariaLabel: secretariaLabel(e.vaga.secretaria),
      dataInicio: e.dataInicio,
    })),
    saidas: desligamentos.map((d) => ({
      nome: d.estagiario.nome,
      vagaCodigo: d.estagiario.vaga.codigo,
      secretariaLabel: secretariaLabel(d.estagiario.vaga.secretaria),
      dataUltimoDia: d.dataUltimoDia,
      motivo: d.motivo,
    })),
  };
}

export async function buscarDadosExpirando(dias: number) {
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);

  const estagiarios = await prisma.estagiario.findMany({
    where: { status: "ATIVO", dataFim: { lte: limite } },
    select: {
      nome: true,
      dataFim: true,
      vaga: { select: { codigo: true, secretaria: true } },
    },
    orderBy: { dataFim: "asc" },
  });

  return {
    dias,
    estagiarios: estagiarios.map((e) => ({
      nome: e.nome,
      vagaCodigo: e.vaga.codigo,
      secretariaLabel: secretariaLabel(e.vaga.secretaria),
      dataFim: e.dataFim,
      diasRestantes: Math.max(
        0,
        Math.floor((e.dataFim.getTime() - hoje.getTime()) / 86400000)
      ),
    })),
  };
}

export async function buscarDadosHistorico(estagiarioId: string) {
  const e = await prisma.estagiario.findUnique({
    where: { id: estagiarioId },
    include: {
      vaga: true,
      recessos: { orderBy: { createdAt: "asc" } },
      renovacoes: { orderBy: { createdAt: "asc" } },
      desligamentos: { orderBy: { createdAt: "asc" } },
      historico: {
        orderBy: { createdAt: "asc" },
        include: { usuario: { select: { nome: true } } },
      },
    },
  });

  if (!e) throw new Error("Estagiário não encontrado");

  return {
    ...e,
    vaga: { ...e.vaga, secretariaLabel: secretariaLabel(e.vaga.secretaria) },
  };
}

export async function buscarDadosQuantitativo() {
  const [configs, vagas] = await Promise.all([
    prisma.configuracaoVagas.findMany(),
    prisma.vaga.findMany({ select: { secretaria: true, ativa: true } }),
  ]);

  const configMap = Object.fromEntries(
    configs.map((c) => [c.secretaria, c.vagasAutorizadas])
  );

  const linhas = SECRETARIAS.map((sec) => {
    const vs = vagas.filter((v) => v.secretaria === sec);
    return {
      secretaria: sec,
      label: secretariaLabel(sec),
      autorizadas: configMap[sec] ?? 0,
      total: vs.length,
      ocupadas: vs.filter((v) => !v.ativa).length,
      disponiveis: vs.filter((v) => v.ativa).length,
    };
  });

  const totais = linhas.reduce(
    (acc, l) => ({
      autorizadas: acc.autorizadas + l.autorizadas,
      total: acc.total + l.total,
      ocupadas: acc.ocupadas + l.ocupadas,
      disponiveis: acc.disponiveis + l.disponiveis,
    }),
    { autorizadas: 0, total: 0, ocupadas: 0, disponiveis: 0 }
  );

  return { linhas, totais };
}
