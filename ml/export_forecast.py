"""
ml/export_forecast.py
=====================
Gera `src/data/forecast.ts` com a projeção top-down 2024-2025.

Método (detalhado em ml/PROJECAO_TECH_DESIGN.md):
1. Total: regressão linear OLS sobre o ano + intervalo de PREDIÇÃO de 95%.
2. Participações (%): share ancorada no último valor observado (2023) + drift
   (inclinação OLS da série de shares), com clamp e normalização (soma = 100%).
3. Reconciliação: contagem de cada grupo = total projetado x share normalizada.
4. Incerteza: método delta de 1a ordem  Var(y) = (s/100)^2*Var(T) + (T/100)^2*Var(s).
5. Validação holdout: treino 2019-2022 -> teste 2023 (total e shares).
6. Destaques: shares com tendência significativa (p < 0.10 e |b| >= 0.2 p.p./ano).

Executar: python ml/export_forecast.py
Regenera o arquivo src/data/forecast.ts (não editar manualmente).
"""

from __future__ import annotations

import json
import os
import sys

import numpy as np
import pandas as pd
from scipy import stats

import pipeline

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = pipeline.ROOT
OUT_TS = os.path.join(ROOT, "src", "data", "forecast.ts")

SEED_YEARS = [2019, 2020, 2021, 2022, 2023]
FUTURE = [2024, 2025]
LAST = SEED_YEARS[-1]
DIMS = [("regiao", "REGIAO"), ("faixa_etaria", "FAIXA_IDADE_MAE"), ("sexo", "SEXO")]


def load() -> pd.DataFrame:
    nasc, uf = pipeline.load_data()
    df, _ = pipeline.clean_data(nasc, uf)
    return pipeline.adicionar_regiao(pipeline.derive_features(df), uf)


def _ols(x: np.ndarray, y: np.ndarray) -> stats.linregress_result:
    return stats.linregress(x, y)


def _pred_se(x: np.ndarray, y: np.ndarray, x0: float) -> float:
    """Erro padrão de PREDIÇÃO do OLS em x0 (inclui o erro do processo)."""
    res = _ols(x, y)
    n = len(x)
    s2 = np.sum((y - (res.slope * x + res.intercept)) ** 2) / (n - 2)
    xm = x.mean()
    sxx = np.sum((x - xm) ** 2)
    return float(np.sqrt(s2 * (1 + 1 / n + (x0 - xm) ** 2 / sxx)))


def _tcrit(n: int = len(SEED_YEARS)) -> float:
    return float(stats.t.ppf(0.975, n - 2))


def _clamp(v: float, lo: float, hi: float) -> float:
    return min(max(v, lo), hi)


def project_total(df: pd.DataFrame) -> tuple[list[dict], list[dict], list[dict]]:
    """(history, projection, proj_com_se) para o total."""
    y = df.groupby("ANO").size().reindex(SEED_YEARS).to_numpy(dtype=float)
    x = np.array(SEED_YEARS, dtype=float)
    res = _ols(x, y)
    t = _tcrit(len(y))
    history = [{"year": int(a), "value": int(v)} for a, v in zip(x, y)]
    projection = []
    proj_se = []
    for a in FUTURE:
        yh = res.slope * a + res.intercept
        se = _pred_se(x, y, a)
        projection.append({
            "year": a,
            "value": round(float(yh), 1),
            "lo": round(float(max(0.0, yh - t * se)), 1),
            "hi": round(float(yh + t * se), 1),
        })
        proj_se.append(round(float(se), 3))
    return history, projection, proj_se


def project_dimension(
    df: pd.DataFrame, dim: str, column: str,
    total_proj: list[dict], total_se: list[float],
) -> tuple[list[dict], list[dict]]:
    """(series, highlights) para uma dimensão. Reconciliado com o total."""
    cr = df.groupby(["ANO", column]).size().unstack(fill_value=0).reindex(SEED_YEARS)
    tot = cr.sum(axis=1)
    sh = cr.div(tot, axis=0) * 100  # participação % por ano
    x = np.array(SEED_YEARS, dtype=float)
    t = _tcrit(len(x))

    raw: list[dict] = []
    for col in sh.columns:
        yy = sh[col].to_numpy(dtype=float)
        res = _ols(x, yy)
        last_s = float(yy[-1])
        b = float(res.slope)
        points = []
        for a in FUTURE:
            s = _clamp(last_s + b * (a - LAST), 0.1, 99.9)
            se = _pred_se(x, yy, a)
            points.append({
                "year": a,
                "value": s,                 # raw (antes de normalizar)
                "lo": max(0.0, s - t * se),
                "hi": min(100.0, s + t * se),
                "se": se,
            })
        raw.append({"label": str(col), "b": b, "p": float(res.pvalue), "points": points})

    # --- Normalização das shares (e dos limites/SE) por ano ---
    for i in range(len(FUTURE)):
        s_tot = sum(r["points"][i]["value"] for r in raw)
        for r in raw:
            f = 100.0 / s_tot
            r["points"][i]["value"] *= f
            r["points"][i]["lo"] = _clamp(r["points"][i]["lo"] * f, 0.0, 100.0)
            r["points"][i]["hi"] = _clamp(r["points"][i]["hi"] * f, 0.0, 100.0)
            r["points"][i]["se"] *= f

    # --- Monta séries (histórico + share + projeção reconciliada) ---
    series = []
    for r in raw:
        share_history = [
            {"year": int(a), "value": round(float(v), 2)}
            for a, v in zip(x, sh[r["label"]].to_numpy(dtype=float))
        ]
        share_projection = []
        projection = []
        for i, a in enumerate(FUTURE):
            s_norm = r["points"][i]["value"]
            T = total_proj[i]["value"]
            se_T = total_se[i]
            se_s = r["points"][i]["se"]
            yhat = T * s_norm / 100.0
            var = (s_norm / 100.0) ** 2 * se_T ** 2 + (T / 100.0) ** 2 * se_s ** 2
            se_y = float(np.sqrt(var))
            share_projection.append({
                "year": a,
                "value": round(s_norm, 2),
                "lo": round(r["points"][i]["lo"], 2),
                "hi": round(r["points"][i]["hi"], 2),
            })
            projection.append({
                "year": a,
                "value": round(yhat, 1),
                "lo": round(max(0.0, yhat - t * se_y), 1),
                "hi": round(yhat + t * se_y, 1),
            })
        series.append({
            "id": f"{dim}_{_slug(r['label'])}",
            "dimension": dim,
            "label": r["label"],
            "history": [
                {"year": int(a), "value": int(v)}
                for a, v in zip(x, cr[r["label"]].to_numpy(dtype=int))
            ],
            "projection": projection,
            "shareHistory": share_history,
            "shareProjection": share_projection,
            "slopePp": round(r["b"], 3),
            "pValue": round(r["p"], 3),
        })
    return series


def _slug(label: str) -> str:
    return "".join(c if c.isalnum() else "_" for c in label.lower()).strip("_")


def holdout_total(df: pd.DataFrame) -> dict:
    y = df.groupby("ANO").size().reindex(SEED_YEARS).to_numpy(dtype=float)
    x = np.array(SEED_YEARS[:-1], dtype=float)
    res = _ols(x, y[:-1])
    pred = res.slope * 2023 + res.intercept
    actual = float(y[-1])
    return {
        "predicted": round(float(pred), 1),
        "actual": int(actual),
        "errorPct": round(float((pred - actual) / actual * 100), 1),
    }


def holdout_share_mae(df: pd.DataFrame, column: str) -> float:
    """Treina shares 2019-2022 (ancoradas em 2022), prevê 2023, MAE em p.p."""
    cr = df.groupby(["ANO", column]).size().unstack(fill_value=0).reindex(SEED_YEARS)
    sh = cr.div(cr.sum(axis=1), axis=0) * 100
    x = np.array(SEED_YEARS[:-1], dtype=float)
    pred = {}
    for col in sh.columns:
        res = _ols(x, sh[col].iloc[:-1].to_numpy(dtype=float))
        pred[col] = float(sh[col].iloc[-2]) + float(res.slope) * 1  # ancorada em 2022
    s_tot = sum(pred.values())
    pred = {k: v / s_tot * 100 for k, v in pred.items()}
    real = sh.iloc[-1].to_dict()
    mae = float(np.mean([abs(pred[k] - real[k]) for k in real]))
    return round(mae, 2)


def _js(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=2)


def main() -> None:
    df = load()

    hist_t, proj_t, se_t = project_total(df)
    total_series = {
        "id": "total",
        "dimension": "total",
        "label": "Total",
        "history": hist_t,
        "projection": proj_t,
    }

    dims_series = {}
    all_series: list[dict] = []
    for dim, column in DIMS:
        series = project_dimension(df, dim, column, proj_t, se_t)
        dims_series[dim] = series
        all_series.extend(series)

    # Destaques: shares com tendência (p < 0.10 e |b| >= 0.2 p.p./ano), por p
    highlights = sorted(
        [
            {
                "id": s["id"],
                "direction": "up" if s["slopePp"] > 0 else "down",
                "slopePp": s["slopePp"],
                "pValue": s["pValue"],
            }
            for s in all_series
            if s["pValue"] < 0.10 and abs(s["slopePp"]) >= 0.2
        ],
        key=lambda h: h["pValue"],
    )

    validation = {
        "totalHoldout": holdout_total(df),
        "shareMaePp": {dim: holdout_share_mae(df, column) for dim, column in DIMS},
    }

    os.makedirs(os.path.dirname(OUT_TS), exist_ok=True)
    content = f"""// Auto-gerado por ml/export_forecast.py — NÃO editar manualmente.
// Projeção top-down 2024-2025 (método em ml/PROJECAO_TECH_DESIGN.md):
// total OLS + participações ancoradas + reconciliação + intervalo 95%.

export type ForecastDimension = 'total' | 'regiao' | 'faixa_etaria' | 'sexo';

export interface ForecastPoint {{
  year: number;
  value: number;
}}

export interface ProjectionPoint {{
  year: number;
  value: number;
  lo: number;
  hi: number;
}}

export interface ForecastSeries {{
  id: string;
  dimension: ForecastDimension;
  label: string;
  history: ForecastPoint[];
  projection: ProjectionPoint[];
  shareHistory?: ForecastPoint[];
  shareProjection?: ProjectionPoint[];
  slopePp?: number;
  pValue?: number;
}}

export interface ForecastHighlights {{
  id: string;
  direction: 'up' | 'down';
  slopePp: number;
  pValue: number;
}}

export interface ForecastValidation {{
  totalHoldout: {{ predicted: number; actual: number; errorPct: number }};
  shareMaePp: Record<Exclude<ForecastDimension, 'total'>, number>;
}}

export const forecastData: {{
  total: ForecastSeries;
  regiao: ForecastSeries[];
  faixaEtaria: ForecastSeries[];
  sexo: ForecastSeries[];
  highlights: ForecastHighlights[];
  validation: ForecastValidation;
}} = {{
  total: {_js(total_series)},
  regiao: {_js(dims_series['regiao'])},
  faixaEtaria: {_js(dims_series['faixa_etaria'])},
  sexo: {_js(dims_series['sexo'])},
  highlights: {_js(highlights)},
  validation: {_js(validation)},
}};
"""
    with open(OUT_TS, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"OK -> {OUT_TS}")
    print(f"Total 2025: {proj_t[1]['value']} [{proj_t[1]['lo']}, {proj_t[1]['hi']}]")
    norte = next(s for s in dims_series['regiao'] if s['label'] == 'Norte')
    print(f"Norte 2025: share={norte['shareProjection'][1]['value']}% | nasc={norte['projection'][1]['value']} "
          f"[{norte['projection'][1]['lo']}, {norte['projection'][1]['hi']}] | p={norte['pValue']}")
    print(f"Destaques: {[h['id'] for h in highlights]}")
    print(f"Holdout total: {validation['totalHoldout']}")
    print(f"Share MAE (p.p.): {validation['shareMaePp']}")


if __name__ == "__main__":
    main()
