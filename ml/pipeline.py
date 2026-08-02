"""
ml/pipeline.py
==============
Pipeline de modelagem preditiva — Nascidos Vivos Brasileiros (SINASC/DataSUS, 2019–2023).

Este módulo concentra a lógica reutilizável (limpeza, preparação, modelagem,
avaliação e interpretação com SHAP). Pode ser executado diretamente:

    python ml/pipeline.py

para regenerar todos os artefatos em ml/resultados/, ou importado pelo
notebook ml/nascimentos_ml.ipynb para apresentação com narrativa e gráficos.

Regras anti-vazamento (críticas para este dataset):
- BAIXO_PESO  é DEFINIDO por PESO_GRAMAS        -> PESO_GRAMAS nunca é feature do alvo BAIXO_PESO
- PREMATURO   é DEFINIDO por SEMANAS_GESTACAO   -> SEMANAS_GESTACAO nunca é feature do alvo PREMATURO
- APGAR5 e TIPO_PARTO só são conhecidos APÓS o parto -> excluídos da predição antecipada
"""

from __future__ import annotations

import os
import sys

import matplotlib

matplotlib.use("Agg")  # backend sem janela (o notebook troca para "inline")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import shap
import xgboost as xgb
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    average_precision_score,
    confusion_matrix,
    f1_score,
    make_scorer,
    mean_absolute_error,
    mean_squared_error,
    precision_recall_curve,
    r2_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import KFold, StratifiedKFold, cross_val_predict, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

SEED = 42
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "public")
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "resultados")

# ---------------------------------------------------------------------------
# 1. Carregamento e limpeza (réplica fiel do pipeline do data-base-analysis.Rmd)
# ---------------------------------------------------------------------------


def load_data(data_dir: str = DATA_DIR) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Carrega nascimentos.csv (tabela-fato) e uf_referencia.csv (dimensão)."""
    nasc = pd.read_csv(os.path.join(data_dir, "nascimentos.csv"))
    uf = pd.read_csv(os.path.join(data_dir, "uf_referencia.csv"))
    return nasc, uf


def _padronizar_sexo(v: object) -> object:
    s = str(v).strip().lower()
    if s in {"m", "masc", "masculino"}:
        return "Masculino"
    if s in {"f", "fem", "feminino"}:
        return "Feminino"
    return np.nan


def clean_data(
    nasc: pd.DataFrame, uf: pd.DataFrame
) -> tuple[pd.DataFrame, dict]:
    """Aplica a mesma limpeza documentada no Rmd e retorna (df limpo, estatísticas)."""
    df = nasc.copy()
    inicial = len(df)

    # 1) SEXO — padronização de grafias inconsistentes (sem remoção nesta etapa)
    df["SEXO"] = df["SEXO"].map(_padronizar_sexo)

    # 2) PESO_GRAMAS — conversão p/ numérico, remoção de inválidos/negativos/NA
    df["PESO_GRAMAS"] = pd.to_numeric(df["PESO_GRAMAS"], errors="coerce")
    antes = len(df)
    df = df[df["PESO_GRAMAS"].notna() & (df["PESO_GRAMAS"] > 0)]
    rem_peso = antes - len(df)

    # 3) IDADE_MAE — faixa biologicamente plausível (10–55 anos)
    antes = len(df)
    df = df[df["IDADE_MAE"].notna() & df["IDADE_MAE"].between(10, 55)]
    rem_idade = antes - len(df)

    # 4) UF — apenas siglas válidas (JOIN com a dimensão)
    ufs_validas = set(uf["UF"])
    antes = len(df)
    df = df[df["UF"].isin(ufs_validas)]
    rem_uf = antes - len(df)

    # 5) Duplicatas completas
    antes = len(df)
    df = df.drop_duplicates()
    rem_dup = antes - len(df)

    df = df.reset_index(drop=True)
    removidos = inicial - len(df)

    stats = {
        "inicial": inicial,
        "final": len(df),
        "removidos": removidos,
        "etapas": [
            {
                "etapa": "PESO_GRAMAS (não numérico, negativo ou ausente)",
                "removidos": rem_peso,
                "motivo": "Valores inválidos para o peso ao nascer",
            },
            {
                "etapa": "IDADE_MAE (fora de 10–55 anos)",
                "removidos": rem_idade,
                "motivo": "Faixa biológica plausível",
            },
            {
                "etapa": "UF inválida",
                "removidos": rem_uf,
                "motivo": "Siglas fora da dimensão uf_referencia",
            },
            {
                "etapa": "Duplicatas",
                "removidos": rem_dup,
                "motivo": "Registros completamente duplicados",
            },
        ],
    }
    return df, stats


def derive_features(df: pd.DataFrame) -> pd.DataFrame:
    """Recria as variáveis derivadas do Rmd (mesmas regras)."""
    df = df.copy()
    df["TIPO_PARTO_LABEL"] = df["TIPO_PARTO"].map({1: "Vaginal", 2: "Cesáreo"})
    df["BAIXO_PESO"] = (df["PESO_GRAMAS"] < 2500).astype(int)
    df["PREMATURO"] = df["SEMANAS_GESTACAO"].lt(37).fillna(False).astype(int)
    df["FAIXA_IDADE_MAE"] = pd.cut(
        df["IDADE_MAE"], bins=[9, 20, 35, 56], right=False,
        labels=["Adolescente", "Adulta", "35 ou mais"],
    )
    return df


def adicionar_regiao(df: pd.DataFrame, uf: pd.DataFrame) -> pd.DataFrame:
    """JOIN UF -> REGIAO (dimensão geográfica)."""
    return df.merge(uf, on="UF", how="left")


# ---------------------------------------------------------------------------
# 2. Preparação dos dados de modelagem
# ---------------------------------------------------------------------------


def prepare_model_data(
    df: pd.DataFrame, target: str, features: list[str]
) -> tuple[pd.DataFrame, pd.Series]:
    """
    Seleciona features + alvo, remove linhas incompletas e codifica categóricas
    (one-hot para SEXO e REGIAO). Nunca inclui as variáveis que definem o alvo.
    """
    cols = features + [target]
    d = df[cols].dropna().copy()

    cat_cols = [c for c in features if c in {"SEXO", "REGIAO"}]
    X = d[features].copy()
    if cat_cols:
        X = pd.get_dummies(X, columns=cat_cols, drop_first=False, dtype=int)
    y = d[target].astype(float if target == "PESO_GRAMAS" else int)
    return X, y


# ---------------------------------------------------------------------------
# 3. Modelos
# ---------------------------------------------------------------------------


def build_models(y: pd.Series, kind: str = "classification") -> dict[str, object]:
    """Conjunto de modelos usado nas avaliações."""
    if kind == "regression":
        return {
            "Random Forest Regressor": RandomForestRegressor(
                n_estimators=300, random_state=SEED, n_jobs=-1
            ),
            "XGBoost Regressor": xgb.XGBRegressor(
                n_estimators=300, learning_rate=0.05, max_depth=4,
                random_state=SEED, n_jobs=-1,
            ),
        }

    pos = int(y.sum())
    neg = int(len(y) - pos)
    scale = max(neg / max(pos, 1), 1.0)  # scale_pos_weight p/ desbalanceamento
    return {
        "Dummy (majoritário)": DummyClassifier(strategy="most_frequent"),
        "Regressão Logística": Pipeline(
            [
                ("scaler", StandardScaler()),
                (
                    "lr",
                    LogisticRegression(
                        max_iter=2000, class_weight="balanced", random_state=SEED
                    ),
                ),
            ]
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=300, class_weight="balanced", random_state=SEED, n_jobs=-1
        ),
        "XGBoost": xgb.XGBClassifier(
            n_estimators=300, learning_rate=0.05, max_depth=4,
            subsample=0.9, colsample_bytree=0.9, scale_pos_weight=scale,
            eval_metric="logloss", random_state=SEED, n_jobs=-1,
        ),
    }


# ---------------------------------------------------------------------------
# 4. Validação cruzada estratificada (5 dobras) e métricas
# ---------------------------------------------------------------------------

_SCORERS = {
    "roc_auc": "roc_auc",
    "pr_auc": make_scorer(average_precision_score, response_method="predict_proba"),
    "f1": "f1",
    "sensibilidade": make_scorer(recall_score, pos_label=1),
    "especificidade": make_scorer(recall_score, pos_label=0),
    "acurácia": "accuracy",
}


def _cv() -> StratifiedKFold:
    return StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)


def cross_validate_classifiers(
    X: pd.DataFrame, y: pd.Series, models: dict[str, object]
) -> pd.DataFrame:
    """Média ± desvio das métricas para cada modelo, via 5-fold estratificado."""
    rows = []
    for name, model in models.items():
        res = cross_validate(model, X, y, cv=_cv(), scoring=_SCORERS, n_jobs=-1)
        row = {"modelo": name}
        for k, v in res.items():
            if k.startswith("test_"):
                metric = k[5:]
                row[f"{metric}_media"] = v.mean()
                row[f"{metric}_std"] = v.std()
        rows.append(row)
    return pd.DataFrame(rows)


def tabela_metricas(res: pd.DataFrame) -> pd.DataFrame:
    """Formata a tabela de CV para exibição (média ± desvio)."""
    cols = ["roc_auc", "pr_auc", "f1", "sensibilidade", "especificidade", "acurácia"]
    t = res[["modelo"]].copy()
    for c in cols:
        t[c] = res[f"{c}_media"].map(lambda v: f"{v:.3f}") + " ± " + res[
            f"{c}_std"
        ].map(lambda v: f"{v:.3f}")
    return t


def melhor_modelo(res: pd.DataFrame, metric: str = "pr_auc") -> tuple[str, pd.Series]:
    """Retorna (nome, linha) do modelo com maior média da métrica."""
    idx = res[f"{metric}_media"].idxmax()
    return res.loc[idx, "modelo"], res.loc[idx]


# ---------------------------------------------------------------------------
# 5. Gráficos de avaliação (curvas ROC/PR, confusão, regressão)
# ---------------------------------------------------------------------------


def oof_proba(
    model: object, X: pd.DataFrame, y: pd.Series, cv=None
) -> np.ndarray:
    """Probabilidades out-of-fold (cada linha prevista por um modelo treinado
    sem vê-la — honestas para limiar e confusão)."""
    cv = cv or _cv()
    proba = cross_val_predict(model, X, y, cv=cv, method="predict_proba", n_jobs=-1)
    return proba[:, 1] if proba.ndim == 2 else proba


def oof_probas(
    models: dict[str, object], X: pd.DataFrame, y: pd.Series, cv=None
) -> dict[str, np.ndarray]:
    """OOF de todos os modelos em uma única passada por modelo (evita re-treinar)."""
    return {name: oof_proba(model, X, y, cv) for name, model in models.items()}


def plot_roc_curves(
    ax, X: pd.DataFrame, y: pd.Series, models: dict[str, object],
    oof: dict[str, np.ndarray] | None = None,
) -> None:
    oof = oof or oof_probas(models, X, y)
    for name, proba in oof.items():
        fpr, tpr, _ = roc_curve(y, proba)
        ax.plot(fpr, tpr, label=f"{name} (AUC {roc_auc_score(y, proba):.3f})")
    ax.plot([0, 1], [0, 1], "--", color="0.7")
    ax.set_xlabel("Falso positivo")
    ax.set_ylabel("Verdadeiro positivo")
    ax.set_title("Curvas ROC (out-of-fold)")
    ax.legend(fontsize=8, loc="lower right")


def plot_pr_curves(
    ax, X: pd.DataFrame, y: pd.Series, models: dict[str, object],
    oof: dict[str, np.ndarray] | None = None,
) -> None:
    oof = oof or oof_probas(models, X, y)
    for name, proba in oof.items():
        precision, recall, _ = precision_recall_curve(y, proba)
        ax.plot(recall, precision, label=f"{name} (AP {average_precision_score(y, proba):.3f})")
    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.set_title("Curvas Precision–Recall (out-of-fold)")
    ax.legend(fontsize=8, loc="upper right")


def optimal_threshold(y: pd.Series, proba: np.ndarray) -> float:
    """Limiar que maximiza o índice de Youden (Sensibilidade + Especificidade - 1)."""
    fpr, tpr, thresholds = roc_curve(y, proba)
    j = tpr - fpr
    return float(thresholds[int(np.argmax(j))])


def plot_confusion_matrix(ax, y_true, y_pred, labels, title: str) -> None:
    cm = confusion_matrix(y_true, y_pred)
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues", ax=ax,
        xticklabels=labels, yticklabels=labels,
    )
    ax.set_title(title)
    ax.set_xlabel("Previsto")
    ax.set_ylabel("Real")


def sensibilidade(y_true, y_pred) -> float:
    return recall_score(y_true, y_pred, pos_label=1)


def especificidade(y_true, y_pred) -> float:
    return recall_score(y_true, y_pred, pos_label=0)


def f1(y_true, y_pred) -> float:
    return f1_score(y_true, y_pred, pos_label=1)


# ---------------------------------------------------------------------------
# 6. Regressão (PESO_GRAMAS)
# ---------------------------------------------------------------------------


def cross_validate_regressors(
    X: pd.DataFrame, y: pd.Series, models: dict[str, object]
) -> pd.DataFrame:
    cv = KFold(n_splits=5, shuffle=True, random_state=SEED)
    scoring = {
        "r2": "r2",
        "mae": "neg_mean_absolute_error",
        "rmse": "neg_root_mean_squared_error",
    }
    rows = []
    for name, model in models.items():
        res = cross_validate(model, X, y, cv=cv, scoring=scoring, n_jobs=-1)
        rows.append(
            {
                "modelo": name,
                "r2_media": res["test_r2"].mean(),
                "r2_std": res["test_r2"].std(),
                "mae_media": -res["test_mae"].mean(),
                "mae_std": res["test_mae"].std(),
                "rmse_media": -res["test_rmse"].mean(),
                "rmse_std": res["test_rmse"].std(),
            }
        )
    return pd.DataFrame(rows)


def tabela_metricas_regressao(res: pd.DataFrame) -> pd.DataFrame:
    t = res[["modelo"]].copy()
    for c in ["r2", "mae", "rmse"]:
        t[c] = res[f"{c}_media"].map(lambda v: f"{v:.3f}") + " ± " + res[
            f"{c}_std"
        ].map(lambda v: f"{v:.3f}")
    return t


def plot_scatter_predicoes(ax, X: pd.DataFrame, y: pd.Series, model) -> None:
    cv = KFold(n_splits=5, shuffle=True, random_state=SEED)
    pred = cross_val_predict(model, X, y, cv=cv, n_jobs=-1)
    ax.scatter(y, pred, s=8, alpha=0.3)
    lims = [min(y.min(), pred.min()), max(y.max(), pred.max())]
    ax.plot(lims, lims, "--", color="gray")
    ax.set_xlabel("Peso real (g)")
    ax.set_ylabel("Peso previsto (g)")
    ax.set_title("Previsto × Real — out-of-fold")
    r2 = r2_score(y, pred)
    mae = mean_absolute_error(y, pred)
    rmse = float(np.sqrt(mean_squared_error(y, pred)))
    ax.text(
        0.05, 0.95, f"R² = {r2:.3f}\nMAE = {mae:.0f} g\nRMSE = {rmse:.0f} g",
        transform=ax.transAxes, va="top", bbox=dict(boxstyle="round", fc="white", alpha=0.8),
    )


# ---------------------------------------------------------------------------
# 7. Interpretação com SHAP
# ---------------------------------------------------------------------------


def _positive_class_values(values):
    """Normaliza o retorno do TreeExplainer para a matriz 2D da classe positiva."""
    if isinstance(values, list):
        return values[1] if len(values) > 1 else values[0]
    values = np.asarray(values)
    if values.ndim == 3:
        return values[..., 1]
    return values


def _make_explainer(model, X: pd.DataFrame) -> tuple[object, pd.DataFrame]:
    """Retorna (explainer, dados para explicar).

    Pipeline (ex.: escalador + Regressão Logística) -> LinearExplainer sobre
    os dados transformados; modelos de árvore -> TreeExplainer.
    """
    if isinstance(model, Pipeline):
        final = model.steps[-1][1]
        Xt: pd.DataFrame = X
        for name, step in model.steps[:-1]:
            Xt = step.transform(Xt)
        return shap.LinearExplainer(final, Xt), Xt
    return shap.TreeExplainer(model), X


def plot_shap_summary(model, X: pd.DataFrame, feature_names=None) -> tuple[plt.Figure, np.ndarray]:
    explainer, Xt = _make_explainer(model, X)
    values = _positive_class_values(explainer.shap_values(Xt))
    plt.figure(figsize=(8, 5))
    try:
        shap.summary_plot(values, Xt, feature_names=feature_names, show=False)
    except Exception:
        explanation = shap.Explanation(values=values, data=Xt, feature_names=feature_names)
        shap.plots.beeswarm(explanation, show=False)
    fig = plt.gcf()
    return fig, values


# ---------------------------------------------------------------------------
# 8. Orquestração (execução direta: python ml/pipeline.py)
# ---------------------------------------------------------------------------

CLASSIFICATION_TASKS = [
    (
        "baixo_peso",
        "BAIXO_PESO",
        ["IDADE_MAE", "CONSULTAS_PRENATAL", "SEMANAS_GESTACAO", "SEXO", "REGIAO", "ANO"],
    ),
    (
        "prematuro",
        "PREMATURO",
        ["IDADE_MAE", "CONSULTAS_PRENATAL", "SEXO", "REGIAO", "ANO"],
    ),
]

REGRESSION_FEATURES = [
    "IDADE_MAE", "CONSULTAS_PRENATAL", "SEMANAS_GESTACAO", "SEXO", "REGIAO", "ANO"
]


def salvar_figura(fig: plt.Figure, nome: str, out_dir: str = OUT_DIR) -> str:
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, nome)
    fig.savefig(path, bbox_inches="tight", dpi=150)
    plt.close(fig)
    return path


def run_pipeline(data_dir: str = DATA_DIR, out_dir: str = OUT_DIR, verbose: bool = True) -> dict:
    os.makedirs(out_dir, exist_ok=True)
    sns.set_theme(style="whitegrid")
    pd.set_option("display.width", 140)

    nasc, uf = load_data(data_dir)
    df, stats = clean_data(nasc, uf)
    df = adicionar_regiao(derive_features(df), uf)

    if verbose:
        print("=== LIMPEZA ===")
        print(
            f"Iniciais: {stats['inicial']:,} | Finais: {len(df):,} "
            f"| Removidos: {stats['removidos']:,} ({stats['removidos'] / stats['inicial'] * 100:.1f}%)"
        )
        print(pd.DataFrame(stats["etapas"]).to_string(index=False))

    metricas = []
    for slug, target, features in CLASSIFICATION_TASKS:
        X, y = prepare_model_data(df, target, features)
        models = build_models(y)
        res = cross_validate_classifiers(X, y, models)

        if verbose:
            print(f"\n=== TAREFA: {slug} | alvo: {target} ===")
            print(f"n = {len(X):,} | positivos = {y.sum():,} ({y.mean() * 100:.1f}%)")
            print(tabela_metricas(res).to_string(index=False))

        # Curvas ROC / PR (OOF calculado UMA vez por modelo)
        oof = oof_probas(models, X, y)
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4.5))
        plot_roc_curves(ax1, X, y, models, oof=oof)
        plot_pr_curves(ax2, X, y, models, oof=oof)
        plt.tight_layout()
        salvar_figura(fig, f"curvas_{slug}.png", out_dir)

        # Melhor modelo + limiar ótimo (out-of-fold) + confusão
        best_name, best_row = melhor_modelo(res)
        proba = oof[best_name]
        thr = optimal_threshold(y, proba)
        pred = (proba >= thr).astype(int)

        if verbose:
            print(
                f"Melhor modelo (PR-AUC): {best_name} — "
                f"{best_row['pr_auc_media']:.3f} ± {best_row['pr_auc_std']:.3f}"
            )
            print(
                f"Limiar ótimo (Youden): {thr:.3f} -> Sens. {sensibilidade(y, pred):.3f} "
                f"| Esp. {especificidade(y, pred):.3f} | F1 {f1(y, pred):.3f}"
            )

        fig, ax = plt.subplots(figsize=(5, 4))
        plot_confusion_matrix(ax, y, pred, ["Não", "Sim"], f"{target} — OOF (limiar {thr:.2f})")
        salvar_figura(fig, f"confusao_{slug}.png", out_dir)

        # SHAP sobre o melhor modelo (ajustado nos dados completos, p/ interpretação)
        best_model = models[best_name].fit(X, y)  # cross_validate clona; os modelos aqui não foram ajustados
        fig, _ = plot_shap_summary(best_model, X, list(X.columns))
        salvar_figura(fig, f"shap_summary_{slug}.png", out_dir)

        t = res.copy()
        t.insert(0, "tarefa", slug)
        t.insert(1, "alvo", target)
        metricas.append(t)

    metricas_df = pd.concat(metricas, ignore_index=True)
    metricas_df.to_csv(os.path.join(out_dir, "metricas_modelos.csv"), index=False)

    # Regressão
    Xr, yr = prepare_model_data(df, "PESO_GRAMAS", REGRESSION_FEATURES)
    reg_models = build_models(yr, "regression")
    res_reg = cross_validate_regressors(Xr, yr, reg_models)
    if verbose:
        print("\n=== REGRESSÃO: PESO_GRAMAS ===")
        print(f"n = {len(Xr):,} | média = {yr.mean():.0f} g")
        print(tabela_metricas_regressao(res_reg).to_string(index=False))
    res_reg.to_csv(os.path.join(out_dir, "metricas_regressao.csv"), index=False)

    fig, ax = plt.subplots(figsize=(6.5, 6))
    plot_scatter_predicoes(ax, Xr, yr, reg_models["XGBoost Regressor"])
    salvar_figura(fig, "scatter_peso_gramas.png", out_dir)

    if verbose:
        print(f"\nArtefatos salvos em: {os.path.abspath(out_dir)}")

    return {
        "stats_limpeza": stats,
        "metricas_classificacao": metricas_df,
        "metricas_regressao": res_reg,
        "out_dir": out_dir,
    }


if __name__ == "__main__":
    # Console Windows pode usar cp1252; força UTF-8 para imprimir acentos/símbolos
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    run_pipeline()
