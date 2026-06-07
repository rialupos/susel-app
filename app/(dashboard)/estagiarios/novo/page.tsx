import Link from "next/link";
import { Header } from "@/components/layout/header";
import { WizardContainer } from "@/components/modules/wizard/wizard-container";
import { buscarVagaDisponivel } from "@/actions/vagas";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  searchParams: { vagaId?: string };
}

export default async function NovaContratacaoPage({ searchParams }: PageProps) {
  const vagas = await buscarVagaDisponivel();

  return (
    <>
      <Header title="Nova Contratação" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <Link
            href="/estagiarios"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Estagiários
          </Link>

          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
            {vagas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 font-medium">Não há vagas disponíveis no momento.</p>
                <p className="text-slate-400 text-sm mt-1">
                  Todas as vagas estão ocupadas. Registre um desligamento para liberar uma vaga.
                </p>
              </div>
            ) : (
              <WizardContainer vagas={vagas} vagaIdInicial={searchParams.vagaId} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
