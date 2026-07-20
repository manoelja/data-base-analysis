export interface AnalysisResult {
  id: number;
  title: Record<string, string>;
  category: Record<string, string>;
  description: Record<string, string>;
  problem: Record<string, string>;
  result: Record<string, string>;
  tags: string[];
}

export interface RegionData {
  region: string;
  births: number;
  pctCesarea: number;
  pctBaixoPeso: number;
  pctPrematuro: number;
}

export interface CleaningStats {
  initialRecords: number;
  finalRecords: number;
  removedRecords: number;
  steps: {
    label: string;
    removed: number;
    reason: string;
  }[];
}

export interface TechItem {
  name: string;
  category: string;
  detail: string;
  icon: string;
}

export interface YearData {
  year: number;
  births: number;
  pctCesarea: number;
  pctBaixoPeso: number;
  pctPrematuro: number;
  avgWeight: number;
}

export interface AgeGroupData {
  group: string;
  count: number;
  pct: number;
}

export interface SexoData {
  sexo: string;
  count: number;
  pct: number;
}

export const cleaningStats: CleaningStats = {
  initialRecords: 6080,
  finalRecords: 5510,
  removedRecords: 570,
  steps: [
    { label: 'PESO_GRAMAS', removed: 183, reason: 'Valores não numéricos, negativos ou ausentes' },
    { label: 'IDADE_MAE', removed: 198, reason: 'Idades fora da faixa biológica plausível (10-55 anos)' },
    { label: 'UF', removed: 114, reason: 'Siglas de estados inválidas' },
    { label: 'Duplicatas', removed: 75, reason: 'Registros completamente duplicados' },
  ],
};

export const regionData: RegionData[] = [
  { region: 'Norte', births: 486, pctCesarea: 58.8, pctBaixoPeso: 1.6, pctPrematuro: 10.7 },
  { region: 'Nordeste', births: 1541, pctCesarea: 56.9, pctBaixoPeso: 1.4, pctPrematuro: 9.7 },
  { region: 'Centro-Oeste', births: 471, pctCesarea: 56.7, pctBaixoPeso: 3.0, pctPrematuro: 14.9 },
  { region: 'Sudeste', births: 2245, pctCesarea: 55.6, pctBaixoPeso: 1.9, pctPrematuro: 10.0 },
  { region: 'Sul', births: 767, pctCesarea: 57.0, pctBaixoPeso: 1.7, pctPrematuro: 9.3 },
];

export const summaryStats = {
  totalBirths: 5510,
  avgWeight: 3328,
  pctCesarea: 56.6,
  pctBaixoPeso: 1.8,
};

export const yearData: YearData[] = [
  { year: 2019, births: 1112, pctCesarea: 58.0, pctBaixoPeso: 1.8, pctPrematuro: 10.8, avgWeight: 3331 },
  { year: 2020, births: 1076, pctCesarea: 53.3, pctBaixoPeso: 1.6, pctPrematuro: 9.5, avgWeight: 3332 },
  { year: 2021, births: 1136, pctCesarea: 57.3, pctBaixoPeso: 1.8, pctPrematuro: 9.9, avgWeight: 3326 },
  { year: 2022, births: 1076, pctCesarea: 57.7, pctBaixoPeso: 1.9, pctPrematuro: 10.2, avgWeight: 3329 },
  { year: 2023, births: 1110, pctCesarea: 56.3, pctBaixoPeso: 1.9, pctPrematuro: 10.9, avgWeight: 3325 },
];

export const ageGroupData: AgeGroupData[] = [
  { group: 'Adolescente', count: 605, pct: 11.0 },
  { group: 'Adulta', count: 4304, pct: 78.1 },
  { group: '35 ou mais', count: 601, pct: 10.9 },
];

export const sexoData: SexoData[] = [
  { sexo: 'Feminino', count: 2577, pct: 46.8 },
  { sexo: 'Masculino', count: 2802, pct: 50.9 },
];

// State-level data for drill-down
export interface StateData {
  uf: string;
  region: string;
  births: number;
  pctCesarea: number;
  pctBaixoPeso: number;
  pctPrematuro: number;
}

export const stateData: StateData[] = [
  // Norte
  { uf: 'AM', region: 'Norte', births: 116, pctCesarea: 52.6, pctBaixoPeso: 1.7, pctPrematuro: 10.3 },
  { uf: 'PA', region: 'Norte', births: 215, pctCesarea: 57.2, pctBaixoPeso: 2.3, pctPrematuro: 11.6 },
  { uf: 'RO', region: 'Norte', births: 54, pctCesarea: 61.1, pctBaixoPeso: 0.0, pctPrematuro: 9.3 },
  { uf: 'AC', region: 'Norte', births: 25, pctCesarea: 68.0, pctBaixoPeso: 0.0, pctPrematuro: 16.0 },
  { uf: 'RR', region: 'Norte', births: 17, pctCesarea: 58.8, pctBaixoPeso: 5.9, pctPrematuro: 5.9 },
  { uf: 'AP', region: 'Norte', births: 22, pctCesarea: 72.7, pctBaixoPeso: 0.0, pctPrematuro: 0.0 },
  { uf: 'TO', region: 'Norte', births: 37, pctCesarea: 70.3, pctBaixoPeso: 0.0, pctPrematuro: 13.5 },
  // Nordeste
  { uf: 'BA', region: 'Nordeste', births: 393, pctCesarea: 53.7, pctBaixoPeso: 1.5, pctPrematuro: 11.7 },
  { uf: 'CE', region: 'Nordeste', births: 258, pctCesarea: 60.5, pctBaixoPeso: 1.9, pctPrematuro: 8.1 },
  { uf: 'PE', region: 'Nordeste', births: 245, pctCesarea: 56.3, pctBaixoPeso: 1.6, pctPrematuro: 8.6 },
  { uf: 'MA', region: 'Nordeste', births: 186, pctCesarea: 59.7, pctBaixoPeso: 1.1, pctPrematuro: 11.3 },
  { uf: 'PB', region: 'Nordeste', births: 114, pctCesarea: 57.0, pctBaixoPeso: 0.9, pctPrematuro: 9.6 },
  { uf: 'RN', region: 'Nordeste', births: 113, pctCesarea: 61.1, pctBaixoPeso: 0.0, pctPrematuro: 9.7 },
  { uf: 'SE', region: 'Nordeste', births: 52, pctCesarea: 59.6, pctBaixoPeso: 1.9, pctPrematuro: 5.8 },
  { uf: 'AL', region: 'Nordeste', births: 77, pctCesarea: 57.1, pctBaixoPeso: 0.0, pctPrematuro: 9.1 },
  { uf: 'PI', region: 'Nordeste', births: 103, pctCesarea: 50.5, pctBaixoPeso: 1.9, pctPrematuro: 7.8 },
  // Centro-Oeste
  { uf: 'GO', region: 'Centro-Oeste', births: 199, pctCesarea: 59.8, pctBaixoPeso: 4.0, pctPrematuro: 15.1 },
  { uf: 'MT', region: 'Centro-Oeste', births: 118, pctCesarea: 55.1, pctBaixoPeso: 3.4, pctPrematuro: 16.1 },
  { uf: 'MS', region: 'Centro-Oeste', births: 68, pctCesarea: 51.5, pctBaixoPeso: 2.9, pctPrematuro: 11.8 },
  { uf: 'DF', region: 'Centro-Oeste', births: 86, pctCesarea: 55.8, pctBaixoPeso: 0.0, pctPrematuro: 15.1 },
  // Sudeste
  { uf: 'SP', region: 'Sudeste', births: 1157, pctCesarea: 55.1, pctBaixoPeso: 2.0, pctPrematuro: 10.8 },
  { uf: 'MG', region: 'Sudeste', births: 548, pctCesarea: 59.3, pctBaixoPeso: 1.1, pctPrematuro: 8.9 },
  { uf: 'RJ', region: 'Sudeste', births: 429, pctCesarea: 53.8, pctBaixoPeso: 2.6, pctPrematuro: 7.9 },
  { uf: 'ES', region: 'Sudeste', births: 111, pctCesarea: 49.5, pctBaixoPeso: 1.8, pctPrematuro: 14.4 },
  // Sul
  { uf: 'PR', region: 'Sul', births: 273, pctCesarea: 54.6, pctBaixoPeso: 1.8, pctPrematuro: 9.2 },
  { uf: 'SC', region: 'Sul', births: 191, pctCesarea: 59.2, pctBaixoPeso: 2.6, pctPrematuro: 11.5 },
  { uf: 'RS', region: 'Sul', births: 303, pctCesarea: 57.8, pctBaixoPeso: 1.0, pctPrematuro: 7.9 },
];

// Year x Region cross-tabulation
export interface YearRegionData {
  year: number;
  region: string;
  births: number;
  pctCesarea: number;
}

export const yearRegionData: YearRegionData[] = [
  { year: 2019, region: 'Norte', births: 110, pctCesarea: 59.1 },
  { year: 2019, region: 'Nordeste', births: 316, pctCesarea: 58.5 },
  { year: 2019, region: 'Centro-Oeste', births: 91, pctCesarea: 58.2 },
  { year: 2019, region: 'Sudeste', births: 434, pctCesarea: 55.8 },
  { year: 2019, region: 'Sul', births: 161, pctCesarea: 62.1 },
  { year: 2020, region: 'Norte', births: 96, pctCesarea: 59.4 },
  { year: 2020, region: 'Nordeste', births: 283, pctCesarea: 51.2 },
  { year: 2020, region: 'Centro-Oeste', births: 96, pctCesarea: 57.3 },
  { year: 2020, region: 'Sudeste', births: 451, pctCesarea: 50.8 },
  { year: 2020, region: 'Sul', births: 150, pctCesarea: 58.7 },
  { year: 2021, region: 'Norte', births: 100, pctCesarea: 49.0 },
  { year: 2021, region: 'Nordeste', births: 352, pctCesarea: 59.1 },
  { year: 2021, region: 'Centro-Oeste', births: 98, pctCesarea: 49.0 },
  { year: 2021, region: 'Sudeste', births: 431, pctCesarea: 59.2 },
  { year: 2021, region: 'Sul', births: 155, pctCesarea: 58.7 },
  { year: 2022, region: 'Norte', births: 87, pctCesarea: 60.9 },
  { year: 2022, region: 'Nordeste', births: 308, pctCesarea: 56.5 },
  { year: 2022, region: 'Centro-Oeste', births: 96, pctCesarea: 65.6 },
  { year: 2022, region: 'Sudeste', births: 447, pctCesarea: 58.2 },
  { year: 2022, region: 'Sul', births: 138, pctCesarea: 51.4 },
  { year: 2023, region: 'Norte', births: 93, pctCesarea: 66.7 },
  { year: 2023, region: 'Nordeste', births: 282, pctCesarea: 58.5 },
  { year: 2023, region: 'Centro-Oeste', births: 90, pctCesarea: 53.3 },
  { year: 2023, region: 'Sudeste', births: 482, pctCesarea: 54.6 },
  { year: 2023, region: 'Sul', births: 163, pctCesarea: 53.4 },
];

export const analysisResults: AnalysisResult[] = [
  {
    id: 1,
    title: { pt: 'Limpeza de SEXO', en: 'SEXO Cleaning', es: 'Limpieza de SEXO' },
    category: { pt: 'QUALIDADE', en: 'QUALITY', es: 'CALIDAD' },
    description: {
      pt: 'Padronização de grafias inconsistentes (f, F, fem, masculino, MASC, etc.) em duas categorias: Masculino e Feminino.',
      en: 'Standardization of inconsistent spellings (f, F, fem, masculine, MASC, etc.) into two categories: Male and Female.',
      es: 'Estandarización de grafías inconsistentes (f, F, fem, masculino, MASC, etc.) en dos categorías: Masculino y Femenino.'
    },
    problem: {
      pt: 'Grafias variadas: "f", "F", "fem", "FEMININO", "Masculino", "masc", "MASCULINO", valores vazios',
      en: 'Various spellings: "f", "F", "fem", "FEMININO", "Masculino", "masc", "MASCULINO", empty values',
      es: 'Grafías variadas: "f", "F", "fem", "FEMININO", "Masculino", "masc", "MASCULINO", valores vacíos'
    },
    result: {
      pt: 'case_when() converteu todas as variações para "Masculino" e "Feminino". Brancos → NA.',
      en: 'case_when() converted all variations to "Masculino" and "Feminino". Blanks → NA.',
      es: 'case_when() convirtió todas las variaciones a "Masculino" y "Femenino". En blancos → NA.'
    },
    tags: ['dplyr', 'case_when', 'count']
  },
  {
    id: 2,
    title: { pt: 'PESO_GRAMAS Numérico', en: 'PESO_GRAMAS Numeric', es: 'PESO_GRAMAS Numérico' },
    category: { pt: 'CONVERSÃO', en: 'CONVERSION', es: 'CONVERSIÓN' },
    description: {
      pt: 'Conversão de texto para numérico, remoção de negativos e ausentes. Critério: apenas pesos positivos e conhecidos.',
      en: 'Text to numeric conversion, removal of negatives and missing. Criterion: only positive and known weights.',
      es: 'Conversión de texto a numérico, eliminación de negativos y ausentes. Criterio: solo pesos positivos y conocidos.'
    },
    problem: {
      pt: 'PESO_GRAMAS importada como character com ruídos, espaços e valores negativos',
      en: 'PESO_GRAMAS imported as character with noise, spaces and negative values',
      es: 'PESO_GRAMAS importada como character con ruido, espacios y valores negativos'
    },
    result: {
      pt: 'suppressWarnings(as.numeric()) + filter(PESO_GRAMAS > 0). Registros inválidos removidos.',
      en: 'suppressWarnings(as.numeric()) + filter(PESO_GRAMAS > 0). Invalid records removed.',
      es: 'suppressWarnings(as.numeric()) + filter(PESO_GRAMAS > 0). Registros inválidos eliminados.'
    },
    tags: ['as.numeric', 'filter', 'NA']
  },
  {
    id: 3,
    title: { pt: 'IDADE_MAE Filtragem', en: 'IDADE_MAE Filtering', es: 'IDADE_MAE Filtrado' },
    category: { pt: 'VALIDAÇÃO', en: 'VALIDATION', es: 'VALIDACIÓN' },
    description: {
      pt: 'Critério biológico: idades entre 10 e 55 anos. Fora dessa faixa são consideradas inconsistentes.',
      en: 'Biological criterion: ages between 10 and 55 years. Outside this range considered inconsistent.',
      es: 'Criterio biológico: edades entre 10 y 55 años. Fuera de ese rango se consideran inconsistentes.'
    },
    problem: {
      pt: 'Valores impossíveis (idades < 10 ou > 55) e NAs na variável IDADE_MAE',
      en: 'Impossible values (ages < 10 or > 55) and NAs in the IDADE_MAE variable',
      es: 'Valores imposibles (edades < 10 o > 55) y NAs en la variable IDADE_MAE'
    },
    result: {
      pt: 'filter(!is.na(IDADE_MAE) & IDADE_MAE >= 10 & IDADE_MAE <= 55) — 100% biologicamente plausível',
      en: 'filter(!is.na(IDADE_MAE) & IDADE_MAE >= 10 & IDADE_MAE <= 55) — 100% biologically plausible',
      es: 'filter(!is.na(IDADE_MAE) & IDADE_MAE >= 10 & IDADE_MAE <= 55) — 100% biológicamente plausible'
    },
    tags: ['filter', 'range', 'plausibility']
  },
  {
    id: 4,
    title: { pt: 'UF Inválidas', en: 'Invalid UFs', es: 'UFs Inválidas' },
    category: { pt: 'VALIDAÇÃO', en: 'VALIDATION', es: 'VALIDACIÓN' },
    description: {
      pt: 'Remoção de siglas de estados que não existem na dimensão uf_ref (ZZ, 99, etc.).',
      en: 'Removal of state codes that do not exist in the uf_ref dimension (ZZ, 99, etc.).',
      es: 'Eliminación de códigos de estado que no existen en la dimensión uf_ref (ZZ, 99, etc.).'
    },
    problem: {
      pt: 'Siglas inválidas como ZZ e 99 que não correspondem a nenhum estado brasileiro',
      en: 'Invalid codes like ZZ and 99 that do not correspond to any Brazilian state',
      es: 'Códigos inválidos como ZZ y 99 que no corresponden a ningún estado brasileño'
    },
    result: {
      pt: 'filter(UF %in% uf_ref$UF) — apenas siglas válidas mantidas (27 UFs + DF)',
      en: 'filter(UF %in% uf_ref$UF) — only valid codes kept (27 states + DF)',
      es: 'filter(UF %in% uf_ref$UF) — solo códigos válidos mantenidos (27 estados + DF)'
    },
    tags: ['filter', 'JOIN', 'validação']
  },
  {
    id: 5,
    title: { pt: 'Duplicatas Removidas', en: 'Duplicates Removed', es: 'Duplicados Eliminados' },
    category: { pt: 'QUALIDADE', en: 'QUALITY', es: 'CALIDAD' },
    description: {
      pt: 'Identificação e remoção de registros completamente duplicados com distinct().',
      en: 'Identification and removal of completely duplicate records with distinct().',
      es: 'Identificación y eliminación de registros completamente duplicados con distinct().'
    },
    problem: {
      pt: 'Registros idênticos em todas as colunas que inflam artificialmente o volume de dados',
      en: 'Identical records across all columns that artificially inflate data volume',
      es: 'Registros idénticos en todas las columnas que inflan artificialmente el volumen de datos'
    },
    result: {
      pt: 'distinct() removeu duplicatas — base final com 5.510 registros limpos',
      en: 'distinct() removed duplicates — final dataset with 5,510 clean records',
      es: 'distinct() eliminó duplicados — conjunto final con 5,510 registros limpios'
    },
    tags: ['distinct', 'qualidade', 'deduplicação']
  },
  {
    id: 6,
    title: { pt: 'Variáveis Derivadas', en: 'Derived Variables', es: 'Variables Derivadas' },
    category: { pt: 'ENGENHARIA', en: 'ENGINEERING', es: 'INGENIERÍA' },
    description: {
      pt: 'Criação de TIPO_PARTO_LABEL, BAIXO_PESO, PREMATURO e FAIXA_IDADE_MAE com if_else() e case_when().',
      en: 'Creation of TIPO_PARTO_LABEL, BAIXO_PESO, PREMATURO and FAIXA_IDADE_MAE with if_else() and case_when().',
      es: 'Creación de TIPO_PARTO_LABEL, BAIXO_PESO, PREMATURO y FAIXA_IDADE_MAE con if_else() y case_when().'
    },
    problem: {
      pt: 'Necessidade de variáveis categorizadas para análises de saúde pública',
      en: 'Need for categorized variables for public health analysis',
      es: 'Necesidad de variables categorizadas para análisis de salud pública'
    },
    result: {
      pt: '4 novas variáveis: parto (Vaginal/Cesáreo), baixo peso (<2500g), prematuro (<37 sem), faixa etária',
      en: '4 new variables: delivery type, low birth weight (<2500g), premature (<37wk), age group',
      es: '4 nuevas variables: tipo de parto, bajo peso (<2500g), prematuro (<37sem), grupo etario'
    },
    tags: ['mutate', 'case_when', 'if_else']
  },
  {
    id: 7,
    title: { pt: 'Indicadores por Região', en: 'Regional Indicators', es: 'Indicadores por Región' },
    category: { pt: 'ANÁLISE', en: 'ANALYSIS', es: 'ANÁLISIS' },
    description: {
      pt: 'JOIN entre nascimentos e uf_ref para calcular % cesáreas, % baixo peso e % prematuros por região.',
      en: 'JOIN between nascimentos and uf_ref to calculate % c-sections, % low weight and % premature by region.',
      es: 'JOIN entre nascimentos y uf_ref para calcular % cesáreas, % bajo peso y % prematuros por región.'
    },
    problem: {
      pt: 'Necessidade de agregar indicadores de saúde por região geográfica',
      en: 'Need to aggregate health indicators by geographic region',
      es: 'Necesidad de agregar indicadores de salud por región geográfica'
    },
    result: {
      pt: 'Norte lidera com 58.8% cesáreas; Centro-Oeste tem maior % prematuros (14.9%)',
      en: 'North leads with 58.8% c-sections; Centro-Oeste has highest % premature (14.9%)',
      es: 'Norte lidera con 58.8% cesáreas; Centro-Oeste tiene mayor % prematuros (14.9%)'
    },
    tags: ['inner_join', 'group_by', 'summarise']
  },
  {
    id: 8,
    title: { pt: 'SQL: Top 10 Prematuros', en: 'SQL: Top 10 Premature', es: 'SQL: Top 10 Prematuros' },
    category: { pt: 'SQL', en: 'SQL', es: 'SQL' },
    description: {
      pt: 'Consulta SQL com WHERE, ORDER BY e LIMIT para identificar os 10 bebês prematuros com menor peso.',
      en: 'SQL query with WHERE, ORDER BY and LIMIT to identify the 10 lowest weight premature babies.',
      es: 'Consulta SQL con WHERE, ORDER BY y LIMIT para identificar a los 10 bebés prematuros de menor peso.'
    },
    problem: {
      pt: 'Identificar casos críticos de prematuros com peso muito baixo para investigação',
      en: 'Identify critical cases of premature babies with very low weight for investigation',
      es: 'Identificar casos críticos de prematuros con peso muy bajo para investigación'
    },
    result: {
      pt: 'SELECT com WHERE PREMATURO="Sim" ORDER BY PESO_GRAMAS ASC LIMIT 10 — menor peso: 251g',
      en: 'SELECT with WHERE PREMATURO="Sim" ORDER BY PESO_GRAMAS ASC LIMIT 10 — lowest weight: 251g',
      es: 'SELECT con WHERE PREMATURO="Sim" ORDER BY PESO_GRAMAS ASC LIMIT 10 — menor peso: 251g'
    },
    tags: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT']
  },
  {
    id: 9,
    title: { pt: 'SQL: Cesáreas por UF', en: 'SQL: C-Sections by State', es: 'SQL: Cesáreas por UF' },
    category: { pt: 'SQL', en: 'SQL', es: 'SQL' },
    description: {
      pt: 'GROUP BY + HAVING para calcular % de cesáreas por UF, filtrando apenas UFs com mais de 100 nascimentos.',
      en: 'GROUP BY + HAVING to calculate % c-sections by state, filtering only states with more than 100 births.',
      es: 'GROUP BY + HAVING para calcular % de cesáreas por UF, filtrando solo UFs con más de 100 nacimientos.'
    },
    problem: {
      pt: 'Comparar taxas de cesárea entre estados com amostra estatisticamente relevante',
      en: 'Compare c-section rates between states with statistically relevant sample',
      es: 'Comparar tasas de cesárea entre estados con muestra estadísticamente relevante'
    },
    result: {
      pt: 'HAVING n>100 filtra UFs pequenas. SP lidera com 1157 nascimentos, seguido por MG (548)',
      en: 'HAVING n>100 filters small states. SP leads with 1157 births, followed by MG (548)',
      es: 'HAVING n>100 filtra UFs pequeñas. SP lidera con 1157 nacimientos, seguido por MG (548)'
    },
    tags: ['GROUP BY', 'HAVING', 'AVG', 'ROUND']
  },
  {
    id: 10,
    title: { pt: 'Coerência SQL ↔ dplyr', en: 'SQL ↔ dplyr Consistency', es: 'Coherencia SQL ↔ dplyr' },
    category: { pt: 'VALIDAÇÃO', en: 'VALIDATION', es: 'VALIDACIÓN' },
    description: {
      pt: 'Validação cruzada: resultados do pipeline dplyr e SQL produzem os mesmos indicadores.',
      en: 'Cross-validation: dplyr pipeline and SQL results produce the same indicators.',
      es: 'Validación cruzada: los resultados del pipeline dplyr y SQL producen los mismos indicadores.'
    },
    problem: {
      pt: 'Garantir que manipulações em R e consultas SQL são equivalentes',
      en: 'Ensure that R manipulations and SQL queries are equivalent',
      es: 'Garantizar que las manipulaciones en R y las consultas SQL son equivalentes'
    },
    result: {
      pt: 'Ambas as linguagens retornaram os mesmos valores — GROUP BY + HAVING = group_by + summarise',
      en: 'Both languages returned the same values — GROUP BY + HAVING = group_by + summarise',
      es: 'Ambos lenguajes retornaron los mismos valores — GROUP BY + HAVING = group_by + summarise'
    },
    tags: ['DBI', 'RSQLite', 'cross-validation']
  },
];

export const techStack: TechItem[] = [
  { name: 'R / dplyr', category: 'ANÁLISE', detail: 'Pacote principal para manipulação de dados com pipes (%>%), filter, mutate, group_by, summarise.', icon: 'code' },
  { name: 'SQLite / DBI', category: 'BANCO DE DADOS', detail: 'Pipeline SQL→R: criação de tabelas, INSERT, consultas com JOIN, GROUP BY, HAVING.', icon: 'database' },
  { name: 'skimr / visdat', category: 'DIAGNÓSTICO', detail: 'Visualização de dados ausentes (vis_miss), resumo estatístico completo (skim).', icon: 'search' },
  { name: 'kableExtra', category: 'RELATÓRIO', detail: 'Formatação de tabelas para PDF com LaTeX, estilos striped e hold_position.', icon: 'file-text' },
  { name: 'ggplot2', category: 'VISUALIZAÇÃO', detail: 'Gráficos estatísticos para análise exploratória de distribuições e comparações.', icon: 'bar-chart' },
  { name: 'naniar', category: 'AUSÊNCIA', detail: 'Análise detalhada de padrões de valores ausentes com visualizações especializadas.', icon: 'eye' },
];
