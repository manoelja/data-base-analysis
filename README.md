<![CDATA[<div align="center">

# Data Base Analysis

### Dashboard Interativo — Nascidos Vivos Brasileiros (2019–2023)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-Academic-green?style=flat-square)

Pipeline completo de importação, limpeza e análise de dados de nascidos vivos brasileiros utilizando **SINASC/DataSUS** com R, SQL e visualização interativa em React.

[Demo ao Vivo](#) · [Relatório de Análise](#análises-disponíveis) · [Como Executar](#instalação-e-execução)

</div>

---

## Sumário

- [Visão Geral](#visão-geral)
- [Métricas do Dataset](#métricas-do-dataset)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Pipeline de Dados](#pipeline-de-dados)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Execução](#instalação-e-execução)
- [Análises Disponíveis](#análises-disponíveis)
- [Licença](#licença)

---

## Visão Geral

**Data Base Analysis** é um dashboard web desenvolvido como atividade avaliativa de **Banco de Dados**, demonstrando competências em engenharia de dados e visualização analítica.

O projeto processa **6.080 registros** de nascidos vivos extraídos do sistema **SINASC (Sistema de Informação sobre Nascidos Vivos)** do DataSUS, aplicando técnicas de limpeza, validação e análise exploratória para gerar insights sobre indicadores de saúde pública no Brasil.

### Objetivos

- **Diagnóstico de qualidade** — Identificação e remoção de registros com valores inválidos, inconsistentes ou duplicados
- **Pipeline relacional** — Integração SQL→R com persistência em SQLite via DBI/RSQLite
- **Análise exploratória** — Visualização interativa de indicadores por região, período, sexo e faixa etária
- **Interface moderna** — Dashboard responsivo com suporte a múltiplos idiomas (PT/EN/ES)

---

## Métricas do Dataset

| Métrica | Valor |
|:--------|------:|
| Registros iniciais | 6.080 |
| Registros limpos | 5.510 |
| Registros removidos | 570 (9,4%) |
| Período coberto | 2019–2023 |
| Fonte dos dados | SINASC / DataSUS |
| Peso médio ao nascer | 3.328g |
| Taxa de cesárea | 56,6% |

### Etapas de Limpeza

| Etapa | Campo | Removidos | Critério de Validação |
|:------|:------|----------:|:----------------------|
| 1 | `PESO_GRAMAS` | 183 | Valores não numéricos, negativos ou ausentes |
| 2 | `IDADE_MAE` | 198 | Idades fora da faixa biológica plausível (10–55 anos) |
| 3 | `UF` | 114 | Siglas de estados inválidas |
| 4 | Duplicatas | 75 | Registros completamente duplicados |

---

## Funcionalidades

### Dashboard Interativo

- **Múltiplas métricas** — Visualize nascimentos, % cesárea, % baixo peso e % prematuros simultaneamente
- **7 tipos de gráficos** — Barras verticais, horizontais, agrupadas, empilhadas, linhas, donut e tabela
- **Filtros compostos** — Combine filtros por região, ano, faixa etária e sexo
- **Drill-down por estado** — Clique em uma região para ver dados detalhados por UF
- **Insights automáticos** — Análise dinâmica baseada nos filtros aplicados

### Recursos da Interface

- **Modo claro/escuro** — Tema personalizado com transição suave
- **Internacionalização** — Suporte a Português, Inglês e Espanhol (i18next)
- **Shell interativo** — Terminal simulado com comandos em R, SQL e CMD
- **Animações** — Transições fluidas via Framer Motion
- **Responsivo** — Layout adaptável para desktop e dispositivos móveis

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|:-------|:-----------|:------:|
| **Frontend** | React | 19 |
| **Tipagem** | TypeScript | 6.0 |
| **Build** | Vite | 8.0 |
| **Animações** | Framer Motion | 12.x |
| **Ícones** | Lucide React | 0.490 |
| **i18n** | i18next | 26.x |
| **Testes** | Vitest + Testing Library | 4.x |
| **Linting** | ESLint + TypeScript ESLint | 10.x |

---

## Pipeline de Dados

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  SINASC /   │───▶│  Importação │───▶│   Limpeza   │───▶│   Análise   │
│  DataSUS    │    │  (R + DBI)  │    │  (dplyr)    │    │  Exploratória│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                                     │                   │
       ▼                                     ▼                   ▼
  6.080 registros                    5.510 registros      Dashboard Web
                        -570 (9,4%)
```

### Fluxo Detalhado

1. **Extração** — Dados obtidos via SINASC/DataSUS em formato tabular
2. **Importação** — Carga em R com DBI e persistência em SQLite
3. **Diagnóstico** — Identificação de valores inválidos, inconsistentes e duplicados
4. **Limpeza** — Remoção de 570 registros com problemas de qualidade
5. **Análise** — Cruzamento de variáveis e cálculo de indicadores
6. **Visualização** — Apresentação interativa via dashboard React

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── Dashboard/          # Componentes de visualização
│   │   ├── DashboardEnhanced.tsx
│   │   ├── Dashboard.tsx
│   │   └── Dashboard.css
│   ├── Hero/               # Seção principal (hero banner)
│   ├── About/              # Sobre o projeto
│   ├── Skills/             # Tecnologias utilizadas
│   ├── Projects/           # Resultados das análises
│   ├── Footer/             # Contato e terminal interativo
│   ├── Navbar/             # Navegação
│   ├── CyberBackground/    # Efeitos visuais de fundo
│   └── Common/             # Componentes reutilizáveis
├── data/
│   └── analysis.ts         # Dados processados e interfaces
├── hooks/
│   ├── useActiveSection.ts # Detecção de seção ativa
│   └── useTypewriter.ts    # Efeito de digitação
├── styles/
│   └── global.css          # Variáveis CSS e estilos globais
├── i18n.ts                 # Configuração de idiomas (PT/EN/ES)
├── App.tsx                 # Componente raiz
└── main.tsx                # Ponto de entrada
```

---

## Instalação e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+ (recomendado: 20 LTS)
- [npm](https://www.npmjs.com/) 9+

### Comandos

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/data-base-analysis.git
cd data-base-analysis

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Acessar no navegador
# → http://localhost:5173
```

### Scripts Disponíveis

| Comando | Descrição |
|:--------|:----------|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Build de produção (TypeScript + Vite) |
| `npm run preview` | Preview da build de produção |
| `npm run test` | Executa testes em modo watch |
| `npm run test:run` | Executa testes uma vez |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run lint` | Verificação de código com ESLint |

---

## Análises Disponíveis

### 1. Distribuição Regional

Análise comparativa dos 5 blocos regionais do Brasil (Norte, Nordeste, Centro-Oeste, Sudeste, Sul) com indicadores de:

- Volume de nascimentos
- Taxa de partos cesárea
- Percentual de baixo peso
- Taxa de prematuridade

### 2. Evolução Temporal

Série histórica de 2019 a 2023 permitindo identificar:

- Tendências de natalidade
- Variações nas taxas de cesárea
- Impacto de fatores sazonais

### 3. Perfil Materno

Segmentação por faixa etária:

- **Adolescente** (10–19 anos) — 11,0%
- **Adulta** (20–34 anos) — 78,1%
- **35+ anos** — 10,9%

### 4. Análise por Sexo

Distribuição dos nascimentos:

- **Feminino** — 46,8% (2.577)
- **Masculino** — 50,9% (2.802)

### 5. Dados Estaduais

Drill-down completo para 27 UF's com indicadores detalhados por estado.

---

## Contribuição

Este é um projeto acadêmico para fins de avaliação. Contribuições são bem-vindas através de Pull Requests.

```bash
# Criar branch para feature
git checkout -b feature/nova-funcionalidade

# Commitar alterações
git commit -m "Adiciona nova funcionalidade"

# Push para o repositório
git push origin feature/nova-funcionalidade
```

---

## Licença

Projeto acadêmico — Atividade Avaliativa de Banco de Dados.

---

<div align="center">

**Desenvolvido com ❤️ para análise de dados de saúde pública**

</div>
]]>