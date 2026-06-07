export const MOTIVOS_DESLIGAMENTO = [
  { value: "TERMINO_CONTRATO", label: "Término de contrato" },
  { value: "INICIATIVA_ESTAGIARIO", label: "Iniciativa do estagiário" },
  { value: "INICIATIVA_TCDF", label: "Iniciativa do TCDF" },
  { value: "OUTROS", label: "Outros" },
] as const;

export type MotivoDesligamento = (typeof MOTIVOS_DESLIGAMENTO)[number]["value"];
