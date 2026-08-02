import { describe, it, expect } from 'vitest';
import {
  buildVector, impactPotential, predict, REGIOES,
  type CalculatorInput,
} from '../components/Predictive/predictModel';

// Valores de referência calculados no sklearn (ver ml/export_frontend_data.py):
// p = sigmoid(intercept + Σ coef_i * (x_i - mean_i) / scale_i)
const defaultInput: CalculatorInput = {
  idade: 26, consultas: 8, semanas: 39, ano: 2023,
  sexo: 'Masculino', regiao: 'Sudeste',
};

describe('predictModel — Regressão Logística de baixo peso (client-side)', () => {
  it('buildVector monta o vetor na ordem exata das features exportadas', () => {
    const v = buildVector(defaultInput);
    expect(v).toHaveLength(11); // 4 numéricas + 2 sexo + 5 regiões
    expect(v[0]).toBe(26);      // IDADE_MAE
    expect(v[1]).toBe(8);       // CONSULTAS_PRENATAL
    expect(v[2]).toBe(39);      // SEMANAS_GESTACAO
    expect(v[3]).toBe(2023);    // ANO
    expect(v[4]).toBe(0);       // SEXO_Feminino
    expect(v[5]).toBe(1);       // SEXO_Masculino
    expect(v[6]).toBe(0);       // REGIAO_Centro-Oeste
    expect(v[9]).toBe(1);       // REGIAO_Sudeste
    expect(v[10]).toBe(0);      // REGIAO_Sul
  });

  it('one-hot é mutuamente exclusivo para sexo e região', () => {
    const fem = buildVector({ ...defaultInput, sexo: 'Feminino' });
    expect(fem[4]).toBe(1);
    expect(fem[5]).toBe(0);

    const norte = buildVector({ ...defaultInput, regiao: 'Norte' });
    expect(norte[8]).toBe(1);   // REGIAO_Norte
    expect(norte[6]).toBe(0);   // Centro-Oeste
    expect(norte[9]).toBe(0);   // Sudeste
  });

  it('previsão padrão (26a, 8 consultas, 39 sem, Sudeste, M) ≈ 0.3331', () => {
    expect(predict(defaultInput).prob).toBeCloseTo(0.333135, 4);
  });

  it('caso de baixo risco (32a, 10 consultas, 42 sem) ≈ 0.0976', () => {
    const input: CalculatorInput = {
      idade: 32, consultas: 10, semanas: 42, ano: 2023,
      sexo: 'Feminino', regiao: 'Sudeste',
    };
    expect(predict(input).prob).toBeCloseTo(0.097563, 4);
  });

  it('probabilidade permanece no intervalo [0, 1] para extremos', () => {
    const extremo: CalculatorInput = {
      idade: 10, consultas: 0, semanas: 20, ano: 2019,
      sexo: 'Masculino', regiao: 'Norte',
    };
    const p = predict(extremo).prob;
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(1);
  });

  it('contributions seguem a ordem das features', () => {
    const { contributions } = predict(defaultInput);
    expect(contributions).toHaveLength(11);
    expect(contributions[0].feature).toBe('IDADE_MAE');
    expect(contributions[2].feature).toBe('SEMANAS_GESTACAO');
  });

  it('lista de regiões é consistente', () => {
    expect(REGIOES).toEqual(['Centro-Oeste', 'Nordeste', 'Norte', 'Sudeste', 'Sul']);
  });
});

describe('impactPotential — sensibilidade de cada seletor', () => {
  it('semanas de gestação é o fator dominante no caso padrão', () => {
    const imp = impactPotential(defaultInput);
    expect(imp.semanas).toBeGreaterThan(50);      // ~66,7 p.p.
    expect(imp.regiao).toBeGreaterThan(imp.sexo); // ~8,4 > ~5,5
    expect(imp.sexo).toBeGreaterThan(imp.ano);    // ~5,5 > ~1,0
  });

  it('ano tem impacto mínimo', () => {
    expect(impactPotential(defaultInput).ano).toBeLessThan(2);
  });

  it('o impacto se comprime perto da saturação do sigmoid (34 semanas)', () => {
    const imp = impactPotential({ ...defaultInput, semanas: 34 });
    expect(imp.sexo).toBeLessThan(2);
  });
});
