import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { EstagiarioTable } from "@/components/modules/estagiarios/estagiario-table";
import { EstagiarioFilters } from "@/components/modules/estagiarios/estagiario-filters";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { buscarEstagiarios } from "@/actions/estagiarios";

interface PageProps {
  searchParams: {
    secretaria?: string;
    status?: string;
    tipo?: string;
    nivel?: string;
    busca?: string;
  };
}

async function EstagiarioList({ filtros }: { filtros: PageProps["searchParams"] }) {
  const estagiarios = await buscarEstagiarios(filtros);
  return <EstagiarioTable estagiarios={estagiarios} />;
}

export default function EstagiáriosPage({ searchParams }: PageProps) {
  return (
    <>
      <Header title="Estagiários" />
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Gerencie todos os estagiários do TCDF
          </p>
          <Link href="/estagiarios/novo">
            <Button>
              <PlusCircle className="w-4 h-4" />
              Nova Contratação
            </Button>
          </Link>
        </div>

        <Suspense fallback={null}>
          <EstagiarioFilters />
        </Suspense>

        <Suspense fallback={<TableSkeleton />}>
          <EstagiarioList filtros={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
