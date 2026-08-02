import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  pt: {
    translation: {
      nav: {
        home: 'Início',
        about: 'Sobre',
        skills: 'Tecnologias',
        projects: 'Análises',
        contact: 'Contato',
        change_language: 'Idioma',
        menu_open: 'Abrir menu',
        menu_close: 'Fechar menu',
        dashboard: 'Dashboard',
        predictive: 'Modelagem'
      },
      hero: {
        badge: 'DASHBOARD ATIVO',
        title_pre: 'Data Base',
        description: 'Pipeline completo de importação, limpeza e análise de dados de nascidos vivos brasileiros (SINASC/DataSUS) com R e SQL.',
        view_projects: 'Ver Análises',
        scroll: 'Role para baixo',
        words: ['Análise de Dados', 'Pipeline SQL→R', 'Qualidade de Dados'],
        pipeline_status: 'ESTADO DO PIPELINE',
        records_loaded: 'REGISTROS CARREGADOS',
        cleaned: 'LIMPOS',
        quality_score: 'PONTUAÇÃO DE QUALIDADE'
      },
      about: {
        title: 'Sobre o Projeto',
        description: 'Atividade avaliativa de Banco de Dados que integra importação de dados em R, diagnóstico de qualidade, modelo relacional, manipulação com dplyr e o pipeline SQL→R com DBI/RSQLite.',
        graduation_label: 'DADOS',
        graduation_title: 'Nascidos Vivos (2019–2023)',
        graduation_inst: 'Fonte: SINASC / DataSUS — Padrão nacional de registros de nascidos vivos',
        postgrad_label: 'MODELO',
        postgrad_title: 'Relacional SQL→R',
        postgrad_inst: 'Pipeline completo: importação → limpeza → análise → persistência em SQLite',
        detailed_profile: 'Este projeto demonstra competências em manipulação de dados, limpeza com dplyr, criação de variáveis derivadas e consultas SQL complexas. Os dados incluem 6.080 registros de nascidos vivos com problemas intencionais de qualidade.',
        mission_text: 'Objetivo: diagnosticar e resolver problemas de qualidade em dados reais, aplicando técnicas de limpeza e validação que garantem a integridade analítica dos resultados.',
        data_report: 'RELATÓRIO DE DADOS',
        mission_objective: 'OBJETIVO DA MISSÃO',
        initial: 'INICIAL',
        final: 'FINAL',
        records: 'REGISTROS',
        status_verified: 'STATUS: VERIFICADO',
        status_authorized: 'STATUS: AUTORIZADO',
        pipeline_status_active: 'PIPELINE STATUS ATIVO',
        pipeline_alert: '570 registros removidos na etapa de limpeza. Qualidade dos dados verificada.',
        docs_title: 'Documentação',
        docs_subtitle: 'Baixe a documentação completa do projeto em PDF ou imagem (PNG).',
        docs_readme_name: 'README',
        docs_readme_desc: 'Visão geral do projeto, limpeza dos dados e Machine Learning no navegador.',
        docs_ref_name: 'Referência Técnica',
        docs_ref_desc: 'Importação, limpeza com dplyr e pipeline SQL→R com SQLite (Rmd).',
        docs_ml_name: 'Plano de ML',
        docs_ml_desc: 'Plano da modelagem preditiva com scikit-learn, XGBoost e SHAP.',
        download_pdf: 'Baixar PDF',
        download_png: 'Baixar PNG'
      },
      skills: {
        title: 'Tecnologias Utilizadas'
      },
      projects: {
        title: 'Resultados da Análise'
      },
      dashboard: {
        title: 'Dashboard Interativo',
        source: 'Fonte de Dados',
        metric: 'Métrica',
        chart: 'Tipo de Gráfico',
        category: 'Categoria',
        filters: 'FILTROS',
        insights: 'INSIGHTS'
      },
      predictive: {
        title: 'Modelagem Preditiva',
        subtitle: 'Classificador de baixo peso ao nascer treinado em 5.379 registros do SINASC/DataSUS. Como a Regressão Logística venceu o XGBoost, o modelo roda direto no navegador.',
        calculator: 'Calculadora de Risco',
        idade: 'Idade da mãe (anos)',
        semanas: 'Semanas de gestação',
        consultas: 'Consultas de pré-natal',
        sexo: 'Sexo do bebê',
        regiao: 'Região',
        ano: 'Ano',
        probability: 'Probabilidade de baixo peso',
        limiar: 'Limiar (Youden)',
        impact: 'Impacto máximo no resultado ao alterar este campo',
        alto: 'Risco elevado',
        baixo: 'Risco baixo',
        fatores: 'Fatores que mais influenciam',
        disclaimer: 'Estimativa estatística do modelo — não substitui avaliação médica.',
        results: 'Resultados dos Modelos',
        tabBaixoPeso: 'Baixo peso',
        tabPrematuro: 'Prematuridade',
        prematuroNota: 'Modelo exploratório: prever prematuridade sem a idade gestacional é difícil (ROC-AUC ~0.53) — por isso a calculadora cobre apenas o baixo peso.',
        featureImportance: 'Importância das features (SHAP)',
        comparativo: 'Comparativo de modelos — 5-fold CV',
        rocTitle: 'Curvas ROC (out-of-fold)',
        vp: 'Verdadeiro positivo',
        fp: 'Falso positivo'
      },
      forecast: {
        title: 'Projeções 2024–2025',
        subtitle: 'Projeção top-down reconciliada: total via regressão linear com intervalo de 95% + participações ancoradas por região, faixa etária e sexo (método e validação em ml/PROJECAO_TECH_DESIGN.md).',
        dimTotal: 'Total',
        dimRegiao: 'Região',
        dimFaixaEtaria: 'Faixa etária',
        dimSexo: 'Sexo',
        modeValue: 'Nascimentos',
        modeShare: 'Participação %',
        history: 'Histórico',
        projection: 'Projeção',
        band: 'Intervalo 95%',
        lastObserved: 'Último observado',
        projection2025: 'Projeção 2025',
        trend: 'Tendência (share)',
        highlights: 'Destaques da tendência',
        validation: 'Validação holdout (2023)',
        holdoutTotal: 'Erro no total previsto',
        predicted: 'previsto',
        actual: 'real',
        maeTitle: 'Erro médio das participações (MAE)',
        disclaimer: 'Projeção exploratória de tendência com incerteza quantificada — não é previsão definitiva de saúde pública.'
      },
      footer: {
        title: 'Data Base Analysis',
        description: 'Dashboard interativo apresentando os resultados da atividade avaliativa de Banco de Dados —Pipeline completo de dados de saúde pública.'
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        about: 'About',
        skills: 'Technologies',
        projects: 'Analysis',
        contact: 'Contact',
        change_language: 'Language',
        menu_open: 'Open menu',
        menu_close: 'Close menu',
        dashboard: 'Dashboard',
        predictive: 'Modelagem'
      },
      hero: {
        badge: 'DASHBOARD ACTIVE',
        title_pre: 'Data Base',
        description: 'Complete pipeline for importing, cleaning, and analyzing Brazilian live birth data (SINASC/DataSUS) with R and SQL.',
        view_projects: 'View Analysis',
        scroll: 'Scroll down',
        words: ['Data Analysis', 'SQL→R Pipeline', 'Data Quality'],
        pipeline_status: 'PIPELINE STATUS',
        records_loaded: 'RECORDS LOADED',
        cleaned: 'CLEANED',
        quality_score: 'QUALITY SCORE'
      },
      about: {
        title: 'About the Project',
        description: 'Database course project integrating data import in R, quality diagnosis, relational modeling, dplyr manipulation, and the SQL→R pipeline with DBI/RSQLite.',
        graduation_label: 'DATA',
        graduation_title: 'Live Births (2019–2023)',
        graduation_inst: 'Source: SINASC / DataSUS — National standard for live birth records',
        postgrad_label: 'MODEL',
        postgrad_title: 'Relational SQL→R',
        postgrad_inst: 'Complete pipeline: import → cleaning → analysis → persistence in SQLite',
        detailed_profile: 'This project demonstrates skills in data manipulation, dplyr cleaning, derived variable creation, and complex SQL queries. The dataset includes 6,080 live birth records with intentional quality issues.',
        mission_text: 'Objective: diagnose and resolve quality issues in real-world data, applying cleaning and validation techniques that ensure analytical integrity of results.',
        data_report: 'DATA REPORT',
        mission_objective: 'MISSION OBJECTIVE',
        initial: 'INITIAL',
        final: 'FINAL',
        records: 'RECORDS',
        status_verified: 'STATUS: VERIFIED',
        status_authorized: 'STATUS: AUTHORIZED',
        pipeline_status_active: 'PIPELINE STATUS ACTIVE',
        pipeline_alert: '570 records removed during cleaning step. Data quality verified.',
        docs_title: 'Documentation',
        docs_subtitle: 'Download the full project documentation as PDF or image (PNG).',
        docs_readme_name: 'README',
        docs_readme_desc: 'Project overview, data cleaning, and in-browser Machine Learning.',
        docs_ref_name: 'Technical Reference',
        docs_ref_desc: 'Import, dplyr cleaning, and SQL→R pipeline with SQLite (Rmd).',
        docs_ml_name: 'ML Plan',
        docs_ml_desc: 'Predictive modeling plan with scikit-learn, XGBoost, and SHAP.',
        download_pdf: 'Download PDF',
        download_png: 'Download PNG'
      },
      skills: {
        title: 'Technologies Used'
      },
      projects: {
        title: 'Analysis Results'
      },
      dashboard: {
        title: 'Interactive Dashboard',
        source: 'Data Source',
        metric: 'Metric',
        chart: 'Chart Type',
        category: 'Category',
        filters: 'FILTERS',
        insights: 'INSIGHTS'
      },
      predictive: {
        title: 'Predictive Modeling',
        subtitle: 'Low birth weight classifier trained on 5,379 SINASC/DataSUS records. Since Logistic Regression beat XGBoost, the model runs entirely in your browser.',
        calculator: 'Risk Calculator',
        idade: "Mother's age (years)",
        semanas: 'Gestational weeks',
        consultas: 'Prenatal visits',
        sexo: "Baby's sex",
        regiao: 'Region',
        ano: 'Year',
        probability: 'Low birth weight probability',
        limiar: 'Threshold (Youden)',
        impact: 'Maximum impact on the result when changing this field',
        alto: 'Elevated risk',
        baixo: 'Low risk',
        fatores: 'Top contributing factors',
        disclaimer: 'Statistical model estimate — does not replace medical evaluation.',
        results: 'Model Results',
        tabBaixoPeso: 'Low weight',
        tabPrematuro: 'Prematurity',
        prematuroNota: 'Exploratory model: predicting prematurity without gestational age is hard (ROC-AUC ~0.53) — which is why the calculator covers only low birth weight.',
        featureImportance: 'Feature importance (SHAP)',
        comparativo: 'Model comparison — 5-fold CV',
        rocTitle: 'ROC curves (out-of-fold)',
        vp: 'True positive',
        fp: 'False positive'
      },
      forecast: {
        title: '2024–2025 Projections',
        subtitle: 'Reconciled top-down projection: total via linear regression with a 95% interval + anchored shares by region, age group, and sex (method and validation in ml/PROJECAO_TECH_DESIGN.md).',
        dimTotal: 'Total',
        dimRegiao: 'Region',
        dimFaixaEtaria: 'Age group',
        dimSexo: 'Sex',
        modeValue: 'Births',
        modeShare: 'Share %',
        history: 'History',
        projection: 'Projection',
        band: '95% interval',
        lastObserved: 'Last observed',
        projection2025: '2025 projection',
        trend: 'Trend (share)',
        highlights: 'Trend highlights',
        validation: 'Holdout validation (2023)',
        holdoutTotal: 'Error in forecast total',
        predicted: 'predicted',
        actual: 'actual',
        maeTitle: 'Mean share error (MAE)',
        disclaimer: 'Exploratory trend projection with quantified uncertainty — not a definitive public health forecast.'
      },
      footer: {
        title: 'Data Base Analysis',
        description: 'Interactive dashboard presenting the results of the Database course project — complete public health data pipeline.'
      }
    }
  },
  es: {
    translation: {
      nav: {
        home: 'Inicio',
        about: 'Sobre',
        skills: 'Tecnologías',
        projects: 'Análisis',
        contact: 'Contacto',
        change_language: 'Idioma',
        menu_open: 'Abrir menú',
        menu_close: 'Cerrar menú',
        dashboard: 'Dashboard',
        predictive: 'Modelagem'
      },
      hero: {
        badge: 'DASHBOARD ACTIVO',
        title_pre: 'Data Base',
        description: 'Pipeline completo de importación, limpieza y análisis de datos de nacidos vivos brasileños (SINASC/DataSUS) con R y SQL.',
        view_projects: 'Ver Análisis',
        scroll: 'Desplázate',
        words: ['Análisis de Datos', 'Pipeline SQL→R', 'Calidad de Datos'],
        pipeline_status: 'ESTADO DEL PIPELINE',
        records_loaded: 'REGISTROS CARGADOS',
        cleaned: 'LIMPIADOS',
        quality_score: 'PUNTUACIÓN DE CALIDAD'
      },
      about: {
        title: 'Sobre el Proyecto',
        description: 'Proyecto de base de datos que integra importación de datos en R, diagnóstico de calidad, modelo relacional, manipulación con dplyr y el pipeline SQL→R con DBI/RSQLite.',
        graduation_label: 'DATOS',
        graduation_title: 'Nacidos Vivos (2019–2023)',
        graduation_inst: 'Fuente: SINASC / DataSUS — Estándar nacional de registros de nacidos vivos',
        postgrad_label: 'MODELO',
        postgrad_title: 'Relacional SQL→R',
        postgrad_inst: 'Pipeline completo: importación → limpieza → análisis → persistencia en SQLite',
        detailed_profile: 'Este proyecto demuestra competencias en manipulación de datos, limpieza con dplyr, creación de variables derivadas y consultas SQL complejas. El conjunto de datos incluye 6.080 registros de nacidos vivos con problemas intencionales de calidad.',
        mission_text: 'Objetivo: diagnosticar y resolver problemas de calidad en datos reales, aplicando técnicas de limpieza y validación que garantizan la integridad analítica de los resultados.',
        data_report: 'INFORME DE DATOS',
        mission_objective: 'OBJETIVO DE LA MISIÓN',
        initial: 'INICIAL',
        final: 'FINAL',
        records: 'REGISTROS',
        status_verified: 'STATUS: VERIFICADO',
        status_authorized: 'STATUS: AUTORIZADO',
        pipeline_status_active: 'PIPELINE STATUS ACTIVO',
        pipeline_alert: '570 registros eliminados en la etapa de limpieza. Calidad de datos verificada.',
        docs_title: 'Documentación',
        docs_subtitle: 'Descarga la documentación completa del proyecto en PDF o imagen (PNG).',
        docs_readme_name: 'README',
        docs_readme_desc: 'Visión general del proyecto, limpieza de datos y Machine Learning en el navegador.',
        docs_ref_name: 'Referencia Técnica',
        docs_ref_desc: 'Importación, limpieza con dplyr y pipeline SQL→R con SQLite (Rmd).',
        docs_ml_name: 'Plan de ML',
        docs_ml_desc: 'Plan del modelado predictivo con scikit-learn, XGBoost y SHAP.',
        download_pdf: 'Descargar PDF',
        download_png: 'Descargar PNG'
      },
      skills: {
        title: 'Tecnologías Utilizadas'
      },
      projects: {
        title: 'Resultados del Análisis'
      },
      dashboard: {
        title: 'Panel Interactivo',
        source: 'Fuente de Datos',
        metric: 'Métrica',
        chart: 'Tipo de Gráfico',
        category: 'Categoría',
        filters: 'FILTROS',
        insights: 'INSIGHTS'
      },
      predictive: {
        title: 'Modelado Predictivo',
        subtitle: 'Clasificador de bajo peso al nacer entrenado con 5.379 registros SINASC/DataSUS. Como la Regresión Logística superó a XGBoost, el modelo corre directamente en el navegador.',
        calculator: 'Calculadora de Riesgo',
        idade: 'Edad de la madre (años)',
        semanas: 'Semanas de gestación',
        consultas: 'Consultas prenatales',
        sexo: 'Sexo del bebé',
        regiao: 'Región',
        ano: 'Año',
        probability: 'Probabilidad de bajo peso',
        limiar: 'Umbral (Youden)',
        impact: 'Impacto máximo en el resultado al cambiar este campo',
        alto: 'Riesgo elevado',
        baixo: 'Riesgo bajo',
        fatores: 'Factores que más influyen',
        disclaimer: 'Estimación estadística del modelo — no sustituye la evaluación médica.',
        results: 'Resultados de los Modelos',
        tabBaixoPeso: 'Bajo peso',
        tabPrematuro: 'Prematuridad',
        prematuroNota: 'Modelo exploratorio: predecir la prematuridad sin la edad gestacional es difícil (ROC-AUC ~0.53) — por eso la calculadora cubre solo el bajo peso.',
        featureImportance: 'Importancia de características (SHAP)',
        comparativo: 'Comparación de modelos — 5-fold CV',
        rocTitle: 'Curvas ROC (out-of-fold)',
        vp: 'Verdadero positivo',
        fp: 'Falso positivo'
      },
      forecast: {
        title: 'Proyecciones 2024–2025',
        subtitle: 'Proyección top-down reconciliada: total mediante regresión lineal con intervalo del 95% + participaciones ancladas por región, grupo de edad y sexo (método y validación en ml/PROJECAO_TECH_DESIGN.md).',
        dimTotal: 'Total',
        dimRegiao: 'Región',
        dimFaixaEtaria: 'Grupo de edad',
        dimSexo: 'Sexo',
        modeValue: 'Nacimientos',
        modeShare: 'Participación %',
        history: 'Histórico',
        projection: 'Proyección',
        band: 'Intervalo 95%',
        lastObserved: 'Último observado',
        projection2025: 'Proyección 2025',
        trend: 'Tendencia (participación)',
        highlights: 'Destacados de tendencia',
        validation: 'Validación holdout (2023)',
        holdoutTotal: 'Error en el total previsto',
        predicted: 'previsto',
        actual: 'real',
        maeTitle: 'Error medio de participaciones (MAE)',
        disclaimer: 'Proyección exploratoria de tendencia con incertidumbre cuantificada — no es un pronóstico definitivo de salud pública.'
      },
      footer: {
        title: 'Data Base Analysis',
        description: 'Dashboard interactivo presentando los resultados del proyecto de base de datos — Pipeline completo de datos de salud pública.'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
