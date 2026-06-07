"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ativarEstagiario } from "@/actions/estagiarios";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface AtivarButtonProps {
  estagiarioId: string;
  nome: string;
}

export function AtivarButton({ estagiarioId, nome }: AtivarButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAtivar() {
    if (!confirm(`Confirmar ativação de ${nome}? A vaga será marcada como ocupada.`)) return;

    setLoading(true);
    try {
      await ativarEstagiario(estagiarioId);
      toast.success(`${nome} ativado com sucesso!`);
      router.refresh();
    } catch (e) {
      toast.error("Erro ao ativar estagiário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleAtivar} disabled={loading} size="sm">
      <CheckCircle className="w-4 h-4" />
      {loading ? "Ativando..." : "Marcar como CONTRATAÇÃO FINALIZADA"}
    </Button>
  );
}
