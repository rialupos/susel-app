import { z } from "zod";

export const estagiarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  cpf: z
    .string()
    .min(11, "CPF inválido")
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido"),
  vagaId: z.string().uuid("Selecione uma vaga"),
  nivel: z.enum(["MEDIO", "SUPERIOR"]),
  curso: z.string().min(2, "Informe o curso"),
  horario: z.string().min(2, "Informe o horário"),
  instituicaoEnsino: z.string().min(2, "Informe a instituição"),
  tipoVaga: z.enum(["NOVA", "SUBSTITUICAO"]),
  estagiarioSubstituidoNome: z.string().optional(),
  dataInicio: z.string().min(1, "Informe a data de início"),
  dataFim: z.string().min(1, "Informe a data de fim"),
  dataLimiteContrato: z.string().min(1, "Informe a data limite do contrato"),
  tipo: z.enum(["REGULAR", "ESTAGIDATA", "PCD", "SUBSTITUTO"]),
  lotacao: z.string().min(2, "Informe a lotação"),
  supervisorNome: z.string().min(2, "Informe o nome do supervisor"),
  supervisorFormacao: z.string().optional(),
  supervisorCargo: z.string().optional(),
  supervisorRamal: z.string().optional(),
  unidadeGestora: z.string().min(2, "Informe a unidade gestora"),
  secretariaInterna: z.string().optional(),
  atividadesDesenvolvidas: z.string().optional(),
  edocContratacao: z.string().optional(),
  observacoes: z.string().optional(),
  // Campos ESTAGIDATA
  nomeProjeto: z.string().optional(),
  justificativaProjeto: z.string().optional(),
  escopoProjeto: z.string().optional(),
  cronogramaProjeto: z.string().optional(),
});

export type EstagiarioInput = z.infer<typeof estagiarioSchema>;

export const filtroEstagiarioSchema = z.object({
  secretaria: z.string().optional(),
  status: z.string().optional(),
  tipo: z.string().optional(),
  nivel: z.string().optional(),
  busca: z.string().optional(),
});
