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

## Machine Learning no navegador

Além do dashboard descritivo, o projeto tem uma seção de **Modelagem Preditiva** que roda **100% no navegador** (sem backend):

- **Calculadora de risco** — Sliders de idade da mãe, semanas de gestação e consultas de pré-natal + chips de sexo, região e ano. Em tempo real, mostra a probabilidade de **baixo peso ao nascer**, um gauge com o limiar de Youden, o badge de risco, os fatores de maior influência e um **indicador de impacto (± p.p.)** ao lado de cada campo.
- **Resultados dos modelos** — Importância SHAP das features, comparativo de 4 modelos (Dummy, Regressão Logística, Random Forest, XGBoost) com validação 5-fold e curvas ROC out-of-fold, com abas para baixo peso e prematuridade.
- **Como funciona** — Como a **Regressão Logística venceu o XGBoost** (o sinal do dataset é majoritariamente linear), os coeficientes + scaler são exportados para `src/data/ml.ts` e o cálculo `sigmoid(w·x + b)` é feito no próprio navegador.

> **Modelo em produção:** Regressão Logística — ROC-AUC 0.785 no baixo peso · limiar de Youden 0.544 · treinado em 5.379 registros completos (os 131 com campos ausentes foram descartados).

---

## Projeções 2024–2025 (método top-down)

A seção de modelagem também inclui uma **projeção exploratória de tendência** para 2024–2025, com banda de incerteza honesta (a especificação completa está em [`ml/PROJECAO_TECH_DESIGN.md`](ml/PROJECAO_TECH_DESIGN.md)).

O método, em 3 camadas:

1. **Total** — Regressão linear OLS do total de nascimentos sobre o ano, com **intervalo de predição de 95%** (2025: 1.100 [941–1.259]).
2. **Participações (%)** — Share de cada região, faixa etária e sexo, **ancorada no último valor observado (2023) + drift**, normalizada para somar 100%.
3. **Reconciliação** — Valor de cada grupo = total × share → as dimensões **somam exatamente o total projetado**.

A incerteza é propagada por método delta e cresce com o horizonte — por isso a projeção fica limitada a 2 anos (com 5 pontos anuais, prever 5 anos não seria estatisticamente defensável). O método foi validado com **holdout** (treino 2019–2022, teste em 2023): erro de **−2,0%** no total.

**Destaques encontrados:** participação do **Norte** em declínio (−0,39 p.p./ano, p = 0,044) e de **mães 35+** (−0,75 p.p./ano, p = 0,059) — os únicos sinais de tendência detectáveis em 5 anos de dados.

No front, o bloco exibe o gráfico (histórico sólido + projeção tracejada + banda sombreada), filtros por dimensão, alternância entre nascimentos e participação % e os cards de validação.

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

A modelagem preditiva usa **Python** (`scikit-learn`, `xgboost`, `shap`, `scipy`), com scripts em `ml/` que exportam os modelos e projeções para arquivos TypeScript estáticos consumidos pelo navegador:

| Script | Gera | Conteúdo |
|:--|:--|:--|
| `ml/export_frontend_data.py` | `src/data/ml.ts` | Modelo LR (scaler + coeficientes + limiar), SHAP, ROC, métricas |
| `ml/export_forecast.py` | `src/data/forecast.ts` | Projeção top-down 2024–2025 com intervalo de 95%, validação e destaques |

---

<div align="center">

**Desenvolvido com ❤️ para análise de dados de saúde pública**

</div>
