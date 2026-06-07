-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracaoVagas" (
    "id" TEXT NOT NULL,
    "secretaria" TEXT NOT NULL,
    "vagasAutorizadas" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoVagas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaga" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "secretaria" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estagiario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "vagaId" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "instituicaoEnsino" TEXT NOT NULL,
    "tipoVaga" TEXT NOT NULL,
    "estagiarioSubstituidoNome" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "dataLimiteContrato" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AGUARDANDO_CIDE',
    "tipo" TEXT NOT NULL DEFAULT 'REGULAR',
    "lotacao" TEXT NOT NULL,
    "supervisorNome" TEXT NOT NULL,
    "supervisorFormacao" TEXT,
    "supervisorCargo" TEXT,
    "supervisorRamal" TEXT,
    "unidadeGestora" TEXT NOT NULL,
    "secretariaInterna" TEXT,
    "atividadesDesenvolvidas" TEXT,
    "edocContratacao" TEXT,
    "observacoes" TEXT,
    "nomeProjeto" TEXT,
    "justificativaProjeto" TEXT,
    "escopoProjeto" TEXT,
    "cronogramaProjeto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estagiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recesso" (
    "id" TEXT NOT NULL,
    "estagiarioId" TEXT NOT NULL,
    "numeroRecesso" INTEGER NOT NULL,
    "dataInicioPeriodo" TIMESTAMP(3) NOT NULL,
    "dataFimPeriodo" TIMESTAMP(3) NOT NULL,
    "quantidadeDias" INTEGER NOT NULL,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Renovacao" (
    "id" TEXT NOT NULL,
    "estagiarioId" TEXT NOT NULL,
    "dataNovaFim" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AGUARDANDO_CIDE',
    "observacoes" TEXT,
    "enviadoCideEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Renovacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Desligamento" (
    "id" TEXT NOT NULL,
    "estagiarioId" TEXT NOT NULL,
    "dataUltimoDia" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Desligamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoAcao" (
    "id" TEXT NOT NULL,
    "estagiarioId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "detalhes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoAcao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracaoVagas_secretaria_key" ON "ConfiguracaoVagas"("secretaria");

-- CreateIndex
CREATE UNIQUE INDEX "Vaga_codigo_key" ON "Vaga"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Estagiario_cpf_key" ON "Estagiario"("cpf");

-- AddForeignKey
ALTER TABLE "Estagiario" ADD CONSTRAINT "Estagiario_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Vaga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recesso" ADD CONSTRAINT "Recesso_estagiarioId_fkey" FOREIGN KEY ("estagiarioId") REFERENCES "Estagiario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renovacao" ADD CONSTRAINT "Renovacao_estagiarioId_fkey" FOREIGN KEY ("estagiarioId") REFERENCES "Estagiario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Desligamento" ADD CONSTRAINT "Desligamento_estagiarioId_fkey" FOREIGN KEY ("estagiarioId") REFERENCES "Estagiario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoAcao" ADD CONSTRAINT "HistoricoAcao_estagiarioId_fkey" FOREIGN KEY ("estagiarioId") REFERENCES "Estagiario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoAcao" ADD CONSTRAINT "HistoricoAcao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
