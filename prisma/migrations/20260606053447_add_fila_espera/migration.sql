-- CreateTable
CREATE TABLE "FilaEspera" (
    "id" TEXT NOT NULL,
    "vagaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "contato" TEXT,
    "observacoes" TEXT,
    "posicao" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilaEspera_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FilaEspera" ADD CONSTRAINT "FilaEspera_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Vaga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
