import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function range(prefix: string, start: number, end: number): string[] {
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const num = String(start + i).padStart(3, "0");
    return `${prefix}${num}`;
  });
}

async function main() {
  console.log("🌱 Iniciando seed...");

  // Admin
  const senhaHash = await bcrypt.hash("admin123", 12);
  await prisma.usuario.upsert({
    where: { email: "admin@tcdf.gov.br" },
    update: {},
    create: {
      nome: "Administrador SUSEL",
      email: "admin@tcdf.gov.br",
      senhaHash,
    },
  });
  console.log("✅ Usuário admin criado");

  // Configuração de vagas
  const configs = [
    { secretaria: "SEGEDAM", vagasAutorizadas: 59 },
    { secretaria: "SEGECEX", vagasAutorizadas: 20 },
    { secretaria: "PRESIDENCIA", vagasAutorizadas: 25 },
    { secretaria: "GABINETES", vagasAutorizadas: 36 },
    { secretaria: "ESTAGIDATA", vagasAutorizadas: 0 },
    { secretaria: "PCD", vagasAutorizadas: 0 },
  ];

  for (const config of configs) {
    await prisma.configuracaoVagas.upsert({
      where: { secretaria: config.secretaria },
      update: { vagasAutorizadas: config.vagasAutorizadas },
      create: { ...config },
    });
  }
  console.log("✅ Configurações de vagas criadas");

  // Vagas
  const vagas: { codigo: string; secretaria: string }[] = [
    ...range("SGD", 1, 59).map((c) => ({ codigo: c, secretaria: "SEGEDAM" })),
    ...range("SCE", 1, 20).map((c) => ({ codigo: c, secretaria: "SEGECEX" })),
    ...range("PRS", 1, 25).map((c) => ({ codigo: c, secretaria: "PRESIDENCIA" })),
    // GABINETES — códigos reais (10 vagas por ora)
    { codigo: "MM001", secretaria: "GABINETES" },
    { codigo: "MM002", secretaria: "GABINETES" },
    { codigo: "RR001", secretaria: "GABINETES" },
    { codigo: "RR002", secretaria: "GABINETES" },
    { codigo: "IM001", secretaria: "GABINETES" },
    { codigo: "IM002", secretaria: "GABINETES" },
    { codigo: "AL001", secretaria: "GABINETES" },
    { codigo: "AL002", secretaria: "GABINETES" },
    { codigo: "CA001", secretaria: "GABINETES" },
    { codigo: "CA002", secretaria: "GABINETES" },
    ...range("PJE", 1, 10).map((c) => ({ codigo: c, secretaria: "ESTAGIDATA" })),
    ...range("PCD", 1, 6).map((c) => ({ codigo: c, secretaria: "PCD" })),
  ];

  let vagasCriadas = 0;
  for (const vaga of vagas) {
    await prisma.vaga.upsert({
      where: { codigo: vaga.codigo },
      update: {},
      create: { ...vaga },
    });
    vagasCriadas++;
  }
  console.log(`✅ ${vagasCriadas} vagas criadas`);

  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
