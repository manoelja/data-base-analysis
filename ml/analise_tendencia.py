"""
ml/analise_tendencia.py
=======================
Análise exploratória de tendência e projeção 2024-2028 para os indicadores de
nascidos vivos (SINASC/DataSUS 2019-2023).

Método: regressão linear OLS do indicador sobre o ano, com:
- Validação holdout (treino 2019-2022 -> teste 2023) vs. baseline "último valor";
- Intervalo de PREDIÇÃO de 95% para 2024-2028 (cresce com o horizonte).

Com apenas 5 pontos anuais, este script serve para DECIDIR se a projeção é
defensável — e mostrar a incerteza real de um horizonte de 5 anos.
"""

from __future__ import annotations

import sys

import numpy as np
import pandas as pd
from scipy import stats

import pipeline

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ANOS_FUTUROS = [2024, 2025, 2026, 2027, 2028]
HOLD_OUT_ANO = 2023


def load() -> pd.DataFrame:
    nasc, uf = pipeline.load_data()
    df, _ = pipeline.clean_data(nasc, uf)
    return pipeline.adicionar_regiao(pipeline.derive_features(df), uf)


def holdout_validate(x_train, y_train, x_test, y_test) -> tuple[float, float, float]:
    """Treina nos anos de treino e testa no ano de teste.
    Retorna (erro absoluto, erro %, baseline último valor)."""
    res = stats.linregress(x_train, y_train)
    pred = res.slope * x_test + res.intercept
    err = pred - y_test
    err_pct = abs(err) / y_test * 100 if y_test else np.nan
    baseline_err = abs(y_train[-1] - y_test)
    return err, err_pct, baseline_err


def project(x, y, anos=ANOS_FUTUROS) -> tuple[stats.linregress_result, list[tuple[int, float, float, float]]]:
    """OLS + intervalo de predição de 95% para os anos futuros."""
    res = stats.linregress(x, y)
    n = len(x)
    x_mean = np.mean(x)
    sxx = np.sum((x - x_mean) ** 2)
    y_hat = res.slope * x + res.intercept
    s2 = np.sum((y - y_hat) ** 2) / (n - 2)
    tcrit = stats.t.ppf(0.975, n - 2)
    out = []
    for a in anos:
        yhat = res.slope * a + res.intercept
        se = np.sqrt(s2 * (1 + 1 / n + (a - x_mean) ** 2 / sxx))
        out.append((a, yhat, yhat - tcrit * se, yhat + tcrit * se))
    return res, out


def p_sign(p: float) -> str:
    return f"p={p:.3f}" + ("" if p < 0.05 else " (não significativa)")


def analisar_serie(nome: str, serie: pd.Series, unidade: str = "nasc", meta=None, floor: float = 0) -> None:
    serie = serie.dropna()
    if len(serie) < 4:
        print(f"\n## {nome}: série curta demais ({len(serie)} pts) — pulada")
        return
    anos = np.array(serie.index, dtype=float)
    y = serie.to_numpy(dtype=float)

    res, proj = project(anos, y)
    trend = "CRESCENTE" if res.slope > 0.05 else ("DECRESCENTE" if res.slope < -0.05 else "estável")

    # Holdout
    err, err_pct, base_err = holdout_validate(anos[:-1], y[:-1], anos[-1], y[-1])

    print(f"\n## {nome}")
    print(f"   Série: {[f'{int(a)}:{v:.0f}' for a, v in zip(anos, y)]} {unidade}")
    print(f"   Inclinação: {res.slope:+.2f} {unidade}/ano | R²={res.rvalue**2:.3f} | {p_sign(res.pvalue)}")
    print(f"   -> Tendência {trend}")
    print(f"   Holdout 2023: previsto={res.slope*2023+res.intercept:.0f} | real={y[-1]:.0f} | erro={err:+.0f} ({err_pct:.1f}%) | baseline (último valor): {base_err:.0f}")
    print(f"   Projeção 95% ({unidade}):")
    for a, yhat, lo, hi in proj:
        lo = max(lo, floor)
        print(f"     {a}: {yhat:8.0f}  [{lo:8.0f}, {hi:8.0f}]")
    _, _, lo28, hi28 = proj[-1]
    _, _, lo24, _ = proj[0]
    print(f"   Amplitude do IC: ±{(hi28-lo28)/2:.0f} em 2028 (vs. ±{(proj[0][3]-lo24)/2:.0f} em 2024) — {unidade}")


def main() -> None:
    df = load()
    years = sorted(df["ANO"].unique())

    # --- Séries anuais agregadas ---
    print("=" * 70)
    print("PROJEÇÃO 2024–2028 (5 ANOS) — análise de viabilidade")
    print("=" * 70)

    total = df.groupby("ANO").size()
    ces = df.groupby("ANO")["TIPO_PARTO"].apply(lambda s: (s == 2).mean() * 100)
    bpx = df.groupby("ANO")["BAIXO_PESO"].mean() * 100
    prem = df.groupby("ANO")["PREMATURO"].mean() * 100

    analisar_serie("Total de nascimentos", total, "nasc")
    analisar_serie("% Cesáreas", ces, "p.p.")
    analisar_serie("% Baixo peso", bpx, "p.p.")
    analisar_serie("% Prematuros", prem, "p.p.")

    # --- Por região ---
    print("\n" + "=" * 70)
    print("POR REGIÃO")
    print("=" * 70)
    for regiao in sorted(df["REGIAO"].dropna().unique()):
        sub = df[df["REGIAO"] == regiao]
        s_nasc = sub.groupby("ANO").size().reindex(years)
        s_ces = sub.groupby("ANO")["TIPO_PARTO"].apply(lambda s: (s == 2).mean() * 100).reindex(years)
        analisar_serie(f"Nascimentos — {regiao}", s_nasc, "nasc")
        analisar_serie(f"% Cesáreas — {regiao}", s_ces, "p.p.")

    # --- Por faixa etária ---
    print("\n" + "=" * 70)
    print("POR FAIXA ETÁRIA (nascimentos)")
    print("=" * 70)
    for grupo in ["Adolescente", "Adulta", "35 ou mais"]:
        sub = df[df["FAIXA_IDADE_MAE"] == grupo]
        s = sub.groupby("ANO").size().reindex(years)
        analisar_serie(f"Nascimentos — {grupo}", s, "nasc")

    # --- Por sexo ---
    print("\n" + "=" * 70)
    print("POR SEXO (nascimentos)")
    print("=" * 70)
    for sexo in ["Feminino", "Masculino"]:
        sub = df[df["SEXO"] == sexo]
        s = sub.groupby("ANO").size().reindex(years)
        analisar_serie(f"Nascimentos — {sexo}", s, "nasc")


if __name__ == "__main__":
    main()
