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
        dashboard: 'Dashboard'
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
        pipeline_alert: '570 registros removidos na etapa de limpeza. Qualidade dos dados verificada.'
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
        dashboard: 'Dashboard'
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
        pipeline_alert: '570 records removed during cleaning step. Data quality verified.'
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
        dashboard: 'Dashboard'
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
        pipeline_alert: '570 registros eliminados en la etapa de limpieza. Calidad de datos verificada.'
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
