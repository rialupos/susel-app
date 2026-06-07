# SUSEL — Sistema de Gestão de Estágios (TCDF)
**Data:** 2026-06-06  
**Status:** Aprovado para implementação

---

## 1. Visão Geral

Sistema web interno para a SUSEL (Supervisão de Estágios) do Tribunal de Contas do Distrito Federal. Gerencia o ciclo de vida completo dos estagiários: contratação, recesso, renovação e desligamento, com controle de vagas por secretaria e geração de relatórios PDF.

**URL de produção inicial:** http://localhost:3000  
**Usuários:** Servidores da SUSEL/TCDF (autenticação interna, sem autenticação cidadã)

---

## 2. Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL via Neon (serverless) |
| ORM | Prisma |
| Estilização | Tailwind CSS |
| Autenticação | NextAuth.js v4 — Provider Credentials |
| Senhas | bcryptjs |
| Forms | React Hook Form + Zod |
| Submissão | Server Actions |
| PDF | @react-pdf/renderer (Route Handler com streaming) |
| Excel | xlsx (SheetJS) |
| Toasts | sonner |
| Ícones | lucide-react |

---

## 3. Variáveis de Ambiente (.env.local)

```
DATABASE_URL="postgresql://neondb_owner:npg_Cir5duJ0nwDB@ep-sparkling-night-acx5r7du.sa-east-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="susel-tcdf-secret-2025"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 4. Schema Prisma (completo)

```prisma
model Usuario {
  id        String   @id @default(uuid())
  nome      String
  email     String   @unique
  senhaHash String
  ativo     Boolean  @default(true)
  acoes     HistoricoAcao[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ConfiguracaoVagas {
  id               String   @id @default(uuid())
  secretaria       String   @unique
  vagasAutorizadas Int
  updatedAt        DateTime @updatedAt
}

model Vaga {
  id          String       @id @default(uuid())
  codigo      String       @unique
  secretaria  String
  ativa       Boolean      @default(true)
  estagiarios Estagiario[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Estagiario {
  id                        String         @id @default(uuid())
  nome                      String
  cpf                       String         @unique
  vagaId                    String
  vaga                      Vaga           @relation(fields: [vagaId], references: [id])
  nivel                     String
  curso                     String
  horario                   String
  instituicaoEnsino         String
  tipoVaga                  String
  estagiarioSubstituidoNome String?
  dataInicio                DateTime
  dataFim                   DateTime
  dataLimiteContrato        DateTime
  status                    String         @default("ATIVO")
  tipo                      String         @default("REGULAR")
  lotacao                   String
  supervisorNome            String
  supervisorFormacao        String?
  supervisorCargo           String?
  supervisorRamal           String?
  unidadeGestora            String
  secretariaInterna         String?
  atividadesDesenvolvidas   String?
  edocContratacao           String?
  observacoes               String?
  nomeProjeto               String?
  justificativaProjeto      String?
  escopoProjeto             String?
  cronogramaProjeto         String?
  recessos                  Recesso[]
  renovacoes                Renovacao[]
  desligamentos             Desligamento[]
  historico                 HistoricoAcao[]
  createdAt                 DateTime       @default(now())
  updatedAt                 DateTime       @updatedAt
}

model Recesso {
  id                String     @id @default(uuid())
  estagiarioId      String
  estagiario        Estagiario @relation(fields: [estagiarioId], references: [id])
  numeroRecesso     Int
  dataInicioPeriodo DateTime
  dataFimPeriodo    DateTime
  quantidadeDias    Int
  confirmado        Boolean    @default(false)
  observacoes       String?
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
}

model Renovacao {
  id            String     @id @default(uuid())
  estagiarioId  String
  estagiario    Estagiario @relation(fields: [estagiarioId], references: [id])
  dataNovaFim   DateTime
  status        String     @default("AGUARDANDO_CIDE")
  observacoes   String?
  enviadoCideEm DateTime?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model Desligamento {
  id           String     @id @default(uuid())
  estagiarioId String
  estagiario   Estagiario @relation(fields: [estagiarioId], references: [id])
  dataUltimoDia DateTime
  motivo       String
  observacoes  String?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model HistoricoAcao {
  id           String     @id @default(uuid())
  estagiarioId String
  estagiario   Estagiario @relation(fields: [estagiarioId], references: [id])
  usuarioId    String
  usuario      Usuario    @relation(fields: [usuarioId], references: [id])
  acao         String
  detalhes     String?
  createdAt    DateTime   @default(now())
}
```

---

## 5. Seed

- **Admin:** email `admin@tcdf.gov.br`, senha `admin123` (bcrypt hash)
- **ConfiguracaoVagas:** SEGEDAM=59, SEGECEX=20, PRESIDENCIA=25, GABINETES=36, ESTAGIDATA=0, PCD=0
- **Vagas:**
  - SGD001–SGD059 (SEGEDAM, 59 vagas)
  - SCE001–SCE020 (SEGECEX, 20 vagas)
  - PRS001–PRS025 (PRESIDENCIA, 25 vagas)
  - MM001–MM002, RR001–RR002, IM001–IM002, AL001–AL002, CA001–CA002 (GABINETES, 10 vagas)
  - PJE001–PJE010 (ESTAGIDATA, 10 vagas)
  - PCD001–PCD006 (PCD, 6 vagas)
  - **Total: 130 vagas**

---

## 6. Estrutura de Rotas

```
app/
├── (auth)/
│   └── login/page.tsx
├── (dashboard)/
│   ├── layout.tsx              # Sidebar + header global
│   ├── page.tsx                # Dashboard
│   ├── estagiarios/
│   │   ├── page.tsx            # Lista com filtros
│   │   ├── [id]/page.tsx       # Detalhe + histórico + ações
│   │   └── novo/page.tsx       # Wizard de contratação
│   ├── vagas/
│   │   ├── page.tsx            # Lista por secretaria
│   │   └── [id]/page.tsx       # Detalhe + histórico de ocupação
│   ├── recesso/page.tsx        # Formulário de recesso
│   ├── renovacao/page.tsx      # Lista + ação de renovação
│   ├── desligamento/page.tsx   # Formulário de desligamento
│   ├── relatorios/page.tsx     # Geração de PDFs
│   ├── configuracoes/page.tsx  # Usuários + vagas por secretaria
│   └── admin/
│       └── importar/page.tsx   # Upload Excel
└── api/
    ├── auth/[...nextauth]/route.ts
    └── relatorios/[tipo]/route.ts   # PDF streaming
```

**Middleware:** protege `/(dashboard)/**`, redireciona para `/login` se não autenticado.

---

## 7. Módulos e Componentes

### 7.1 Layout
- `Sidebar`: logo "SUSEL | TCDF", itens de menu com ícones Lucide, badge vermelho numérico com alertas
- `Header`: nome do usuário logado, botão de logout
- `Breadcrumb`: navegação contextual

### 7.2 Dashboard
- Cards de ocupação por secretaria: vagas ocupadas / autorizadas com barra de progresso (verde → amarelo → vermelho)
- Painel de alertas (destaque visual): renovações vencendo ≤30 dias, contratos limite ≤30 dias, recessos pendentes
- Feed de últimas 10 ações do histórico

### 7.3 Estagiários
- Tabela com filtros: secretaria, status, tipo, nível, busca por nome/CPF
- Página de detalhe: dados cadastrais, timeline de histórico, seções colapsáveis de recessos/renovações/desligamentos
- Formulário de cadastro: campos extras para tipo ESTAGIDATA (projeto)

### 7.4 Vagas
- Grid por secretaria com status OCUPADA/DISPONÍVEL
- Histórico de ocupação por vaga
- Botão "Iniciar contratação" em vagas disponíveis

### 7.5 Wizard de Contratação (3–4 etapas + revisão)
**Etapas do wizard:**
1. Selecionar vaga disponível
2. Dados do estagiário (RHF + Zod)
3. Dados do supervisor
4. Dados do projeto *(somente para tipo ESTAGIDATA)*

**Pós-wizard (mesma página, após submissão):**
- Estagiário criado com `status="AGUARDANDO_CIDE"` (sobrescreve default do schema)
- Template de e-mail para o CIDE exibido (editável, botão Copiar)
- Botão "Marcar como CONTRATACAO_FINALIZADA" → status vira `ATIVO`

### 7.6 Recesso
- Validações: elegibilidade por tempo de contrato; início seg/ter/qua; alteração com ≥15 dias
- Confirmação pelo usuário SUSEL

### 7.7 Renovação
- Lista estagiários com contrato próximo do fim
- Registrar envio ao CIDE (timestamp)
- Atualizar `dataFim` após retorno
- Detectar fim do 2º ano → sugerir desligamento

### 7.8 Desligamento
- Motivos: `TERMINO_CONTRATO`, `INICIATIVA_ESTAGIARIO`, `INICIATIVA_TCDF`, `OUTROS`
- Observações obrigatórias se motivo ≠ `TERMINO_CONTRATO`
- Vaga retorna disponível; registra `HistoricoAcao`

### 7.9 Relatórios PDF
Gerados via Route Handler (`/api/relatorios/[tipo]`) com `@react-pdf/renderer`:
1. Ativos por secretaria
2. Entradas e saídas por mês/ano
3. Contratos expirando (filtro 30/60/90 dias)
4. Histórico completo de estagiário
5. Quantitativo geral de vagas

Cabeçalho: "SUSEL | TCDF", data de geração, rodapé com número de página.

### 7.10 Configurações
- CRUD de usuários (criar, editar, desativar)
- Configurar limite de vagas por secretaria
- Configurar vagas PCD por secretaria

### 7.11 Importação Excel
- Upload `.xlsx` com `xlsx` (SheetJS)
- Abas lidas: ATIVOS SEGEDAM, ATIVOS SEGECEX, ATIVOS PRESIDÊNCIA, ATIVOS ÓRGÃOS TRIBUNAL, ATIVOS ESTAGIDATA, ATIVOS PCD, Recesso, Desligamentos, Renovações
- Mapeamento automático por nome de coluna (inferido do schema Prisma)
- Preview antes de confirmar, erros por linha, sem rollback parcial

---

## 8. Visual / UX

| Elemento | Especificação |
|---|---|
| Paleta primária | Azul escuro `#1e3a5f` / `#0f2d4a` |
| Alertas críticos | Vermelho `#dc2626` |
| Alertas moderados | Amarelo `#d97706` |
| Fundo | Branco / cinza claro `#f8fafc` |
| Loading | Skeleton loaders (não spinners genéricos) |
| Confirmação destrutiva | Modal de confirmação antes de executar |
| Feedback | Toasts via `sonner` |
| Responsividade | Desktop-first; sidebar colapsável |

---

## 9. Segurança

- Todas as rotas `/(dashboard)/**` protegidas por middleware NextAuth
- Senhas com bcrypt (salt rounds 12)
- `DATABASE_URL` e `NEXTAUTH_SECRET` apenas em `.env.local` (nunca commitados)
- Sem SQL raw (apenas Prisma ORM)
- Validação de inputs com Zod tanto no cliente quanto no servidor

---

## 9.1 Valores de Enum (campos String com valores controlados)

| Campo | Model | Valores válidos |
|---|---|---|
| `status` | Estagiario | `AGUARDANDO_CIDE`, `ATIVO`, `DESLIGADO` |
| `tipo` | Estagiario | `REGULAR`, `ESTAGIDATA`, `PCD`, `SUBSTITUTO` |
| `nivel` | Estagiario | `MEDIO`, `SUPERIOR` |
| `tipoVaga` | Estagiario | `NOVA`, `SUBSTITUICAO` |
| `status` | Renovacao | `AGUARDANDO_CIDE`, `APROVADA`, `RECUSADA` |
| `motivo` | Desligamento | `TERMINO_CONTRATO`, `INICIATIVA_ESTAGIARIO`, `INICIATIVA_TCDF`, `OUTROS` |

> Nota: o schema usa `String` (não enum Prisma) para facilitar migrações futuras. A validação Zod no servidor garante os valores válidos.

---

## 10. Ordem de Implementação (12 Etapas)

| Etapa | Descrição |
|---|---|
| 1 | Setup: Next.js, dependências, Prisma schema, migrate, seed |
| 2 | Layout base, NextAuth, login/logout, middleware |
| 3 | Dashboard: cards, alertas, feed histórico |
| 4 | Módulo Estagiários: listagem, cadastro, detalhe |
| 5 | Módulo Vagas: listagem, histórico |
| 6 | Wizard de Contratação (fluxo completo) |
| 7 | Fluxo de Recesso |
| 8 | Fluxo de Renovação |
| 9 | Fluxo de Desligamento |
| 10 | Relatórios PDF |
| 11 | Configurações (usuários + vagas) |
| 12 | Importação Excel |
