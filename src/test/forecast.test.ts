import { describe, it, expect } from 'vitest';
import {
  forecastData,
  type ForecastSeries,
} from '../data/forecast';

// Valores de referência do método top-down (ml/PROJECAO_TECH_DESIGN.md):
// histórico 2019-2023, projeção 2024-2025, shares normalizadas e reconciliação exata.

const PROJ_YEARS = [2024, 2025];

function allSeries(): ForecastSeries[] {
  return [forecastData.total, ...forecastData.regiao, ...forecastData.faixaEtaria, ...forecastData.sexo];
}

describe('forecast.ts — integridade da projeção top-down', () => {
  it('histórico tem exatamente os 5 anos (2019-2023) em todas as séries', () => {
    const anos = [2019, 2020, 2021, 2022, 2023];
    for (const s of allSeries()) {
      expect(s.history.map(p => p.year)).toEqual(anos);
    }
  });

  it('projeção cobre 2024-2025 e as bandas são coerentes (lo <= valor <= hi)', () => {
    for (const s of allSeries()) {
      expect(s.projection.map(p => p.year)).toEqual(PROJ_YEARS);
      for (const p of s.projection) {
        expect(p.lo).toBeLessThanOrEqual(p.value);
        expect(p.value).toBeLessThanOrEqual(p.hi);
      }
    }
  });

  it('participações somam 100% em 2025 para todas as dimensões', () => {
    const somaShares = (list: ForecastSeries[]) =>
      list.reduce((acc, s) => acc + (s.shareProjection?.find(p => p.year === 2025)?.value ?? 0), 0);
    expect(somaShares(forecastData.regiao)).toBeCloseTo(100, 1);
    expect(somaShares(forecastData.faixaEtaria)).toBeCloseTo(100, 1);
    expect(somaShares(forecastData.sexo)).toBeCloseTo(100, 1);
  });

  it('reconciliação no histórico: regiões e faixas etárias somam o total em cada ano', () => {
    const totalPorAno = new Map(forecastData.total.history.map(p => [p.year, p.value]));
    const somaPorAno = (list: ForecastSeries[]) => {
      const acc = new Map<number, number>();
      for (const s of list) {
        for (const p of s.history) {
          acc.set(p.year, (acc.get(p.year) ?? 0) + p.value);
        }
      }
      return acc;
    };
    // REGIAO e FAIXA_IDADE_MAE são completos: soma == total exato por ano.
    for (const list of [forecastData.regiao, forecastData.faixaEtaria]) {
      const soma = somaPorAno(list);
      for (const [ano, total] of totalPorAno) {
        expect(soma.get(ano)).toBe(total);
      }
    }
  });

  it('sexo: histórico exclui registros sem SEXO (gap documentado = 131, o mesmo da amostra de ML)', () => {
    const totalPorAno = new Map(forecastData.total.history.map(p => [p.year, p.value]));
    let gap = 0;
    for (const [ano, total] of totalPorAno) {
      const soma = forecastData.sexo.reduce((acc, s) => acc + (s.history.find(h => h.year === ano)?.value ?? 0), 0);
      expect(soma).toBeLessThanOrEqual(total);
      gap += total - soma;
    }
    expect(gap).toBe(131); // registros sem SEXO — os mesmos 131 da queda 5.510 → 5.379 na modelagem
  });

  it('shareHistory soma ~100% em todos os anos observados', () => {
    const somaShare = (list: ForecastSeries[], ano: number) =>
      list.reduce((acc, s) => acc + (s.shareHistory?.find(p => p.year === ano)?.value ?? 0), 0);
    for (const list of [forecastData.regiao, forecastData.faixaEtaria, forecastData.sexo]) {
      for (const ano of [2019, 2020, 2021, 2022, 2023]) {
        expect(somaShare(list, ano)).toBeCloseTo(100, 1);
      }
    }
  });

  it('reconciliação: valores projetados somam o total projetado em 2025', () => {
    const total2025 = forecastData.total.projection.find(p => p.year === 2025)?.value ?? 0;
    const somaValores = (list: ForecastSeries[]) =>
      list.reduce((acc, s) => acc + (s.projection.find(p => p.year === 2025)?.value ?? 0), 0);
    expect(somaValores(forecastData.regiao)).toBeCloseTo(total2025, 0);
    expect(somaValores(forecastData.faixaEtaria)).toBeCloseTo(total2025, 0);
    expect(somaValores(forecastData.sexo)).toBeCloseTo(total2025, 0);
  });

  it('destaques referenciam séries que existem nos dados', () => {
    const ids = new Set(allSeries().map(s => s.id));
    for (const h of forecastData.highlights) {
      expect(ids.has(h.id)).toBe(true);
    }
  });

  it('destaques são tendências quase significativas (p < 0,1) com drift relevante', () => {
    for (const h of forecastData.highlights) {
      expect(h.pValue).toBeGreaterThan(0);
      expect(h.pValue).toBeLessThan(0.1);
      expect(Math.abs(h.slopePp)).toBeGreaterThan(0.3);
    }
  });

  it('validação holdout registra o erro real do total (≈ -2%)', () => {
    const h = forecastData.validation.totalHoldout;
    expect(h.actual).toBe(1110);            // real 2023
    expect(h.predicted).toBeCloseTo(1088, 0);
    expect(h.errorPct).toBeCloseTo(-2, 1);
  });

  it('MAE de participação é reportado para todas as dimensões', () => {
    for (const d of ['regiao', 'faixa_etaria', 'sexo'] as const) {
      expect(forecastData.validation.shareMaePp[d]).toBeGreaterThan(0);
    }
  });
});
