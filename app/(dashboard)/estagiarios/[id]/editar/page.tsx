import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { buscarEstagiarioPorId } from "@/actions/estagiarios";
import { EditarEstagiarioForm } from "@/components/modules/estagiarios/editar-estagiario-form";

interface PageProps {
  params: { id: string };
}

export default async function EditarEstagiarioPage({ params }: PageProps) {
  const estagiario = await buscarEstagiarioPorId(params.id);
  if (!estagiario) notFound();

  const data = {
    id: estagiario.id,
    nome: estagiario.nome,
    cpf: estagiario.cpf,
    nivel: estagiario.nivel,
    curso: estagiario.curso,
    horario: estagiario.horario,
    instituicaoEnsino: estagiario.instituicaoEnsino,
    tipoVaga: estagiario.tipoVaga,
    estagiarioSubstituidoNome: estagiario.estagiarioSubstituidoNome,
    dataInicio: estagiario.dataInicio.toISOString(),
    dataFim: estagiario.dataFim.toISOString(),
    dataLimiteContrato: estagiario.dataLimiteContrato.toISOString(),
    lotacao: estagiario.lotacao,
    unidadeGestora: estagiario.unidadeGestora,
    secretariaInterna: estagiario.secretariaInterna,
    atividadesDesenvolvidas: estagiario.atividadesDesenvolvidas,
    edocContratacao: estagiario.edocContratacao,
    observacoes: estagiario.observacoes,
    supervisorNome: estagiario.supervisorNome,
    supervisorCargo: estagiario.supervisorCargo,
    supervisorFormacao: estagiario.supervisorFormacao,
    supervisorRamal: estagiario.supervisorRamal,
    vaga: { codigo: estagiario.vaga.codigo, secretaria: estagiario.vaga.secretaria },
  };

  return (
    <>
      <Header title={`Editar — ${estagiario.nome}`} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <EditarEstagiarioForm estagiario={data} />
        </div>
      </div>
    </>
  );
}
