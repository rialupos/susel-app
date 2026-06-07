"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, inputClass, selectClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

const schema = z.object({
  nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  cpf: z.string().min(11, "CPF inválido").regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido"),
  nivel: z.enum(["MEDIO", "SUPERIOR"]),
  curso: z.string().min(2, "Informe o curso"),
  horario: z.string().min(2, "Informe o horário"),
  instituicaoEnsino: z.string().min(2, "Informe a instituição"),
  tipoVaga: z.enum(["NOVA", "SUBSTITUICAO"]),
  estagiarioSubstituidoNome: z.string().optional(),
  tipo: z.enum(["REGULAR", "ESTAGIDATA", "PCD", "SUBSTITUTO"]),
  dataInicio: z.string().min(1, "Informe a data de início"),
  dataFim: z.string().min(1, "Informe a data de fim"),
  dataLimiteContrato: z.string().min(1, "Informe a data limite"),
  lotacao: z.string().min(2, "Informe a lotação"),
  unidadeGestora: z.string().min(2, "Informe a unidade gestora"),
  secretariaInterna: z.string().optional(),
  atividadesDesenvolvidas: z.string().optional(),
  edocContratacao: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface StepEstagiarioProps {
  defaultValues?: Partial<FormData>;
  secretaria: string;
  onNext: (data: FormData) => void;
  onBack: () => void;
}

export function StepEstagiario({ defaultValues, secretaria, onNext, onBack }: StepEstagiarioProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nivel: "SUPERIOR",
      tipoVaga: "NOVA",
      tipo: secretaria === "ESTAGIDATA" ? "ESTAGIDATA" : secretaria === "PCD" ? "PCD" : "REGULAR",
      ...defaultValues,
    },
  });

  const tipoVaga = watch("tipoVaga");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Dados do Estagiário</h2>
        <p className="text-sm text-slate-500 mt-1">Preencha os dados pessoais e do contrato.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Nome completo" error={errors.nome?.message} required className="md:col-span-2">
          <input {...register("nome")} className={inputClass} placeholder="Nome completo" />
        </FormField>

        <FormField label="CPF" error={errors.cpf?.message} required>
          <input {...register("cpf")} className={inputClass} placeholder="000.000.000-00" />
        </FormField>

        <FormField label="Tipo de estagiário" error={errors.tipo?.message} required>
          <select {...register("tipo")} className={selectClass}>
            <option value="REGULAR">Regular</option>
            <option value="ESTAGIDATA">ESTAGIDATA</option>
            <option value="PCD">PCD</option>
            <option value="SUBSTITUTO">Substituto</option>
          </select>
        </FormField>

        <FormField label="Nível" error={errors.nivel?.message} required>
          <select {...register("nivel")} className={selectClass}>
            <option value="SUPERIOR">Superior</option>
            <option value="MEDIO">Médio</option>
          </select>
        </FormField>

        <FormField label="Curso" error={errors.curso?.message} required>
          <input {...register("curso")} className={inputClass} placeholder="Ex: Direito, Administração..." />
        </FormField>

        <FormField label="Instituição de Ensino" error={errors.instituicaoEnsino?.message} required className="md:col-span-2">
          <input {...register("instituicaoEnsino")} className={inputClass} placeholder="Nome da instituição" />
        </FormField>

        <FormField label="Horário" error={errors.horario?.message} required>
          <input {...register("horario")} className={inputClass} placeholder="Ex: 13h às 18h" />
        </FormField>

        <FormField label="Tipo de Vaga" error={errors.tipoVaga?.message} required>
          <select {...register("tipoVaga")} className={selectClass}>
            <option value="NOVA">Nova</option>
            <option value="SUBSTITUICAO">Substituição</option>
          </select>
        </FormField>

        {tipoVaga === "SUBSTITUICAO" && (
          <FormField label="Nome do estagiário substituído" error={errors.estagiarioSubstituidoNome?.message} className="md:col-span-2">
            <input {...register("estagiarioSubstituidoNome")} className={inputClass} placeholder="Nome do estagiário substituído" />
          </FormField>
        )}
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-700 mb-3">Datas do Contrato</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Data de início" error={errors.dataInicio?.message} required>
            <input type="date" {...register("dataInicio")} className={inputClass} />
          </FormField>
          <FormField label="Data de fim" error={errors.dataFim?.message} required>
            <input type="date" {...register("dataFim")} className={inputClass} />
          </FormField>
          <FormField label="Data limite do contrato" error={errors.dataLimiteContrato?.message} required>
            <input type="date" {...register("dataLimiteContrato")} className={inputClass} />
          </FormField>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-700 mb-3">Lotação</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Lotação" error={errors.lotacao?.message} required>
            <input {...register("lotacao")} className={inputClass} placeholder="Ex: SEGEDAM/COGER" />
          </FormField>
          <FormField label="Unidade Gestora" error={errors.unidadeGestora?.message} required>
            <input {...register("unidadeGestora")} className={inputClass} placeholder="Ex: SUSEL" />
          </FormField>
          <FormField label="Secretaria interna" error={errors.secretariaInterna?.message}>
            <input {...register("secretariaInterna")} className={inputClass} placeholder="Opcional" />
          </FormField>
          <FormField label="e-DOC de contratação" error={errors.edocContratacao?.message}>
            <input {...register("edocContratacao")} className={inputClass} placeholder="Número do e-DOC" />
          </FormField>
          <FormField label="Atividades desenvolvidas" error={errors.atividadesDesenvolvidas?.message} className="md:col-span-2">
            <textarea {...register("atividadesDesenvolvidas")} rows={2} className={inputClass} placeholder="Descreva as atividades..." />
          </FormField>
          <FormField label="Observações" error={errors.observacoes?.message} className="md:col-span-2">
            <textarea {...register("observacoes")} rows={2} className={inputClass} placeholder="Observações adicionais..." />
          </FormField>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>← Voltar</Button>
        <Button type="submit">Próximo: Supervisor →</Button>
      </div>
    </form>
  );
}
