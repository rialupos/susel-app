import { Badge } from "@/components/ui/badge";

const statusConfig = {
  ATIVO: { label: "Ativo", variant: "success" as const },
  AGUARDANDO_CIDE: { label: "Aguardando CIDE", variant: "warning" as const },
  DESLIGADO: { label: "Desligado", variant: "danger" as const },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? {
    label: status,
    variant: "default" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const tipoConfig = {
  REGULAR: { label: "Regular", variant: "default" as const },
  ESTAGIDATA: { label: "ESTAGIDATA", variant: "outline" as const },
  PCD: { label: "PCD", variant: "default" as const },
  SUBSTITUTO: { label: "Substituto", variant: "warning" as const },
};

export function TipoBadge({ tipo }: { tipo: string }) {
  const config = tipoConfig[tipo as keyof typeof tipoConfig] ?? {
    label: tipo,
    variant: "default" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
