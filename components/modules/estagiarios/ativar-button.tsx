"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ativarEstagiario, enviarParaCide } from "@/actions/estagiarios";
import { CheckCircle, Send, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AtivarButtonProps {
  estagiarioId: string;
  nome: string;
  status: string;
}

export function AtivarButton({ estagiarioId, nome, status }: AtivarButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEnviarCide() {
    if (!confirm(`Confirmar envio de ${nome} ao Agente Integrador?`)) return;
    setLoading(true);
    try {
      await enviarParaCide(estagiarioId);
      toast.success("Enviado ao Agente Integrador!");
      router.refresh();
    } catch (e) {
      toast.error("Erro ao atualizar status.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAtivar() {
    if (!confirm(`Confirmar que ${nome} esta apto para inicio? A vaga sera marcada como ocupada.`)) return;
    setLoading(true);
    try {
      await ativarEstagiario(estagiarioId);
      toast.success(`${nome} ativado com sucesso!`);
      router.refresh();
    } catch (e) {
      toast.error("Erro ao ativar estagiario.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "AGUARDANDO_CIDE") {
    return (
      <Button onClick={handleEnviarCide} disabled={loading} size="sm" variant="secondary">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar ao Agente Integrador</>}
      </Button>
    );
  }

  if (status === "ENVIADO_CIDE") {
    return (
      <Button onClick={handleAtivar} disabled={loading} size="sm">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Ativando...</> : <><CheckCircle className="w-4 h-4" /> Estagiario Apto para Inicio</>}
      </Button>
    );
  }

  return null;
}