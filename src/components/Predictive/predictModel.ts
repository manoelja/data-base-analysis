// Matemática da predição de baixo peso ao nascer.
// Modelo: Regressão Logística (sklearn Pipeline: StandardScaler + LogisticRegression).
// Coeficientes/scaler gerados por ml/export_frontend_data.py -> src/data/ml.ts.
// Equivalente a: p = sigmoid(intercept + Σ coef_i * (x_i - mean_i) / scale_i)

import { lrBaixoPeso } from '../../data/ml';

export type Sexo = 'Feminino' | 'Masculino';
export type Regiao = 'Centro-Oeste' | 'Nordeste' | 'Norte' | 'Sudeste' | 'Sul';

export interface CalculatorInput {
  idade: number;      // 10–55
  consultas: number;  // 0–15
  semanas: number;    // 20–45
  ano: number;        // 2019–2023
  sexo: Sexo;
  regiao: Regiao;
}

export const REGIOES: Regiao[] = ['Centro-Oeste', 'Nordeste', 'Norte', 'Sudeste', 'Sul'];
export const ANOS = [2019, 2020, 2021, 2022, 2023];

// Ordem exata das colunas usadas no treino (exportada do Python).
const FEATURES = lrBaixoPeso.featureNames;

export function buildVector(inp: CalculatorInput): number[] {
  const map: Record<string, number> = {
    IDADE_MAE: inp.idade,
    CONSULTAS_PRENATAL: inp.consultas,
    SEMANAS_GESTACAO: inp.semanas,
    ANO: inp.ano,
    SEXO_Feminino: inp.sexo === 'Feminino' ? 1 : 0,
    SEXO_Masculino: inp.sexo === 'Masculino' ? 1 : 0,
  };
  REGIOES.forEach(r => { map[`REGIAO_${r}`] = inp.regiao === r ? 1 : 0; });
  // `?? 0` é uma salvaguarda: toda feature deve existir no mapa acima.
  return FEATURES.map(f => map[f] ?? 0);
}

export interface PredictionResult {
  prob: number;
  contributions: { feature: string; value: number }[]; // em escala logit
}

export function predict(inp: CalculatorInput): PredictionResult {
  const x = buildVector(inp);
  const { scalerMeans, scalerScales, coefficients, intercept } = lrBaixoPeso;
  const contributions = x.map((xi, i) => coefficients[i] * ((xi - scalerMeans[i]) / scalerScales[i]));
  const logit = intercept + contributions.reduce((a, b) => a + b, 0);
  return {
    prob: 1 / (1 + Math.exp(-logit)),
    contributions: contributions.map((v, i) => ({ feature: FEATURES[i], value: v })),
  };
}

export type ImpactField = 'idade' | 'consultas' | 'semanas' | 'ano' | 'sexo' | 'regiao';

const _round1 = (v: number) => Math.round(v * 10) / 10;

/**
 * Potencial de impacto de cada seletor: o máximo |Δ| em pontos percentuais
 * que alterar apenas aquele campo (mantendo os demais no valor atual) pode
 * causar na probabilidade. É dinâmico: comprime perto de 0% e 100% (sigmoid).
 */
export function impactPotential(input: CalculatorInput): Record<ImpactField, number> {
  const base = predict(input).prob * 100;
  const delta = (alt: CalculatorInput) => Math.abs(predict(alt).prob * 100 - base);

  let maxIdade = 0;
  for (let v = 10; v <= 55; v += 1) maxIdade = Math.max(maxIdade, delta({ ...input, idade: v }));
  let maxSemanas = 0;
  for (let v = 20; v <= 45; v += 1) maxSemanas = Math.max(maxSemanas, delta({ ...input, semanas: v }));
  let maxConsultas = 0;
  for (let v = 0; v <= 15; v += 1) maxConsultas = Math.max(maxConsultas, delta({ ...input, consultas: v }));

  const maxSexo = Math.max(
    delta({ ...input, sexo: 'Feminino' }),
    delta({ ...input, sexo: 'Masculino' }),
  );
  const maxRegiao = Math.max(...REGIOES.map(r => delta({ ...input, regiao: r })));
  const maxAno = Math.max(...ANOS.map(a => delta({ ...input, ano: a })));

  return {
    idade: _round1(maxIdade),
    consultas: _round1(maxConsultas),
    semanas: _round1(maxSemanas),
    ano: _round1(maxAno),
    sexo: _round1(maxSexo),
    regiao: _round1(maxRegiao),
  };
}
