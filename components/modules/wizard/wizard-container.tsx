"use client";

import { useState } from "react";
import { StepVaga } from "./step-vaga";
import { StepEstagiario } from "./step-estagiario";
import { StepSupervisor } from "./step-supervisor";
import { StepRevisao } from "./step-revisao";
import { Check } from "lucide-react";

type VagaDisponivel = { id: string; codigo: string; secretaria: string };

interface WizardContainerProps {
  vagas: VagaDisponivel[];
  vagaIdInicial?: string;
}

type WizardState = {
  vagaId: string;
  vagaCodigo: string;
  secretaria: string;
  // step 2
  nome?: string;
  cpf?: string;
  nivel?: string;
  curso?: string;
  horario?: string;
  instituicaoEnsino?: string;
  tipoVaga?: string;
  tipo?: string;
  estagiarioSubstituidoNome?: string;
  dataInicio?: string;
  dataFim?: string;
  dataLimiteContrato?: string;
  lotacao?: string;
  unidadeGestora?: string;
  secretariaInterna?: string;
  atividadesDesenvolvidas?: string;
  edocContratacao?: string;
  observacoes?: string;
  // step 3
  supervisorNome?: string;
  supervisorCargo?: string;
  supervisorFormacao?: string;
  supervisorRamal?: string;
  supervisorEmail?: string;
};

const STEP_LABELS = ["Vaga", "Estagiário", "Supervisor", "Revisão"];

export function WizardContainer({ vagas, vagaIdInicial }: WizardContainerProps) {
  const vagaInicial = vagas.find((v) => v.id === vagaIdInicial);

  const [step, setStep] = useState(vagaInicial ? 1 : 0);
  const [state, setState] = useState<Partial<WizardState>>(
    vagaInicial
      ? { vagaId: vagaInicial.id, vagaCodigo: vagaInicial.codigo, secretaria: vagaInicial.secretaria }
      : {}
  );

  function merge(data: object) {
    setState((prev) => ({ ...prev, ...data }));
  }

  // Step 0: Selecionar vaga
  if (step === 0) {
    return (
      <div className="space-y-6">
        <StepHeader step={step} labels={STEP_LABELS} />
        <StepVaga
          vagas={vagas}
          vagaIdInicial={vagaIdInicial}
          onNext={(vagaId, secretaria) => {
            const vaga = vagas.find((v) => v.id === vagaId)!;
            merge({ vagaId, vagaCodigo: vaga.codigo, secretaria });
            setStep(1);
          }}
        />
      </div>
    );
  }

  // Step 1: Dados do estagiário
  if (step === 1) {
    return (
      <div className="space-y-6">
        <StepHeader step={step} labels={STEP_LABELS} />
        <StepEstagiario
          secretaria={state.secretaria ?? ""}
          defaultValues={state as any}
          onNext={(data) => { merge(data); setStep(2); }}
          onBack={() => setStep(0)}
        />
      </div>
    );
  }

  // Step 2: Supervisor
  if (step === 2) {
    return (
      <div className="space-y-6">
        <StepHeader step={step} labels={STEP_LABELS} />
        <StepSupervisor
          defaultValues={state as any}
          isEstagidata={false}
          onNext={(data) => { merge(data); setStep(3); }}
          onBack={() => setStep(1)}
        />
      </div>
    );
  }

  // Step final: Revisão
  if (step >= 3 && state.vagaId && state.nome) {
    return (
      <div className="space-y-6">
        <StepHeader step={3} labels={STEP_LABELS} />
        <StepRevisao
          data={state as any}
          onBack={() => setStep(2)}
        />
      </div>
    );
  }

  return null;
}

function StepHeader({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`
            flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors
            ${i < step ? "bg-primary text-white" : i === step ? "bg-primary text-white ring-4 ring-primary/20" : "bg-slate-200 text-slate-500"}
          `}>
            {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span className={`text-sm hidden sm:block ${i === step ? "font-semibold text-slate-800" : i < step ? "text-primary" : "text-slate-400"}`}>
            {label}
          </span>
          {i < labels.length - 1 && (
            <div className={`h-0.5 w-8 mx-1 ${i < step ? "bg-primary" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
