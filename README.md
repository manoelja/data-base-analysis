<div align="center">

# Data Base Analysis

### Dashboard Interativo — Nascidos Vivos Brasileiros (2019–2023)

</div>

---

## Sobre o projeto

O Data Base Analysis é um dashboard interativo que visualiza dados de nascidos vivos no Brasil, usando informações reais do **SINASC (Sistema de Informação sobre Nascidos Vivos)** do DataSUS, cobrindo o período de 2019 a 2023.

O projeto surgiu como atividade avaliativa da disciplina de Banco de Dados, mas foi pensado para ir além de um simples trabalho acadêmico. A ideia era criar uma ferramenta visual que permitisse explorar indicadores de saúde pública de forma acessível — sem precisar lidar com planilhas enormes ou arquivos brutos.

---

## O que ele faz

Com dados de **mais de 6 mil nascidos vivos**, o dashboard permite:

- **Explorar por região** — Compare os 5 blocos regionais do Brasil (Norte, Nordeste, Centro-Oeste, Sudeste, Sul) e veja como nascimentos, taxas de cesárea, baixo peso e prematuridade variam entre eles.
- **Acompanhar a evolução temporal** — Série histórica de 2019 a 2023 para identificar tendências de natalidade e variações ao longo dos anos.
- **Conhecer o perfil das mães** — Segmentação por faixa etária, mostrando que a maioria das mães está na faixa adulta (20–34 anos), com 11% sendo adolescentes.
- **Analisar por sexo** — Distribuição quase equilibrada entre nascimentos masculinos (50,9%) e femininos (46,8%).
- **Detalhar estado por estado** — Drill-down completo para todas as 27 UF's com indicadores específicos.

---

## Como funciona a limpeza dos dados

Dados reais do DataSUS vêm com imperfeições. Foram identificados e removidos **570 registros** (9,4%) que apresentavam problemas:

- Pesos de nascimento fora do esperado ou ausentes
- Idades maternas incompatíveis com a faixa biológica
- Siglas de estados inválidas
- Registros duplicados

O que sobrou são **5.510 registros limpos**, prontos para análise.

---

## O dashboard oferece

- **7 tipos de gráficos** — Barras, linhas, donut, tabela e mais
- **Filtros combináveis** — Região, ano, faixa etária e sexo juntos
- **Modo claro e escuro** — Para gostar de cada um
- **3 idiomas** — Português, Inglês e Espanhol
- **Terminal interativo** — Um simulador de comandos em R, SQL e CMD para quem quiser brincar
- **Responsivo** — Funciona no celular e no desktop

---

## Como rodar

Precisa ter o [Node.js](https://nodejs.org/) versão 18 ou superior instalado.

```bash
git clone https://github.com/manoelja/data-base-analysis.git
cd data-base-analysis
npm install
npm run dev
```

Depois é só abrir `http://localhost:5173` no navegador.

---

## Tecnologias

O projeto foi construído com **React + TypeScript**, usando **Vite** como ferramenta de build. Os dados foram processados em **R** com persistência em **SQLite**, e o dashboard conta com animações via **Framer Motion** e internacionalização com **i18next**.

---

<div align="center">

**Desenvolvido com ❤️ para análise de dados de saúde pública**

</div>
