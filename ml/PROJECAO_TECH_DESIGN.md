# Design Técnico — Projeção Top-Down (2024–2025)

> **Status:** Proposta para revisão — nenhum código de aplicação foi alterado.
> **Método:** projeção hierárquica top-down (total + participações reconciliadas), com regressão linear sobre o tempo e intervalos de predição de 95%.
> **Motivação:** com apenas 5 pontos anuais (2019–2023), a abordagem defendável é a mais simples e transparente; as *participações* (%) são mais estáveis que os totais e revelam estrutura que os totais escondem (ex.: declínio significativo da participação do Norte, p=0,044).

---

## 1. Objetivo e escopo

| Item | Definição |
|:--|:--|
| Horizontes | **2024 e 2025** (2 anos — a banda de 95% já atinge ±14% no 2º ano; 5 anos foi descartado pela análise de viabilidade) |
| Dimensões | Total, **Região** (5), **Faixa etária** (3), **Sexo** (2) |
| Métrica projetada | Nascimentos (contagem) — e participação % em cada dimensão |
| Saída | `src/data/forecast.ts` (gerado por Python) + bloco "Projeções" no front |
| Fonte | `nascimentos.csv` + `uf_referencia.csv` após a limpeza do `pipeline.py` (5.510 registros) |

---

## 2. Dados de entrada

Séries derivadas no Python (mesma limpeza do `pipeline.py`):

- **Total por ano**: `df.groupby('ANO').size()` → 2019: 1.112 · 2020: 1.076 · 2021: 1.136 · 2022: 1.076 · 2023: 1.110
- **Participação por dimensão**: `df.groupby(['ANO', COLUNA]).size().unstack()` → share % = contagem do grupo ÷ total do ano × 100
  - Região: `REGIAO` · Faixa etária: `FAIXA_IDADE_MAE` · Sexo: `SEXO`

---

## 3. Visão geral do método (3 camadas)

```
┌────────────────────────────────────────────────────────────┐
│ CAMADA 1 — TOTAL                                           │
│   OLS:  T̂(t) = a + b·t   +  intervalo de predição 95%      │
├────────────────────────────────────────────────────────────┤
│ CAMADA 2 — PARTICIPAÇÕES (por dimensão)                    │
│   ŝᵢ(t) = sᵢ(2023) + bᵢ·(t − 2023)   [share ancorada]      │
│   ŝ'ᵢ(t) = ŝᵢ(t) / Σⱼ ŝⱼ(t) · 100    [normalização → soma 1] │
├────────────────────────────────────────────────────────────┤
│ CAMADA 3 — RECONCILIAÇÃO                                   │
│   ŷᵢ(t) = T̂(t) · ŝ'ᵢ(t)/100                               │
│   (Σᵢ ŷᵢ(t) = T̂(t) por construção)                        │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Camada 1 — Projeção do total

### 4.1 Fórmulas (mínimos quadrados ordinários, OLS)

Com n = 5 pontos `(xᵢ, yᵢ)` (xᵢ = ano):

```
b = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²          → inclinação (nascimentos/ano)
a = ȳ − b·x̄                              → intercepto
ŷ(x₀) = a + b·x₀                          → ponto projetado

Intervalo de PREDIÇÃO 95% em x₀:
  ŷ(x₀) ± t_{0.975; n−2} · s · √( 1 + 1/n + (x₀ − x̄)² / Sxx )
onde:
  s²  = SSE/(n−2)        (variância residual)
  SSE = Σ(yᵢ − ŷᵢ)²
  Sxx = Σ(xᵢ − x̄)²
```

> Usa-se **intervalo de predição** (e não de confiança da média): ele inclui o erro do processo, correto para um novo ano futuro.

### 4.2 Números reais (computados)

| Ano | T̂(t) | IC 95% | Amplitude |
|---|---:|---:|---:|
| 2024 | **1.100,8** | [963,2 – 1.238,4] | ±137,6 (±12,5%) |
| 2025 | **1.100,4** | [941,5 – 1.259,3] | ±158,9 (±14,4%) |

Parâmetros: `a = 1.910,4` · `b = −0,40 nasc/ano` (p = 0,969 — sem tendência significativa) · `s = 29,84`.

---

## 5. Camada 2 — Projeção das participações (shares)

### 5.1 Por que "ancorada" e não OLS pura

A extrapolação OLS pura de uma share não fica presa ao último valor observado e pode produzir saltos implausíveis. Exemplo real da série **Sexo Feminino** por ano: `50,4 → 48,5 → 45,0 → 44,8 → 50,8` (formato de "V", com vale em 2021–22). O OLS puro projetou 2025 em **46,75%** — um salto de −4 p.p. em 2 anos, inconsistente com o 50,8% observado em 2023. A versão **ancorada** projeta **50,25%**, contínua e intuitiva.

### 5.2 Fórmula

```
bᵢ = inclinação OLS da share sᵢ (mesmo ajuste da seção 4.1, aplicado à série de %)
ŝᵢ(t) = sᵢ(2023) + bᵢ·(t − 2023)              ← ancorada no último valor
ŝ'ᵢ(t) = ŝᵢ(t) / Σⱼ ŝⱼ(t) · 100               ← normalização (soma = 100%)
```

A normalização garante **coerência**: em cada ano, as participações de uma dimensão somam exatamente 100%, independentemente da precisão dos bᵢ.

### 5.3 Números reais (participações %, já normalizadas)

**Região**

| Região | 2023 (real) | 2024 | 2025 | bᵢ (p.p./ano) |
|---|---:|---:|---:|---:|
| Norte | 8,38 | 7,99 | **7,61** | **−0,39** (p=0,044 ✅) |
| Nordeste | 25,41 | 25,04 | 24,67 | −0,37 |
| Centro-Oeste | 8,11 | 8,09 | 8,08 | −0,02 |
| Sudeste | 43,42 | 44,27 | 45,11 | +0,84 |
| Sul | 14,68 | 14,61 | 14,54 | −0,07 |

**Faixa etária**

| Faixa | 2023 (real) | 2024 | 2025 | bᵢ |
|---|---:|---:|---:|---:|
| 35 ou mais | 9,28 | 8,53 | **7,79** | **−0,75** (p=0,059, limítrofe) |
| Adolescente | 12,97 | 13,37 | 13,76 | +0,39 |
| Adulta | 77,75 | 78,10 | 78,45 | +0,35 |

**Sexo**

| Sexo | 2023 (real) | 2024 | 2025 | bᵢ |
|---|---:|---:|---:|---:|
| Feminino | 50,83 | 50,54 | 50,25 | −0,29 |
| Masculino | 49,17 | 49,46 | 49,75 | +0,29 |

---

## 6. Camada 3 — Reconciliação e propagação de incerteza

### 6.1 Reconciliação (ponto)

```
ŷᵢ(t) = T̂(t) · ŝ'ᵢ(t)/100
```

**Exemplo calculado — Região Norte em 2025:** `1.100,4 × 7,61% ≈ 84 nascimentos` (2023: 93; ou seja, −9).
**Exemplo — Faixa 35+ em 2025:** `1.100,4 × 7,79% ≈ 86` (2023: 103; −17).

Propriedade garantida por construção: **Σᵢ ŷᵢ(t) = T̂(t)** em cada dimensão e ano.

### 6.2 Propagação da incerteza (aproximação de 1ª ordem)

Tratando T̂ e ŝᵢ como aproximadamente independentes e aplicando o método delta sobre `ŷᵢ = T̂·ŝᵢ/100`:

```
Var(ŷᵢ) ≈ (ŝ'ᵢ/100)²·Var(T̂) + (T̂/100)²·Var(ŝᵢ)
SE(ŷᵢ)  = √Var(ŷᵢ)
banda 95% = ŷᵢ ± t_{0.975; n−2}·SE(ŷᵢ)   (t e n da série do total)
```

Onde `Var(T̂)` vem do quadrado do SE de predição da Camada 1, e `Var(ŝᵢ)` do SE de predição da regressão da share na Camada 2.

**Limitações assumidas (documentadas na UI):**
- A independência é aproximada — as shares são negativamente correlacionadas por construção (somam 100%). O método delta de 1ª ordem é suficiente para um intervalo *indicativo*; não se busca exatidão estatística formal com 5 pontos.
- O limite inferior é **limitado em 0** (`max(lo, 0)`), pois contagens não podem ser negativas.

---

## 7. Validação holdout (honestidade do método)

Procedimento em cada série:

```
Treino: 2019–2022 (4 pontos) → ajustar OLS → prever 2023
Teste:  2023 (nunca visto pelo modelo)
Métricas: erro absoluto, erro % (MAPE), e comparação com baseline "último valor"
```

**Resultado computado — Total:** previsto 1.088 vs. real 1.110 → erro **−2,0%** (baseline último valor: −1,6%). O erro relativo é o que será exibido na UI.

Para as shares, o mesmo procedimento será aplicado (treinar shares até 2022, prever a share de 2023) e reportado como **MAE em p.p. por dimensão**. Isso prova que o método não está "colando" no ano de teste.

---

## 8. Casos especiais e guardas

| Caso | Tratamento |
|:--|:--|
| Share projetada fora de [0, 100] | `clamp` a [0,1, 99,9] antes de normalizar (drift 2 anos é pequeno; só por segurança) |
| Contagem projetada negativa | `max(lo, 0)` e `max(ŷ, 0)` |
| Série com anos faltando | `reindex` com `fill_value=0` (não ocorre nos dados atuais — 5/5 anos presentes) |
| Divisão por zero no total | não ocorre (total > 1.000 em todos os anos) |
| `NaN` em SEXO/REGIAO/FAIXA | não entram nas shares (dropna implícito do `groupby`) |

---

## 9. Estrutura dos dados exportados — `src/data/forecast.ts`

Gerado por um novo script Python (`ml/export_forecast.py`), no mesmo padrão do `export_frontend_data.py`.

```ts
export type ForecastDimension = 'total' | 'regiao' | 'faixa_etaria' | 'sexo';

export interface ForecastPoint {
  year: number;
  value: number;      // valor real observado
}

export interface ProjectionPoint {
  year: number;       // 2024 | 2025
  value: number;      // ponto projetado (reconciliado)
  lo: number;         // limite inferior 95%
  hi: number;         // limite superior 95%
}

export interface ForecastSeries {
  id: string;         // ex.: 'regiao_norte', 'faixa_adulta', 'total'
  dimension: ForecastDimension;
  label: string;      // ex.: 'Norte'
  history: ForecastPoint[];          // 2019–2023
  projection: ProjectionPoint[];     // 2024–2025 (contagens)
  shareHistory?: ForecastPoint[];    // participação % 2019–2023 (exceto total)
  shareProjection?: ProjectionPoint[]; // participação % projetada
}

export interface ForecastHighlights {
  id: string;         // ex.: 'regiao_norte'
  direction: 'up' | 'down';
  slopePp: number;    // inclinação da share em p.p./ano
  pValue: number;
}

export interface ForecastValidation {
  totalHoldout: { predicted: number; actual: number; errorPct: number };
  shareMaePp: Record<ForecastDimension, number>; // MAE (p.p.) da validação das shares
}

export const forecastData: {
  total: ForecastSeries;
  regiao: ForecastSeries[];
  faixaEtaria: ForecastSeries[];
  sexo: ForecastSeries[];
  highlights: ForecastHighlights[];
  validation: ForecastValidation;
} = { /* gerado */ };
```

### Exemplo de conteúdo gerado (Região Norte)

```ts
{
  id: 'regiao_norte',
  dimension: 'regiao',
  label: 'Norte',
  history: [ { year: 2019, value: 110 }, ..., { year: 2023, value: 93 } ],
  projection: [ { year: 2024, value: 88, lo: 72, hi: 104 }, { year: 2025, value: 84, lo: 66, hi: 102 } ],
  shareHistory: [ { year: 2019, value: 9.9 }, ..., { year: 2023, value: 8.38 } ],
  shareProjection: [ { year: 2024, value: 7.99, lo: 6.9, hi: 9.1 }, { year: 2025, value: 7.61, lo: 6.4, hi: 8.9 } ],
}
```

---

## 10. Integração no front

Novo bloco **"Projeções 2024–2025"** dentro da seção Modelagem Preditiva (após o painel de resultados):

1. **Gráfico de linha** (SVG, mesmo padrão das curvas ROC):
   - Histórico 2019–2023 em linha sólida; projeção 2024–2025 tracejada; **banda de incerteza** sombreada (área entre lo e hi).
   - **Seletor de dimensão**: Total · Região · Faixa etária · Sexo (chips, como na calculadora).
   - Para Região/Faixa/Sexo, seletor de grupo (ex.: todas as 5 regiões, com legenda).
2. **Cards de destaque** (achados): *Participação do Norte em declínio* (p=0,044) e *Mães 35+ em declínio* (p=0,059) — com a inclinação em p.p./ano.
3. **Card de validação**: holdout do total (erro ~2%) + MAE das shares — honestidade do método.
4. **Disclaimer** (i18n): "Projeção de tendência exploratória com incerteza quantificada — não substitui projeções oficiais."
5. i18n pt/en/es + tema claro/escuro (variáveis CSS existentes).

---

## 11. Testes unitários planejados (vitest)

| Teste | Verificação |
|:--|:--|
| `shares somam 100%` | Para cada dimensão e ano projetado: Σ share = 100 (±0,1) |
| `reconciliação fecha` | Para cada dimensão e ano: Σ valores reconciliados = total projetado (±1) |
| `histórico correto` | Total 2019–2023 = [1112, 1076, 1136, 1076, 1110] |
| `bandas coerentes` | Para todo ponto projetado: `lo ≤ value ≤ hi` |
| `limite inferior ≥ 0` | `lo ≥ 0` em todas as séries |
| `integridade dos destaques` | `highlight.id` existe em alguma série; `pValue` preenchido |
| `validação presente` | `validation.totalHoldout` e `shareMaePp` não vazios |

---

## 12. Riscos e limitações (para constar na entrega)

1. **5 pontos anuais** → a banda de 95% no 2º ano é larga (±14% no total); por isso o horizonte é 2024–2025, nunca 5 anos.
2. **Inclinações frágeis**: apenas a share do **Norte** é estatisticamente significativa (p=0,044); a de **35+** é limítrofe (p=0,059). As demais são "estáveis" — a projeção as mantém ~constantes, o que é o comportamento correto.
3. **Ancoragem**: a share ancorada evita saltos artificiais (caso Sexo), mas assume que o último ano observado é o ponto de partida mais confiável.
4. **Aproximação da incerteza**: método delta de 1ª ordem com independência aproximada — banda **indicativa**, não inferência formal.
5. **Série de Sexo em "V"** (2021–22 anômalos): a ancoragem mitiga, mas a inclinação é sensível a outliers.

---

## 13. Critérios de aceite (para a revisão)

- [ ] Participações normalizadas somam 100% em cada ano projetado.
- [ ] Σ valores reconciliados = total projetado (±1) em todas as dimensões.
- [ ] Holdout do total reportado (≈ −2%) e MAE das shares por dimensão.
- [ ] Banda de incerteza (lo/hi) visível no gráfico, com limite inferior ≥ 0.
- [ ] Destaques Norte (p=0,044) e 35+ (p=0,059) presentes com inclinação em p.p./ano.
- [ ] `src/data/forecast.ts` gerado por `ml/export_forecast.py` (reproduzível).
- [ ] `npm run build` · `npm run test:run` · `npm run lint` verdes.
