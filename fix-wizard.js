const fs = require('fs');
let c = fs.readFileSync('components/modules/wizard/step-estagiario.tsx', 'utf8');

// 1. Adicionar useSearchParams ao import
c = c.replace(
  '"use client";\n\nimport { useForm } from "react-hook-form";',
  '"use client";\n\nimport { useForm } from "react-hook-form";\nimport { useSearchParams } from "next/navigation";'
);

// 2. Adicionar lista de AREAS antes do schema
c = c.replace(
  'const schema = z.object({',
  'const AREAS = [\n  "Administracao", "Arquitetura e Urbanismo", "Arquivologia", "Biblioteconomia",\n  "Contabilidade", "Direito", "Economia", "Engenharia", "Ensino Medio",\n  "Estatistica", "Historia", "Jornalismo e Comunicacao", "Letras", "Pedagogia",\n  "Politicas Publicas", "Pos-Graduacao", "Relacoes Internacionais", "Saude",\n  "Tecnologo", "TI",\n];\n\nconst schema = z.object({'
);

// 3. Ler params da URL dentro do componente
c = c.replace(
  'export function StepEstagiario({ defaultValues, secretaria, onNext, onBack }: StepEstagiarioProps) {\n  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({',
  'export function StepEstagiario({ defaultValues, secretaria, onNext, onBack }: StepEstagiarioProps) {\n  const searchParams = useSearchParams();\n  const nomeParam = searchParams.get("nome") ?? "";\n  const instituicaoParam = searchParams.get("instituicao") ?? "";\n  const cursoParam = searchParams.get("curso") ?? "";\n\n  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({'
);

// 4. Adicionar params nos defaultValues
c = c.replace(
  '    defaultValues: {\n      nivel: "SUPERIOR",\n      tipoVaga: "NOVA",\n      tipo: secretaria === "ESTAGIDATA" ? "ESTAGIDATA" : secretaria === "PCD" ? "PCD" : "REGULAR",\n      ...defaultValues,\n    },',
  '    defaultValues: {\n      nivel: "SUPERIOR",\n      tipoVaga: "NOVA",\n      tipo: secretaria === "ESTAGIDATA" ? "ESTAGIDATA" : secretaria === "PCD" ? "PCD" : "REGULAR",\n      nome: nomeParam || undefined,\n      instituicaoEnsino: instituicaoParam || undefined,\n      curso: cursoParam || undefined,\n      ...defaultValues,\n    },'
);

// 5. Trocar input de curso por select
c = c.replace(
  '        <FormField label="Curso" error={errors.curso?.message} required>\n          <input {...register("curso")} className={inputClass} placeholder="Ex: Direito, Administra\u00e7\u00e3o..." />\n        </FormField>',
  '        <FormField label="Curso" error={errors.curso?.message} required>\n          <select {...register("curso")} className={selectClass}>\n            <option value="">Selecione o curso...</option>\n            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}\n          </select>\n        </FormField>'
);

fs.writeFileSync('components/modules/wizard/step-estagiario.tsx', c);
console.log('OK2');