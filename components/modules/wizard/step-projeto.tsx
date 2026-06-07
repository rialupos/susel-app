"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const schema = z.object({
  nomeProjeto: z.string().min(2, "Informe o nome do projeto"),
  justificativaProjeto: z.string().min(10, "Informe a justificativa"),
  escopoProjeto: z.string().min(10, "Informe o escopo"),
  cronogramaProjeto: z.string().min(5, "Informe o cronograma"),
});

type FormData = z.infer<typeof schema>;

interface StepProjetoProps {
  defaultValues?: Partial<FormData>;
  onNext: (data: FormData) => void;
  onBack: () => void;
}

export function StepProjeto({ defaultValues, onNext, onBack }: StepProjetoProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Dados do Projeto ESTAGIDATA</h2>
        <p className="text-sm text-slate-500 mt-1">Preencha as informações do projeto vinculado ao estágio.</p>
      </div>

      <div className="space-y-4">
        <FormField label="Nome do projeto" error={errors.nomeProjeto?.message} required>
          <input {...register("nomeProjeto")} className={inputClass} placeholder="Nome do projeto" />
        </FormField>

        <FormField label="Justificativa" error={errors.justificativaProjeto?.message} required>
          <textarea {...register("justificativaProjeto")} rows={3} className={inputClass}
            placeholder="Descreva a justificativa para o projeto..." />
        </FormField>

        <FormField label="Escopo" error={errors.escopoProjeto?.message} required>
          <textarea {...register("escopoProjeto")} rows={3} className={inputClass}
            placeholder="Descreva o escopo do projeto..." />
        </FormField>

        <FormField label="Cronograma" error={errors.cronogramaProjeto?.message} required>
          <textarea {...register("cronogramaProjeto")} rows={2} className={inputClass}
            placeholder="Ex: Março/2026 – Levantamento; Abril/2026 – Desenvolvimento..." />
        </FormField>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>← Voltar</Button>
        <Button type="submit">Próximo: Revisão →</Button>
      </div>
    </form>
  );
}
