"""
ml/export_frontend_data.py
==========================
Gera `src/data/ml.ts` com os dados do modelo para o frontend:

- Regressão Logística de BAIXO_PESO (scaler + coeficientes + limiar de Youden)
  -> permite calcular a probabilidade de baixo peso direto no navegador.
- Importância SHAP (média |SHAP| %) por feature, para as 2 tarefas.
- Comparativo de métricas (ROC-AUC, PR-AUC, F1, Sens., Esp.) por modelo.
- Pontos das curvas ROC (out-of-fold) por modelo, para desenhar no front.

Executar (após `python ml/pipeline.py` ter gerado ml/resultados/):
    python ml/export_frontend_data.py

Regenera o arquivo src/data/ml.ts (não editar manualmente).
"""

from __future__ import annotations

import json
import os
import sys

import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score, roc_curve

import pipeline

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = pipeline.ROOT
OUT_TS = os.path.join(ROOT, "src", "data", "ml.ts")
TASKS = pipeline.CLASSIFICATION_TASKS  # (slug, alvo, features)


def load_frame() -> pd.DataFrame:
    nasc, uf = pipeline.load_data()
    df, _ = pipeline.clean_data(nasc, uf)
    return pipeline.adicionar_regiao(pipeline.derive_features(df), uf)


def _thin(x: np.ndarray, max_points: int = 60) -> np.ndarray:
    if len(x) <= max_points:
        return x
    step = max(1, len(x) // max_points)
    idx = list(range(0, len(x), step))
    if idx[-1] != len(x) - 1:
        idx.append(len(x) - 1)
    return x[idx]


def fit_lr(df: pd.DataFrame, slug: str, target: str, features: list[str]):
    """Ajusta a LR e devolve (X, y, dict com scaler + coeficientes)."""
    X, y = pipeline.prepare_model_data(df, target, features)
    lr = pipeline.build_models(y)["Regressão Logística"]
    lr.fit(X, y)
    scaler = lr.named_steps["scaler"]
    clf = lr.named_steps["lr"]
    return X, y, {
        "featureNames": list(X.columns),
        "scalerMeans": [round(float(v), 6) for v in scaler.mean_],
        "scalerScales": [round(float(v), 6) for v in scaler.scale_],
        "coefficients": [round(float(v), 6) for v in clf.coef_.ravel()],
        "intercept": round(float(clf.intercept_[0]), 6),
    }


def export_lr(df: pd.DataFrame) -> dict:
    slug, target, features = TASKS[0]  # baixo_peso
    X, y, model = fit_lr(df, slug, target, features)

    # Sanidade: sigmoid manual (mesma conta do frontend) == predict_proba do sklearn
    z = (X.iloc[:3].to_numpy() - np.array(model["scalerMeans"])) / np.array(model["scalerScales"])
    logit = model["intercept"] + z @ np.array(model["coefficients"])
    manual = 1 / (1 + np.exp(-logit))
    lr = pipeline.build_models(y)["Regressão Logística"].fit(X, y)
    sklearn_p = lr.predict_proba(X.iloc[:3])[:, 1]
    assert np.allclose(manual, sklearn_p, atol=1e-4), "Predição manual difere do sklearn!"

    # Limiar de Youden sobre OOF do melhor modelo (a própria LR)
    oof = pipeline.oof_probas(pipeline.build_models(y), X, y)
    model["threshold"] = round(float(pipeline.optimal_threshold(y, oof["Regressão Logística"])), 4)
    return model


def export_roc(df: pd.DataFrame) -> dict:
    out = {}
    for slug, target, features in TASKS:
        X, y = pipeline.prepare_model_data(df, target, features)
        models = pipeline.build_models(y)
        curves = []
        for name, proba in pipeline.oof_probas(models, X, y).items():
            fpr, tpr, _ = roc_curve(y, proba)
            curves.append(
                {
                    "modelo": name,
                    "auc": round(float(roc_auc_score(y, proba)), 3),
                    "fpr": [round(float(v), 4) for v in _thin(fpr)],
                    "tpr": [round(float(v), 4) for v in _thin(tpr)],
                }
            )
        out[slug] = curves
    return out


def export_shap(df: pd.DataFrame) -> dict:
    out = {}
    for slug, target, features in TASKS:
        X, y = pipeline.prepare_model_data(df, target, features)
        lr = pipeline.build_models(y)["Regressão Logística"].fit(X, y)
        explainer, Xt = pipeline._make_explainer(lr, X)
        values = pipeline._positive_class_values(explainer.shap_values(Xt))
        pct = np.abs(values).mean(axis=0)
        pct = pct / pct.sum() * 100
        items = [
            {"feature": f, "value": round(float(v), 2)}
            for f, v in zip(X.columns, pct)
        ]
        out[slug] = sorted(items, key=lambda d: -d["value"])
    return out


def export_metrics(df: pd.DataFrame) -> dict:
    csv_path = os.path.join(pipeline.OUT_DIR, "metricas_modelos.csv")
    if os.path.exists(csv_path):
        dfm = pd.read_csv(csv_path)
    else:
        rows = []
        for slug, target, features in TASKS:
            X, y = pipeline.prepare_model_data(df, target, features)
            res = pipeline.cross_validate_classifiers(X, y, pipeline.build_models(y))
            res.insert(0, "tarefa", slug)
            rows.append(res)
        dfm = pd.concat(rows, ignore_index=True)

    out = {}
    for slug, target, features in TASKS:
        sub = dfm[dfm["tarefa"] == slug]
        out[slug] = [
            {
                "modelo": r["modelo"],
                "rocAuc": round(float(r["roc_auc_media"]), 3),
                "prAuc": round(float(r["pr_auc_media"]), 3),
                "f1": round(float(r["f1_media"]), 3),
                "sens": round(float(r["sensibilidade_media"]), 3),
                "esp": round(float(r["especificidade_media"]), 3),
            }
            for r in sub.to_dict(orient="records")
        ]
    return out


def _js(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=2)


def main() -> None:
    df = load_frame()
    lr = export_lr(df)
    roc = export_roc(df)
    shap = export_shap(df)
    metrics = export_metrics(df)

    os.makedirs(os.path.dirname(OUT_TS), exist_ok=True)
    content = f"""// Auto-gerado por ml/export_frontend_data.py — NÃO editar manualmente.
// Modelo: Regressão Logística (BAIXO_PESO) treinada em 5.379 registros (SINASC/DataSUS 2019-2023).
// Limiar de Youden calculado com previsões out-of-fold.

export interface LrBaixoPeso {{
  featureNames: string[];
  scalerMeans: number[];
  scalerScales: number[];
  coefficients: number[];
  intercept: number;
  threshold: number;
}}

export const lrBaixoPeso: LrBaixoPeso = {_js(lr)};

export type MlrTask = 'baixo_peso' | 'prematuro';

export interface ShapItem {{
  feature: string;
  value: number; // % média do |SHAP| sobre a feature (soma ~100)
}}

export const shapImportance: Record<MlrTask, ShapItem[]> = {_js(shap)};

export interface ModelMetrics {{
  modelo: string;
  rocAuc: number;
  prAuc: number;
  f1: number;
  sens: number;
  esp: number;
}}

export const modelComparison: Record<MlrTask, ModelMetrics[]> = {_js(metrics)};

export interface RocCurve {{
  modelo: string;
  auc: number;
  fpr: number[];
  tpr: number[];
}}

export const rocCurves: Record<MlrTask, RocCurve[]> = {_js(roc)};
"""
    with open(OUT_TS, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"OK -> {OUT_TS}")
    print(f"Limiar (BAIXO_PESO): {lr['threshold']} | features: {len(lr['featureNames'])}")
    for slug, items in shap.items():
        top = items[0]
        print(f"SHAP {slug}: top1 = {top['feature']} ({top['value']}%)")


if __name__ == "__main__":
    main()
