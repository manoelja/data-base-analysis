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
        docs_ref_name: 'Referência Técnica',
        docs_ml_name: 'Plano ML',
        download_pdf: 'Baixar PDF',
        download_png: 'Baixar PNG',
        close_modal: 'Fechar',
        generating_pdf: 'Gerando PDF...',
        generating_png: 'Gerando imagem...',
        download_error: 'Erro ao baixar o arquivo. Tente novamente.',
        docs_ref_summary: [
          { heading: 'O que é', items: [
            'Projeto que corrige e analisa dados de nascidos vivos do Brasil (SINASC/DataSUS, 2019–2023) usando R, SQL e SQLite.',
            'O objetivo é encontrar e corrigir problemas nos dados para que os resultados da análise sejam confiáveis.'
          ] },
          { heading: 'Os dados', items: [
            '6.080 registros de nascimentos, com erros de propósito (para exercitar a limpeza de dados)',
            'Duas tabelas: nascimentos.csv (informações de cada nascimento) e uf_referencia.csv (regiões de cada estado)',
            'Colunas principais: idade da mãe, peso do bebê, semanas de gestação, tipo de parto, consultas de pré-natal e nota Apgar'
          ] },
          { heading: 'Problemas encontrados', items: [
            'Valores vazios (sem informação) em várias colunas',
            'Peso do bebê escrito como texto em vez de número',
            'Sexo grafado de formas diferentes (ex.: "fem", "masc", "f")',
            'Siglas de estados que não existem e registros repetidos'
          ] },
          { heading: 'O que foi feito', items: [
            'Padronizamos o sexo (grafias diferentes viram apenas "Masculino" ou "Feminino")',
            'Convertemos o peso em número e removemos 183 registros com peso inválido',
            'Mantivemos apenas idades de 10 a 55 anos (removidos 198 registros)',
            'Removemos 114 siglas de estados inválidas e 75 registros duplicados',
            'Total: 570 registros removidos (9,4%) — restaram 5.510 limpos'
          ] },
          { heading: 'Novas colunas criadas', items: [
            'Baixo peso: "Sim" quando o bebê nasceu com menos de 2.500g',
            'Prematuro: "Sim" quando o bebê nasceu antes das 37 semanas',
            'Faixa etária da mãe (Adolescente, Adulta, 35 ou mais) e tipo de parto em palavras'
          ] },
          { heading: 'Análises realizadas', items: [
            'Indicadores por região e por ano: cesáreas, baixo peso e prematuridade',
            'Norte com mais cesáreas; Centro-Oeste com mais prematuridade',
            'Maioria das mães entre 20 e 34 anos; distribuição equilibrada por sexo'
          ] },
          { heading: 'SQL e R trabalhando juntos', items: [
            'Os dados foram gravados em um banco SQLite',
            'As consultas em SQL e as análises em R (dplyr) deram os mesmos resultados'
          ] },
          { heading: 'Para saber mais', items: ['Documento completo com todo o código em R: data-base-analysis.Rmd.'] }
        ],
        docs_ml_summary: [
          { heading: 'O que é', items: [
            'Ensinar o computador a encontrar padrões nos dados e prever riscos, em linguagem simples.'
          ] },
          { heading: 'O que o modelo prevê', items: [
            'Se o bebê vai nascer com peso baixo (menos de 2.500g) — a pergunta principal',
            'Se vai nascer antes da hora (menos de 37 semanas)',
            'Quanto o bebê vai pesar, em média'
          ] },
          { heading: 'Como funciona', items: [
            'O computador aprende com exemplos: idade da mãe, consultas de pré-natal, região, ano e tipo de parto',
            'Regra de ouro: nunca usar a resposta como pista (sem peso para prever baixo peso)'
          ] },
          { heading: 'Os modelos testados', items: [
            'Dummy: o "chute" básico, serve de comparação',
            'Regressão Logística: modelo simples e fácil de entender',
            'Random Forest: "time" de árvores de decisão que vota no resultado',
            'XGBoost: modelo avançado e poderoso',
            'Vencedor: a Regressão Logística — simples e roda direto no navegador'
          ] },
          { heading: 'Como validamos', items: [
            'Validação cruzada: treinar e testar em 5 partes diferentes dos dados',
            'Métricas: ROC-AUC, PR-AUC, sensibilidade e especificidade',
            'Ponto de corte otimizado (regra de Youden) para equilibrar os erros'
          ] },
          { heading: 'O que descobrimos (SHAP)', items: [
            'Mães adolescentes ou com 35 anos ou mais têm mais risco de bebê de baixo peso',
            'Mais consultas de pré-natal diminuem o risco (o pré-natal protege)'
          ] },
          { heading: 'Calculadora no site', items: [
            'A calculadora de risco funciona direto no navegador, sem enviar dados para servidores'
          ] },
          { heading: 'Projeções 2024–2025', items: [
            'Projeção com faixa de valores prováveis (intervalo de 95%)',
            'Erro de −2,0% no teste com o ano de 2023',
            'Queda da participação da região Norte (significativa) e de mães com 35+'
          ] },
          { heading: 'Qualidade', items: ['95 testes automatizados passando; build e lint sem erros'] }
        ]
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
        docs_ref_name: 'Technical Reference',
        docs_ml_name: 'ML Plan',
        download_pdf: 'Download PDF',
        download_png: 'Download PNG',
        close_modal: 'Close',
        generating_pdf: 'Generating PDF...',
        generating_png: 'Generating image...',
        download_error: 'Error downloading the file. Please try again.',
        docs_ref_summary: [
          { heading: 'Overview', items: [
            'Project that cleans and analyzes data on live births in Brazil (SINASC/DataSUS, 2019–2023) using R, SQL, and SQLite.',
            'The goal is to find and fix data issues so that analysis results are trustworthy.'
          ] },
          { heading: 'The data', items: [
            '6,080 birth records with intentional errors (to practice data cleaning)',
            'Two tables: nascimentos.csv (information on each birth) and uf_referencia.csv (regions of each state)',
            'Main columns: mother age, baby weight, gestational weeks, birth type, prenatal visits, and Apgar score'
          ] },
          { heading: 'Issues found', items: [
            'Missing values in several columns',
            'Baby weight stored as text instead of a number',
            'Sex written in different ways (e.g., "fem", "masc", "f")',
            'Invalid state codes and duplicated records'
          ] },
          { heading: 'What was done', items: [
            'Standardized sex (different spellings become just "Male" or "Female")',
            'Converted weight into a number and removed 183 records with invalid weight',
            'Kept only ages 10 to 55 (198 records removed)',
            'Removed 114 invalid state codes and 75 duplicated records',
            'Total: 570 records removed (9.4%) — 5,510 clean records remain'
          ] },
          { heading: 'New columns created', items: [
            'Low birth weight: "Yes" when the baby weighed less than 2,500g',
            'Premature: "Yes" when the baby was born before 37 weeks',
            'Mother age group (Teen, Adult, 35+) and birth type in words'
          ] },
          { heading: 'Analyses performed', items: [
            'Indicators by region and year: C-sections, low birth weight, and prematurity',
            'North with more C-sections; Midwest with more prematurity',
            'Most mothers are 20–34; balanced distribution by sex'
          ] },
          { heading: 'SQL and R working together', items: [
            'The data was stored in a SQLite database',
            'SQL queries and R (dplyr) analyses returned the same results'
          ] },
          { heading: 'Learn more', items: ['Full document with all R code: data-base-analysis.Rmd.'] }
        ],
        docs_ml_summary: [
          { heading: 'Overview', items: [
            'Teaching the computer to find patterns in the data and predict risks, in simple language.'
          ] },
          { heading: 'What the model predicts', items: [
            'Whether the baby will be born with low weight (under 2,500g) — the main question',
            'Whether the baby will be born early (before 37 weeks)',
            'The expected birth weight, on average'
          ] },
          { heading: 'How it works', items: [
            'The computer learns from examples: mother age, prenatal visits, region, year, and birth type',
            'Golden rule: never use the answer as a clue (no weight to predict low weight)'
          ] },
          { heading: 'Models tested', items: [
            'Dummy: the basic "guess", used as a baseline',
            'Logistic Regression: a simple, easy-to-understand model',
            'Random Forest: a "team" of decision trees that votes on the result',
            'XGBoost: an advanced, powerful model',
            'Winner: Logistic Regression — simple and runs right in the browser'
          ] },
          { heading: 'How we validate', items: [
            'Cross-validation: train and test on 5 different slices of the data',
            'Metrics: ROC-AUC, PR-AUC, sensitivity, and specificity',
            'Optimized cut-off (Youden\'s rule) to balance errors'
          ] },
          { heading: 'What we found (SHAP)', items: [
            'Teen or 35+ mothers have a higher risk of low birth weight',
            'More prenatal visits lower the risk (prenatal care protects)'
          ] },
          { heading: 'Calculator on the site', items: [
            'The risk calculator works right in the browser, without sending data to servers'
          ] },
          { heading: '2024–2025 projections', items: [
            'Projection with a range of likely values (95% interval)',
            '−2.0% error in the test with 2023',
            'Declining share of the North region (significant) and mothers aged 35+'
          ] },
          { heading: 'Quality', items: ['95 automated tests passing; build and lint clean'] }
        ]
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
        docs_ref_name: 'Referencia Técnica',
        docs_ml_name: 'Plan de ML',
        download_pdf: 'Descargar PDF',
        download_png: 'Descargar PNG',
        close_modal: 'Cerrar',
        generating_pdf: 'Generando PDF...',
        generating_png: 'Generando imagen...',
        download_error: 'Error al descargar el archivo. Inténtelo de nuevo.',
        docs_ref_summary: [
          { heading: 'Qué es', items: [
            'Proyecto que corrige y analiza datos de nacidos vivos de Brasil (SINASC/DataSUS, 2019–2023) con R, SQL y SQLite.',
            'El objetivo es encontrar y corregir problemas en los datos para que los resultados del análisis sean confiables.'
          ] },
          { heading: 'Los datos', items: [
            '6.080 registros de nacimientos, con errores a propósito (para practicar la limpieza de datos)',
            'Dos tablas: nascimentos.csv (información de cada nacimiento) y uf_referencia.csv (regiones de cada estado)',
            'Columnas principales: edad de la madre, peso del bebé, semanas de gestación, tipo de parto, consultas prenatales y puntuación Apgar'
          ] },
          { heading: 'Problemas encontrados', items: [
            'Valores vacíos (sin información) en varias columnas',
            'Peso del bebé escrito como texto en lugar de número',
            'Sexo escrito de formas diferentes (ej.: "fem", "masc", "f")',
            'Siglas de estados que no existen y registros repetidos'
          ] },
          { heading: 'Qué se hizo', items: [
            'Estandarizamos el sexo (las grafías diferentes pasan a ser solo "Masculino" o "Femenino")',
            'Convertimos el peso en número y eliminamos 183 registros con peso inválido',
            'Solo edades de 10 a 55 años (198 registros eliminados)',
            'Eliminamos 114 siglas inválidas y 75 registros duplicados',
            'Total: 570 registros eliminados (9,4 %) — quedaron 5.510 limpios'
          ] },
          { heading: 'Nuevas columnas creadas', items: [
            'Bajo peso: "Sí" cuando el bebé nació con menos de 2.500 g',
            'Prematuro: "Sí" cuando el bebé nació antes de las 37 semanas',
            'Grupo de edad de la madre (Adolescente, Adulta, 35+) y tipo de parto en palabras'
          ] },
          { heading: 'Análisis realizados', items: [
            'Indicadores por región y por año: cesáreas, bajo peso y prematuridad',
            'Norte con más cesáreas; Centro-Oeste con más prematuridad',
            'La mayoría de las madres tiene entre 20 y 34 años; distribución equilibrada por sexo'
          ] },
          { heading: 'SQL y R trabajando juntos', items: [
            'Los datos se guardaron en una base de datos SQLite',
            'Las consultas en SQL y los análisis en R (dplyr) dieron los mismos resultados'
          ] },
          { heading: 'Para saber más', items: ['Documento completo con todo el código en R: data-base-analysis.Rmd.'] }
        ],
        docs_ml_summary: [
          { heading: 'Qué es', items: [
            'Enseñar a la computadora a encontrar patrones en los datos y predecir riesgos, en lenguaje sencillo.'
          ] },
          { heading: 'Qué predice el modelo', items: [
            'Si el bebé nacerá con bajo peso (menos de 2.500 g) — la pregunta principal',
            'Si nacerá antes de tiempo (menos de 37 semanas)',
            'Cuánto pesará el bebé, en promedio'
          ] },
          { heading: 'Cómo funciona', items: [
            'La computadora aprende con ejemplos: edad de la madre, consultas prenatales, región, año y tipo de parto',
            'Regla de oro: nunca usar la respuesta como pista (sin peso para predecir el bajo peso)'
          ] },
          { heading: 'Modelos probados', items: [
            'Dummy: la "adivinanza" básica, sirve de comparación',
            'Regresión Logística: modelo simple y fácil de entender',
            'Random Forest: un "equipo" de árboles de decisión que vota el resultado',
            'XGBoost: modelo avanzado y potente',
            'Ganador: la Regresión Logística — simple y funciona en el navegador'
          ] },
          { heading: 'Cómo validamos', items: [
            'Validación cruzada: entrenar y probar en 5 partes diferentes de los datos',
            'Métricas: ROC-AUC, PR-AUC, sensibilidad y especificidad',
            'Punto de corte optimizado (regla de Youden) para equilibrar los errores'
          ] },
          { heading: 'Qué descubrimos (SHAP)', items: [
            'Las madres adolescentes o de 35+ tienen más riesgo de bajo peso',
            'Más consultas prenatales reducen el riesgo (el prenatal protege)'
          ] },
          { heading: 'Calculadora en el sitio', items: [
            'La calculadora de riesgo funciona en el navegador, sin enviar datos a servidores'
          ] },
          { heading: 'Proyecciones 2024–2025', items: [
            'Proyección con una franja de valores probables (intervalo del 95 %)',
            'Error de −2,0 % en la prueba con el año 2023',
            'Caída de la participación de la región Norte (significativa) y de madres de 35+'
          ] },
          { heading: 'Calidad', items: ['95 pruebas automatizadas aprobadas; build y lint sin errores'] }
        ]
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
