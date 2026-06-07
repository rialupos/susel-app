"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const schema = z.object({
  supervisorNome: z.string().min(2, "Informe o nome do supervisor"),
  supervisorFormacao: z.string().optional(),
  supervisorCargo: z.string().optional(),
  supervisorRamal: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface StepSupervisorProps {
  defaultValues?: Partial<FormData>;
  isEstagidata: boolean;
  onNext: (data: FormData) => void;
  onBack: () => void;
}

export function StepSupervisor({ defaultValues, isEstagidata, onNext, onBack }: StepSupervisorProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Dados do Supervisor</h2>
        <p className="text-sm text-slate-500 mt-1">Informe o supervisor responsável pelo estagiário.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Nome do supervisor" error={errors.supervisorNome?.message} required className="md:col-span-2">
          <input {...register("supervisorNome")} className={inputClass} placeholder="Nome completo do supervisor" />
        </FormField>

        <FormField label="Cargo" error={errors.supervisorCargo?.message}>
          <input {...register("supervisorCargo")} className={inputClass} placeholder="Ex: Analista de Controle Externo" />
        </FormField>

        <FormField label="Formação" error={errors.supervisorFormacao?.message}>
          <input {...register("supervisorFormacao")} className={inputClass} placeholder="Ex: Bacharel em Direito" />
        </FormField>

        <FormField label="Ramal" error={errors.supervisorRamal?.message}>
          <input {...register("supervisorRamal")} className={inputClass} placeholder="Ex: 4567" />
        </FormField>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>← Voltar</Button>
        <Button type="submit">
          {isEstagidata ? "Próximo: Dados do Projeto →" : "Próximo: Revisão →"}
        </Button>
      </div>
    </form>
  );
}
