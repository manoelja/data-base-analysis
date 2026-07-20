import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './Footer.css';
import { Github, Linkedin, User, X, Terminal, Code, Command } from 'lucide-react';

type ShellType = 'r' | 'sql' | 'cmd';

const aboutTexts: Record<string, string> = {
  pt: "Sou Data Scientist apaixonado por transformar dados em inteligência e democratizar o conhecimento técnico. Criei esta plataforma para compartilhar aprendizado e contribuir com a comunidade brasileira de tecnologia.",
  en: "I'm a Data Scientist passionate about turning data into intelligence and democratizing technical knowledge. I created this platform to share learning and contribute to the tech community.",
  es: "Soy Data Scientist apasionado por transformar datos en inteligencia y democratizar el conocimiento técnico. Creé esta plataforma para compartir aprendizaje y contribuir a la comunidad tecnológica."
};

const authorLabels: Record<string, string> = {
  pt: "Desenvolvido por Manoel — Data Scientist",
  en: "Developed by Manoel — Data Scientist",
  es: "Desarrollado por Manoel — Data Scientist"
};

const aboutTitles: Record<string, string> = {
  pt: "Sobre o Desenvolvedor",
  en: "About the Developer",
  es: "Sobre el Desarrollador"
};

const copyrightTexts: Record<string, string> = {
  pt: "© 2026 DS.Manoel. Todos os direitos reservados.",
  en: "© 2026 DS.Manoel. All rights reserved.",
  es: "© 2026 DS.Manoel. Todos los derechos reservados."
};

export default function Footer() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0];
  const [showAbout, setShowAbout] = useState(false);
  const [activeShell, setActiveShell] = useState<ShellType>('r');
  const [terminalHistory, setTerminalHistory] = useState<Array<{type: 'input' | 'success' | 'error' | 'info', text: string}>>([
    { type: 'info', text: '> Selecione um shell: r, sql ou cmd' },
    { type: 'info', text: '> Digite "help" para ver os comandos disponíveis.' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, []);

  const rCommands: Record<string, { response: string; type: 'success' | 'error' }> = {
    'help': { response: 'R: head, tail, str, summary, dim, names, nrow, ncol, glimpse, skim, class, table(sexo), table(uf), table(sexo,uf), count(sexo), count(uf), count(ano), filter(sexo), filter(peso), group_by(uf), arrange(desc), mutate, mutate(baixo_peso), mutate(faixa_idade), mutate(prematuro), select, which, sample, c, mean, sd, library(dplyr), read.csv, clear', type: 'success' },
    'head': { response: '  ID_NASCIMENTO  ANO UF  SEXO IDADE_MAE PESO_GRAMAS SEMANAS_GESTACAO\n1         503207 2023  PA Feminino        26       3054              40\n2         504917 2019  SP Feminino        23       3665              42\n3         505823 2023  RJ Feminino        20         -1              39\n4         500759 2019  SP Feminino        22       3048              36\n5         504900 2021  ZZ Feminino        23       2631              37', type: 'success' },
    'tail': { response: '  ID_NASCIMENTO  ANO UF  SEXO IDADE_MAE PESO_GRAMAS SEMANAS_GESTACAO\n6076      500906 2022  RS Feminino        29       3185              38\n6077      505193 2021  BA Masculino       29       3376              38\n6078      503981 2021  SP Feminino        34       3109              40\n6079      500236 2022  SP Feminino        21       3788              39\n6080      505158 2019  GO Masculino       18       3310              40', type: 'success' },
    'str': { response: "tibble [6,080 × 10] (S3: tbl_df/tbl/data.frame)\n $ ID_NASCIMENTO  : int [1:6080] 503207 504917 505823 ...\n $ ANO            : int [1:6080] 2023 2019 2023 ...\n $ UF             : chr [1:6080] \"PA\" \"SP\" \"RJ\" ...\n $ SEXO           : chr [1:6080] \"f\" \"F\" \"f\" ...\n $ IDADE_MAE      : int [1:6080] 26 23 20 ...\n $ PESO_GRAMAS    : chr [1:6080] \"3054\" \"3665\" \"-1\" ...\n $ SEMANAS_GESTACAO: int [1:6080] 40 42 39 ...\n $ TIPO_PARTO     : int [1:6080] 1 2 1 ...\n $ CONSULTAS_PRENATAL: int [1:6080] 6 8 5 ...\n $ APGAR5         : int [1:6080] 9 10 8 ...", type: 'success' },
    'summary': { response: "  ID_NASCIMENTO       ANO         IDADE_MAE     PESO_GRAMAS  \n Min.   :500001   Min.   :2019   Min.   :10.00   Min.   : 1944  \n 1st Qu.:501497   1st Qu.:2020   1st Qu.:23.00   1st Qu.: 3073  \n Median :502994   Median :2021   Median :27.00   Median : 3332  \n Mean   :502998   Mean   :2021   Mean   :27.14   Mean   : 3330  \n 3rd Qu.:504498   3rd Qu.:2022   3rd Qu.:31.00   3rd Qu.: 3585  \n Max.   :506000   Max.   :2023   Max.   :999.00  Max.   : 4508", type: 'success' },
    'dim': { response: '[1] 6080   10', type: 'success' },
    'names': { response: ` [1] "ID_NASCIMENTO"    "ANO"              "UF"              "SEXO"
 [5] "IDADE_MAE"        "PESO_GRAMAS"      "SEMANAS_GESTACAO" "TIPO_PARTO"
 [9] "CONSULTAS_PRENATAL" "APGAR5"`, type: 'success' },
    'nrow': { response: '[1] 6080', type: 'success' },
    'ncol': { response: '[1] 10', type: 'success' },
    'table(sexo)': { response: '\n  Feminino Masculino \n      2845       3083 ', type: 'success' },
    'table(uf)': { response: '\n 99  AC  AL  AM  AP  BA  CE  DF  ES  GO  MA  MG  MS  MT  PA  PB  PE  PI  PR  RJ  RN  RO  RR  RS  SC  SE  SP  TO  XX  ZZ \n  29  26  80 122  24 420 286  97 113 212 210 598  77 128 238 127 264 105 294 459 122  56  18 328 212  61 1267  41  26  40 ', type: 'success' },
    'count(sexo)': { response: '# A tibble: 3 × 2\n  SEXO           n\n  <chr>      <int>\n1 Feminino    2845\n2 Masculino   3083\n3 Vazio        152', type: 'success' },
    'count(uf)': { response: '# A tibble: 30 × 2\n   UF        n\n   <chr> <int>\n 1 99       29\n 2 AC       26\n 3 AL       80\n 4 AM      122\n 5 AP       24\n 6 BA      420\n 7 CE      286\n 8 DF       97\n ... (+22 rows)', type: 'success' },
    'count(ano)': { response: '# A tibble: 5 × 2\n    ANO     n\n  <int> <int>\n1  2019  1244\n2  2020  1190\n3  2021  1255\n4  2022  1183\n5  2023  1208', type: 'success' },
    'filter(sexo == "Feminino")': { response: '# A tibble: 2,845 × 10\n   ID_NASCIMENTO   ANO UF    SEXO      IDADE_MAE PESO_GRAMAS SEMANAS_GESTACAO\n           <int> <int> <chr> <chr>         <int>       <int>            <int>\n 1        503207  2023 PA    Feminino         26        3054               40\n 2        504917  2019 SP    Feminino         23        3665               42\n 3        505823  2023 RJ    Feminino         20         -1               39\n ...', type: 'success' },
    'filter(peso_gramas > 4000)': { response: '# A tibble: 238 × 10\n   ID_NASCIMENTO   ANO UF    SEXO      IDADE_MAE PESO_GRAMAS SEMANAS_GESTACAO\n           <int> <int> <chr> <chr>         <int>       <int>            <int>\n 1        504762  2023 SP    Masculino        40        4073               37\n 2        503944  2023 RJ    Masculino        17        4073               42\n ...', type: 'success' },
    'group_by(uf) %>% summarise(n = n())': { response: '# A tibble: 30 × 2\n   UF        n\n   <chr> <int>\n 1 99       29\n 2 AC       26\n 3 AL       80\n 4 AM      122\n 5 AP       24\n ...', type: 'success' },
    'arrange(desc(peso_gramas))': { response: '# A tibble: 6,080 × 10\n   ID_NASCIMENTO   ANO UF    SEXO      IDADE_MAE PESO_GRAMAS SEMANAS_GESTACAO\n           <int> <int> <chr> <chr>         <int>       <int>            <int>\n 1        504843  2019 BA    Feminino         32        4508               42\n 2        505579  2021 RJ    Masculino        30        4498               41\n 3        503749  2023 PR    Feminino         28        4487               40\n ...', type: 'success' },
    'glimpse': { response: `Rows: 6,080
Columns: 10
$ ID_NASCIMENTO  <int> 503207, 504917, 505823, 500759, 504900
$ ANO            <int> 2023, 2019, 2023, 2019, 2021
$ UF             <chr> "PA", "SP", "RJ", "SP", "ZZ"
$ SEXO           <chr> "f", "f", "f", "F", "FEMININO"
$ IDADE_MAE      <int> 26, 23, 20, 22, 23
$ PESO_GRAMAS    <chr> "3054", "3665", "-1", "3048", "2631"
$ SEMANAS_GESTACAO <int> 40, 42, 39, 36, 37
$ TIPO_PARTO     <int> 2, 1, 2, 1, 1
$ CONSULTAS_PRENATAL <int> 10, 8, 5, 8, 7
$ APGAR5         <int> 8, 8, 10, 9, 8`, type: 'success' },
    'class': { response: `[1] "data.frame"`, type: 'success' },
    'library(dplyr)': { response: 'Attaching package: \'dplyr\'\nThe following objects are masked from \'package:stats\':\n    filter, lag\nThe following objects are masked from \'package:base\':\n    intersect, setdiff, setequal, union', type: 'success' },
    'read.csv("nascimentos.csv")': { response: '✓ Arquivo carregado com sucesso.\n✓ 6080 registros, 10 colunas importados.', type: 'success' },
    'skim': { response: '── Data Summary ────────────────\n                          Values\nName                       nascimentos\nNumber of rows             6080        \nNumber of columns          10          \n───────────\nColumn type frequency:               \n  character                3           \n  integer                  7           \n───────────\nVariable type: character                          \n  variable     n_missing complete_rate min max n_unique whitespace\n  UF           0         1             2   2   30      0          \n  SEXO         152       0.975         1   10  7       0          \n  PESO_GRAMAS  0         1             1   4   4987    0', type: 'success' },
    'mutate': { response: '> nascimentos <- nascimentos |> mutate(PESO_KG = PESO_GRAMAS / 1000)\n✓ Coluna PESO_KG criada com sucesso.\n> names(nascimentos)\n [1] "ID_NASCIMENTO"    "ANO"              "UF"              "SEXO"\n [5] "IDADE_MAE"        "PESO_GRAMAS"      "PESO_KG"         "SEMANAS_GESTACAO"', type: 'success' },
    'mutate(baixo_peso)': { response: '> nascimentos <- nascimentos |> mutate(BAIXO_PESO = if_else(PESO_GRAMAS < 2500, "Sim", "Nao"))\n✓ Coluna BAIXO_PESO criada.\n> count(nascimentos, BAIXO_PESO)\n# A tibble: 3 × 2\n  BAIXO_PESO     n\n  <chr>      <int>\n1 Nao         5976\n2 Sim          104\n3 NA             0', type: 'success' },
    'mutate(faixa_idade)': { response: '> nascimentos <- nascimentos |> mutate(FAIXA_IDADE = case_when(\n+   IDADE_MAE < 20 ~ "Adolescente",\n+   IDADE_MAE < 35 ~ "Adulta",\n+   TRUE ~ "35 ou mais"\n+ ))\n✓ Coluna FAIXA_IDADE criada.\n> count(nascimentos, FAIXA_IDADE)\n# A tibble: 3 × 2\n  FAIXA_IDADE     n\n  <chr>       <int>\n1 Adulta       4587\n2 Adolescente   766\n3 35 ou mais    727', type: 'success' },
    'mutate(prematuro)': { response: '> nascimentos <- nascimentos |> mutate(PREMATURO = if_else(SEMANAS_GESTACAO < 37, "Sim", "Nao"))\n✓ Coluna PREMATURO criada.\n> count(nascimentos, PREMATURO)\n# A tibble: 2 × 2\n  PREMATURO     n\n  <chr>     <int>\n1 Nao        5456\n2 Sim         624', type: 'success' },
    'select': { response: '> nascimentos |> select(ANO, UF, SEXO, PESO_GRAMAS)\n# A tibble: 6,080 × 4\n    ANO UF    SEXO      PESO_GRAMAS\n  <int> <chr> <chr>           <int>\n1  2023 PA    f                3054\n2  2019 SP    f                3665\n3  2023 RJ    f                  -1\n4  2019 SP    F                3048\n5  2021 ZZ    FEMININO         2631\n# ℹ 6,075 more rows', type: 'success' },
    'which(peso_gramas < 0)': { response: '[1]    3   60  135  235  389  636  648  688  692  876', type: 'success' },
    'sample(1:10, 5)': { response: '[1]  3  7  1  9  4', type: 'success' },
    'c(1,2,3,4,5)': { response: '[1] 1 2 3 4 5', type: 'success' },
    'mean(peso_gramas, na.rm = TRUE)': { response: '[1] 3330.18', type: 'success' },
    'sd(peso_gramas, na.rm = TRUE)': { response: '[1] 384.47', type: 'success' },
    'table(sexo, uf)': { response: '            UF\nSEXO         99  AC  AL  AM  AP  BA  CE  DF  ES  GO  MA  MG  MS  MT  PA  PB  PE  PI  PR  RJ  RN  RO  RR  RS  SC  SE  SP  TO  XX  ZZ\n  Feminino   16  11  32  70  13 187 103  54  51  96 101 286  39  54 114  61 131  50 134 215  68  22  11 160  96  31 593  17  10  19\n  Masculino  11  15  44  51  10 221 173  41  58 110 107 295  38  73 119  63 123  53 154 233  54  32   6 156 109  25 649  23  16  21', type: 'success' },
    'clear': { response: 'CLEAR', type: 'success' },
  };

  const sqlCommands: Record<string, { response: string; type: 'success' | 'error' }> = {
    'help': { response: 'SQL: select, from, where, group by, having, order by, join, limit, insert, create table, update, delete, alter, drop, count, avg, sum, min, max, between, like, in, is null, as, select count, select *, select top 5, select top 10, where uf, where peso, where idade, where between, group by uf/ano/sexo/regiao, having cesarea, having baixo peso, order by peso/idade, limit 10, count by year, avg peso by uf, min peso, max peso, sum nascimentos, insert into, alter table, drop table, as alias, clear', type: 'success' },
    'select': { response: 'SELECT * FROM nascimentos LIMIT 5;\n\nID_NASCIMENTO | ANO | UF | SEXO     | IDADE_MAE | PESO_GRAMAS\n--------------+-----+----+----------+-----------+------------\n       503207 | 2023 | PA | Feminino |        26 |        3054\n       504917 | 2019 | SP | Feminino |        23 |        3665\n       505823 | 2023 | RJ | Feminino |        20 |         -1\n       500759 | 2019 | SP | Feminino |        22 |        3048\n       504900 | 2021 | ZZ | Feminino |        23 |        2631', type: 'success' },
    'from': { response: 'FROM nascimentos\n-- Tabela principal com 6.080 registros\n-- Colunas: ID_NASCIMENTO, ANO, UF, SEXO, IDADE_MAE, PESO_GRAMAS, SEMANAS_GESTACAO, TIPO_PARTO, CONSULTAS_PRENATAL, APGAR5', type: 'success' },
    'where': { response: 'WHERE PESO_GRAMAS < 2500\n-- Exemplo: filtrar bebês com baixo peso ao nascer\n-- Resultado: 104 registros', type: 'success' },
    'group by': { response: 'GROUP BY UF\n-- Agrupar dados por Unidade Federativa\n-- 27 UFs + DF = 28 grupos', type: 'success' },
    'having': { response: 'HAVING COUNT(*) > 100\n-- Filtrar grupos com mais de 100 registros\n-- Usado após GROUP BY', type: 'success' },
    'order by': { response: 'ORDER BY PESO_GRAMAS DESC\n-- Ordenar do maior para o menor peso\n-- Alternativa: ASC para crescente', type: 'success' },
    'join': { response: 'INNER JOIN uf_ref ON nascimentos.UF = uf_ref.UF\n-- Juntar tabelas pela coluna UF\n-- nascimentos (tabela-fato) + uf_ref (dimensão)', type: 'success' },
    'limit': { response: 'LIMIT 10\n-- Retornar apenas 10 registros\n-- Útil para pré-visualização', type: 'success' },
    'insert': { response: 'INSERT INTO nascimentos (ID_NASCIMENTO, ANO, UF, SEXO)\nVALUES (999999, 2024, \'SP\', \'Feminino\');\n-- Inserir novo registro', type: 'success' },
    'create table': { response: 'CREATE TABLE nascimentos (\n  ID_NASCIMENTO INT PRIMARY KEY,\n  ANO INT,\n  UF VARCHAR(2),\n  SEXO VARCHAR(10)\n);\n-- Criar nova tabela', type: 'success' },
    'update': { response: 'UPDATE nascimentos\nSET SEXO = \'Feminino\'\nWHERE SEXO = \'f\';\n-- Atualizar registros', type: 'success' },
    'delete': { response: 'DELETE FROM nascimentos\nWHERE PESO_GRAMAS < 0;\n-- Remover registros inválidos', type: 'success' },
    'alter': { response: 'ALTER TABLE nascimentos\nADD COLUMN REGIAO VARCHAR(20);\n-- Adicionar nova coluna', type: 'success' },
    'drop': { response: 'DROP TABLE IF EXISTS temp_table;\n-- Remover tabela', type: 'success' },
    'count': { response: 'SELECT COUNT(*) AS total FROM nascimentos;\n\n total \n-------\n  6080', type: 'success' },
    'avg': { response: 'SELECT AVG(PESO_GRAMAS) AS peso_medio FROM nascimentos;\n\n peso_medio \n------------\n     3330.18', type: 'success' },
    'sum': { response: 'SELECT SUM(PESO_GRAMAS) AS peso_total FROM nascimentos;\n\n peso_total \n------------\n    19638071', type: 'success' },
    'min': { response: 'SELECT MIN(PESO_GRAMAS) AS peso_minimo FROM nascimentos;\n\n peso_minimo \n------------\n        1944', type: 'success' },
    'max': { response: 'SELECT MAX(PESO_GRAMAS) AS peso_maximo FROM nascimentos;\n\n peso_maximo \n------------\n        4508', type: 'success' },
    'between': { response: 'SELECT COUNT(*) FROM nascimentos\nWHERE IDADE_MAE BETWEEN 20 AND 34;\n\n-- Filtrar valores em um intervalo\n-- Resultado: 4.587 registros', type: 'success' },
    'like': { response: 'SELECT UF, COUNT(*) FROM nascimentos\nWHERE UF LIKE \'S%\'\nGROUP BY UF;\n-- Filtrar por padrão de texto\n-- SC, SE, SP', type: 'success' },
    'in': { response: 'SELECT COUNT(*) FROM nascimentos\nWHERE UF IN (\'SP\', \'RJ\', \'MG\');\n-- Filtrar por lista de valores\n-- Resultado: 1.400 registros', type: 'success' },
    'is null': { response: 'SELECT COUNT(*) FROM nascimentos\nWHERE PESO_GRAMAS IS NULL;\n-- Verificar valores nulos\n-- Resultado: 45 registros', type: 'success' },
    'as': { response: 'SELECT UF AS estado, COUNT(*) AS total\nFROM nascimentos GROUP BY UF;\n-- Criar apelido para colunas/tabelas', type: 'success' },
    'select count': { response: 'SELECT COUNT(*) AS total FROM nascimentos;\n\n total \n-------\n  6080', type: 'success' },
    'select *': { response: 'SELECT * FROM nascimentos LIMIT 5;\n\n ID_NASCIMENTO | ANO | UF | SEXO     | IDADE_MAE | PESO_GRAMAS | SEMANAS | TIPO_PARTO\n---------------+-----+----+----------+-----------+-------------+---------+-----------\n        503207 | 2023 | PA | Feminino |        26 |        3054 |      40 |         2\n        504917 | 2019 | SP | Feminino |        23 |        3665 |      42 |         1\n        505823 | 2023 | RJ | Feminino |        20 |         -1 |      39 |         2\n        500759 | 2019 | SP | Feminino |        22 |        3048 |      36 |         1\n        504900 | 2021 | ZZ | Feminino |        23 |        2631 |      37 |         1', type: 'success' },
    'select top 5': { response: 'SELECT ID_NASCIMENTO, ANO, UF, PESO_GRAMAS FROM nascimentos ORDER BY PESO_GRAMAS ASC LIMIT 5;\n\n ID_NASCIMENTO | ANO | UF | PESO_GRAMAS\n---------------+-----+----+------------\n        505823 | 2023 | RJ |        1944\n        503207 | 2023 | PA |        2156\n        504917 | 2019 | SP |        2234\n        500759 | 2019 | SP |        2289\n        504900 | 2021 | ZZ |        2312', type: 'success' },
    'select top 10': { response: 'SELECT * FROM nascimentos WHERE SEMANAS_GESTACAO < 37 ORDER BY PESO_GRAMAS ASC LIMIT 10;\n\n ANO | UF | IDADE_MAE | PESO_GRAMAS | SEMANAS\n-----+----+-----------+-------------+--------\n 2023 | RJ |        20 |        1944 |     36\n 2023 | PA |        26 |        2156 |     35\n 2019 | SP |        23 |        2234 |     34\n 2019 | SP |        22 |        2289 |     36\n 2021 | ZZ |        23 |        2312 |     35\n 2022 | CE |        24 |        2345 |     36\n 2023 | BA |        28 |        2378 |     34\n 2020 | PE |        29 |        2401 |     35\n 2021 | MG |        31 |        2423 |     36\n 2022 | RJ |        17 |        2456 |     33', type: 'success' },
    'where uf = "SP"': { response: 'SELECT COUNT(*) AS n_SP FROM nascimentos WHERE UF = \'SP\';\n\n n_SP \n------\n  1267', type: 'success' },
    'where peso < 2500': { response: 'SELECT COUNT(*) AS baixo_peso FROM nascimentos WHERE PESO_GRAMAS < 2500;\n\n baixo_peso \n-----------\n       104', type: 'success' },
    'where idade < 20': { response: 'SELECT COUNT(*) AS adolescentes FROM nascimentos WHERE IDADE_MAE < 20;\n\n adolescentes \n-------------\n         766', type: 'success' },
    'where between': { response: 'SELECT COUNT(*) AS n FROM nascimentos WHERE IDADE_MAE BETWEEN 20 AND 34;\n\n n \n-------\n 4587', type: 'success' },
    'group by uf': { response: "SELECT UF, COUNT(*) AS n FROM nascimentos GROUP BY UF ORDER BY n DESC;\n\n UF  |  n\n-----+----\n SP  | 1267\n MG  |  598\n RJ  |  459\n BA  |  420\n RS  |  328\n PR  |  294\n CE  |  286\n PE  |  264\n ...", type: 'success' },
    'group by ano': { response: "SELECT ANO, COUNT(*) AS n FROM nascimentos GROUP BY ANO;\n\n ANO |  n\n-----+----\n 2019 | 1244\n 2020 | 1190\n 2021 | 1255\n 2022 | 1183\n 2023 | 1208", type: 'success' },
    'group by sexo': { response: "SELECT SEXO, COUNT(*) AS n FROM nascimentos GROUP BY SEXO;\n\n SEXO      |  n\n-----------+----\n Feminino  | 2845\n Masculino | 3083\n Vazio     |  152", type: 'success' },
    'group by regiao': { response: "SELECT r.REGIAO, COUNT(*) AS n\nFROM nascimentos AS n_\nINNER JOIN uf_ref AS r ON n_.UF = r.UF\nGROUP BY r.REGIAO\nORDER BY n DESC;\n\n REGIAO       | n\n--------------+----\n Sudeste      | 2437\n Nordeste     | 1675\n Sul          |  834\n Norte        |  525\n Centro-Oeste |  514", type: 'success' },
    'having cesarea': { response: "SELECT UF, COUNT(*) AS n,\n  ROUND(AVG(CASE WHEN TIPO_PARTO=2 THEN 1.0 ELSE 0 END)*100,1) AS pct\nFROM nascimentos\nGROUP BY UF\nHAVING n > 100\nORDER BY pct DESC;\n\n UF  |  n   |  pct\n-----+------+------\n CE  |  286 | 60.1\n GO  |  212 | 59.4\n SC  |  212 | 59.4\n MG  |  598 | 58.7\n RS  |  328 | 57.6\n PE  |  264 | 56.1\n SP  | 1267 | 54.9\n PR  |  294 | 54.1", type: 'success' },
    'having baixo peso': { response: "SELECT UF, COUNT(*) AS n,\n  ROUND(AVG(CASE WHEN PESO_GRAMAS < 2500 THEN 1.0 ELSE 0 END)*100,1) AS pct_baixo\nFROM nascimentos\nGROUP BY UF\nHAVING n > 50\nORDER BY pct_baixo DESC;\n\n UF  |  n  | pct_baixo\n-----+-----+----------\n AM  | 122 |      2.5\n PA  | 238 |      2.5\n CE  | 286 |      1.7\n BA  | 420 |      1.4\n RO  |  56 |      0.0", type: 'success' },
    'order by peso': { response: 'SELECT ID_NASCIMENTO, ANO, UF, PESO_GRAMAS FROM nascimentos ORDER BY PESO_GRAMAS DESC LIMIT 5;\n\n ID_NASCIMENTO | ANO | UF | PESO_GRAMAS\n---------------+-----+----+------------\n        504843 | 2019 | BA |        4508\n        505579 | 2021 | RJ |        4498\n        503749 | 2023 | PR |        4487\n        504043 | 2022 | BA |        4475\n        502314 | 2019 | RJ |        4462', type: 'success' },
    'order by idade': { response: 'SELECT ID_NASCIMENTO, ANO, UF, IDADE_MAE FROM nascimentos ORDER BY IDADE_MAE DESC LIMIT 5;\n\n ID_NASCIMENTO | ANO | UF | IDADE_MAE\n---------------+-----+----+----------\n        505579 | 2021 | RJ |       999\n        503749 | 2023 | PR |       999\n        504843 | 2019 | BA |       999\n        504043 | 2022 | BA |       999\n        502314 | 2019 | RJ |       999', type: 'success' },
    'limit 10': { response: 'SELECT * FROM nascimentos LIMIT 10;\n✓ 10 registros retornados.', type: 'success' },
    'count by year': { response: "SELECT ANO, COUNT(*) AS nascimento FROM nascimentos GROUP BY ANO ORDER BY ANO;\n\n ANO | nascimento\n-----+------------\n 2019 |       1244\n 2020 |       1190\n 2021 |       1255\n 2022 |       1183\n 2023 |       1208", type: 'success' },
    'avg peso by uf': { response: "SELECT UF, ROUND(AVG(PESO_GRAMAS),0) AS peso_medio FROM nascimentos GROUP BY UF ORDER BY peso_medio DESC;\n\n UF  | peso_medio\n-----+------------\n TO  |       3371\n PB  |       3361\n DF  |       3361\n PE  |       3359\n BA  |       3351\n PR  |       3350\n PA  |       3347\n RN  |       3342", type: 'success' },
    'min peso': { response: 'SELECT MIN(PESO_GRAMAS) AS peso_minimo FROM nascimentos;\n\n peso_minimo \n------------\n        1944', type: 'success' },
    'max peso': { response: 'SELECT MAX(PESO_GRAMAS) AS peso_maximo FROM nascimentos;\n\n peso_maximo \n------------\n        4508', type: 'success' },
    'sum nascimentos': { response: 'SELECT SUM(CASE WHEN SEXO=\'Feminino\' THEN 1 ELSE 0 END) AS feminino,\n       SUM(CASE WHEN SEXO=\'Masculino\' THEN 1 ELSE 0 END) AS masculino\nFROM nascimentos;\n\n feminino | masculino\n----------+----------\n     2845 |      3083', type: 'success' },
    'insert into': { response: 'INSERT INTO nascimentos (ID_NASCIMENTO, ANO, UF, SEXO, IDADE_MAE) VALUES (999999, 2024, \'SP\', \'Feminino\', 25);\n✓ 1 registro inserido com sucesso.', type: 'success' },
    'alter table': { response: 'ALTER TABLE nascimentos ADD COLUMN REGIAO VARCHAR(20);\n✓ Coluna REGIAO adicionada com sucesso.', type: 'success' },
    'drop table': { response: 'DROP TABLE IF EXISTS temp_table;\n✓ Tabela temp_table removida.', type: 'success' },
    'as alias': { response: "SELECT UF AS estado, COUNT(*) AS total FROM nascimentos GROUP BY UF LIMIT 3;\n\n estado | total\n--------+------\n 99     |    29\n AC     |    26\n AL     |    80", type: 'success' },
    'clear': { response: 'CLEAR', type: 'success' },
  };

  const cmdCommands: Record<string, { response: string; type: 'success' | 'error' }> = {
    'help': { response: 'CMD: dir, dir src, cd src, cd .., mkdir, rmdir, type package.json, type .gitignore, echo, echo %date%, echo %time%, ver, whoami, hostname, date, time, cls, ipconfig, ping localhost, tree, rscript, python, node -v, npm -v, git status, git log, tasklist, systeminfo, copy, move, del, ren, path, set, find, rmdir /s, clear', type: 'success' },
    'dir': { response: ' Volume in drive C is OS\n Directory of C:\\Users\\Manoel\\data-base-analysis\n\n19/07/2026  10:30    <DIR>          .\n19/07/2026  10:30    <DIR>          ..\n19/07/2026  10:30    <DIR>          src\n19/07/2026  10:30    <DIR>          public\n19/07/2026  10:30    <DIR>          dist\n19/07/2026  10:30    <DIR>          node_modules\n19/07/2026  10:30           456 package.json\n19/07/2026  10:30         6.080 nascimentos.csv\n19/07/2026  10:30            28 uf_referencia.csv\n19/07/2026  10:30         1.234 tsconfig.json\n19/07/2026  10:30           890 vite.config.ts\n               8 arquivo(s)         8.758 bytes\n               6 pasta(s)  125.829.120 bytes disponíveis', type: 'success' },
    'dir src': { response: ' Directory of C:\\Users\\Manoel\\data-base-analysis\\src\n\n19/07/2026  10:30    <DIR>          .\n19/07/2026  10:30    <DIR>          components\n19/07/2026  10:30    <DIR>          data\n19/07/2026  10:30    <DIR>          hooks\n19/07/2026  10:30    <DIR>          styles\n19/07/2026  10:30           890 App.tsx\n19/07/2026  10:30           456 main.tsx\n19/07/2026  10:30         2.340 i18n.ts\n               3 arquivo(s)          3.686 bytes\n               5 pasta(s)  125.829.120 bytes disponíveis', type: 'success' },
    'cd src': { response: 'C:\\Users\\Manoel\\data-base-analysis\\src>', type: 'success' },
    'cd ..': { response: 'C:\\Users\\Manoel\\data-base-analysis>', type: 'success' },
    'mkdir test': { response: '✓ Diretório "test" criado com sucesso.', type: 'success' },
    'rmdir test': { response: '✓ Diretório "test" removido com sucesso.', type: 'success' },
    'type package.json': { response: '{\n  "name": "data-base-analysis",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc -b && vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^19.2.6",\n    "framer-motion": "^12.40.0"\n  }\n}', type: 'success' },
    'type .gitignore': { response: '# Logs\nlogs\n*.log\nnpm-debug.log*\n\n# Dependencies\nnode_modules/\n\n# Build\ndist/\ndist-ssr/\n*.local\n\n# Editor\n.vscode/*\n!.vscode/extensions.json\n.idea', type: 'success' },
    'echo hello': { response: 'hello', type: 'success' },
    'echo %date%': { response: '19/07/2026', type: 'success' },
    'echo %time%': { response: '10:30:45.12', type: 'success' },
    'ver': { response: 'Microsoft Windows [Versão 10.0.22631.3880]', type: 'success' },
    'whoami': { response: 'desktop-manoel\\manoel', type: 'success' },
    'hostname': { response: 'DESKTOP-MANOEL', type: 'success' },
    'date': { response: 'A data atual é: 19/07/2026', type: 'success' },
    'time': { response: 'A hora atual é: 10:30:45.12', type: 'success' },
    'cls': { response: 'CLEAR', type: 'success' },
    'ipconfig': { response: '\nConfiguração de Rede Ethernet:\n\n   Sufixo DNS Specifico de Conexão: .\n   Endereço IPv4. . . . . . . . . . . : 192.168.1.100\n   Máscara de Sub-rede . . . . . . . : 255.255.255.0\n   Gateway Padrão . . . . . . . . . . : 192.168.1.1', type: 'success' },
    'ping localhost': { response: '\nDisparando localhost [127.0.0.1] com 32 bytes de dados:\nResposta de 127.0.0.1: bytes=32 tempo<1ms TTL=128\nResposta de 127.0.0.1: bytes=32 tempo<1ms TTL=128\nResposta de 127.0.0.1: bytes=32 tempo<1ms TTL=128\nResposta de 127.0.0.1: bytes=32 tempo<1ms TTL=128\n\nEstatísticas do Ping para 127.0.0.1:\n    Pacotes: Enviados = 4, Recebidos = 4, Perdidos = 0 (0% de perda)', type: 'success' },
    'tree': { response: 'C:\\Users\\Manoel\\data-base-analysis\n├── src\n│   ├── components\n│   │   ├── About\n│   │   ├── Dashboard\n│   │   ├── Footer\n│   │   ├── Hero\n│   │   ├── Navbar\n│   │   ├── Projects\n│   │   └── Skills\n│   ├── data\n│   ├── hooks\n│   └── styles\n├── public\n├── dist\n├── package.json\n├── tsconfig.json\n└── vite.config.ts', type: 'success' },
    'rscript': { response: '> library(dplyr)\n> nascimentos <- read.csv("nascimentos.csv")\n> cat("Linhas:", nrow(nascimentos), "\\n")\nLinhas: 6080\n> cat("Colunas:", ncol(nascimentos), "\\n")\nColunas: 10\n✓ Script executado com sucesso.', type: 'success' },
    'python': { response: 'Python 3.11.5 (main, Sep 11 2023, 13:54:46) [MSC v.1929 64 bit (AMD64)]\n>>> import pandas as pd\n>>> df = pd.read_csv("nascimentos.csv")\n>>> print(f"Shape: {df.shape}")\nShape: (6080, 10)\n✓ Script executado com sucesso.', type: 'success' },
    'node -v': { response: 'v20.10.0', type: 'success' },
    'npm -v': { response: '10.2.3', type: 'success' },
    'git status': { response: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  modified:   src/components/Dashboard/DashboardEnhanced.tsx\n  modified:   src/components/Footer/Footer.tsx\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n  src/test/', type: 'success' },
    'git log --oneline -5': { response: 'a1b2c3d feat: add advanced filters\nb2c3d4e fix: cross-filtering logic\nc3d4e5f feat: add age range selector\nd4e5f6g style: improve footer borders\ne5f6g7h feat: add more insights', type: 'success' },
    'tasklist': { response: '\nNome da Imagem           PID Nome da Sessão    Uso de Memória\n========================= ==== ================ ============\nSystem                      4 Console                 132 K\nsvchost.exe                88 Console              32.456 K\nnode.exe                  123 Console             125.892 K\ndevenv.exe                456 Console             234.567 K\nchrome.exe                789 Console             456.789 K', type: 'success' },
    'systeminfo': { response: '\nNome do Sistema Operacional:  Microsoft Windows 11 Pro\nVersão:                        10.0.22631 Compilação 22631\nFabricante:                     Microsoft Corporation\nTipo de Sistema:                x64-based PC\nProcessador(es):                1 Processador(es) instalado(s).\n                                Intel64 Family 6 Model 142 ~1.80 GHz\nMemória Física Total:           16.384 MB\nMemória Física Disponível:      8.192 MB', type: 'success' },
    'copy nascimentos.csv backup.csv': { response: '        1 arquivo(s) copiado(s).', type: 'success' },
    'move backup.csv temp/': { response: '        1 arquivo(s) movido(s).', type: 'success' },
    'del temp/backup.csv': { response: '        1 arquivo(s) deletado(s).', type: 'success' },
    'ren old.txt new.txt': { response: '        1 arquivo(s) renomeado(s).', type: 'success' },
    'path': { response: 'PATH=C:\\Windows\\system32;C:\\Windows;C:\\Program Files\\nodejs\\;C:\\Users\\Manoel\\AppData\\Local\\Programs\\Python\\Python311\\', type: 'success' },
    'set': { response: 'HOMEDRIVE=C:\nHOMEPATH=\\Users\\Manoel\nPATH=C:\\Windows\\system32;C:\\Windows\nPROMPT=$P$G\nSYSTEMROOT=C:\\Windows\nTEMP=C:\\Users\\Manoel\\AppData\\Local\\Temp', type: 'success' },
    'find /c nascimento nascimentos.csv': { response: '---------- NASCIMENTOS.CSV: 6081', type: 'success' },
    'rmdir /s temp': { response: 'temp, Você tem certeza (S/N)? S\n✓ Diretório "temp" e todo o seu conteúdo removidos.', type: 'success' },
    'clear': { response: 'CLEAR', type: 'success' },
  };

  const getCommands = () => {
    switch (activeShell) {
      case 'r': return rCommands;
      case 'sql': return sqlCommands;
      case 'cmd': return cmdCommands;
      default: return rCommands;
    }
  };

  const getPrompt = () => {
    switch (activeShell) {
      case 'r': return 'R > ';
      case 'sql': return 'SQL > ';
      case 'cmd': return 'C:\\> ';
      default: return '> ';
    }
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const commands = getCommands();

    setTerminalHistory(prev => [...prev, { type: 'input', text: `${getPrompt()}${cmd}` }]);

    if (trimmedCmd === 'clear' || trimmedCmd === 'cls') {
      setTerminalHistory([]);
      setCurrentInput('');
      focusInput();
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const command = commands[trimmedCmd];

      if (command) {
        const lines = command.response.split('\n');
        lines.forEach((line, index) => {
          setTimeout(() => {
            setTerminalHistory(prev => [...prev, { type: command.type, text: line }]);
          }, index * 80);
        });
      } else {
        setTerminalHistory(prev => [...prev, {
          type: 'error',
          text: `✗ Comando não encontrado: "${cmd}". Digite "help" para ajuda.`
        }]);
      }

      setIsProcessing(false);
      focusInput();
    }, 200);

    setCurrentInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentInput.trim() && !isProcessing) {
      handleCommand(currentInput);
    }
  };

  const switchShell = (shell: ShellType) => {
    setActiveShell(shell);
    setTerminalHistory([
      { type: 'info', text: `> Shell alterado para: ${shell.toUpperCase()}` },
      { type: 'info', text: '> Digite "help" para ver os comandos disponíveis.' },
    ]);
    setCurrentInput('');
  };

  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer-content">
          <motion.div
            className="footer-info"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="footer-title">{t('footer.title')}</h2>
            <p className="footer-desc">
              {t('footer.description')}
            </p>

            <p className="footer-author-credit">{authorLabels[currentLang] || authorLabels['pt']}</p>

            <div className="footer-social-icons">
              <motion.a
                href="https://github.com/manoelja/data-base-analysis"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                whileHover={{ scale: 1.1, backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent-color)' }}
              >
                <Github size={20} />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/manoel-ara%C3%BAjo-79b62239b"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                whileHover={{ scale: 1.1, backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent-color)' }}
              >
                <Linkedin size={20} />
              </motion.a>
              <motion.a
                href="https://portfolio-manoelja.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                whileHover={{ scale: 1.1, backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent-color)' }}
              >
                <img src="/favicon_portfolio.svg" alt="Portfolio" width="20" height="20" />
              </motion.a>
              <motion.button
                className="social-icon-btn"
                onClick={() => setShowAbout(!showAbout)}
                whileHover={{ scale: 1.1, backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent-color)' }}
              >
                <User size={20} />
              </motion.button>
            </div>

            <AnimatePresence>
              {showAbout && (
                <motion.div
                  className="developer-about-card"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="developer-about-header">
                    <h4>{aboutTitles[currentLang] || aboutTitles['pt']}</h4>
                    <button className="close-about-btn" onClick={() => setShowAbout(false)}>
                      <X size={16} />
                    </button>
                  </div>
                  <p className="developer-about-text">
                    {aboutTexts[currentLang] || aboutTexts['pt']}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="footer-terminal"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="terminal-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
              <span className="terminal-label">DATA_CHANNEL.SH</span>
            </div>

            <div className="shell-selector">
              <button
                className={`shell-btn ${activeShell === 'r' ? 'active' : ''}`}
                onClick={() => switchShell('r')}
              >
                <Command size={14} /> R
              </button>
              <button
                className={`shell-btn ${activeShell === 'sql' ? 'active' : ''}`}
                onClick={() => switchShell('sql')}
              >
                <Terminal size={14} /> SQL
              </button>
              <button
                className={`shell-btn ${activeShell === 'cmd' ? 'active' : ''}`}
                onClick={() => switchShell('cmd')}
              >
                <Code size={14} /> CMD
              </button>
            </div>

            <div className="terminal-content" onClick={() => inputRef.current?.focus()}>
              {terminalHistory.map((line, index) => (
                <div key={index} className={`terminal-line terminal-${line.type}`}>
                  {line.text}
                </div>
              ))}
              <div className="terminal-input-line">
                <span className="terminal-prompt">{getPrompt()}</span>
                <input
                  ref={inputRef}
                  type="text"
                  className="terminal-input"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder={isProcessing ? 'processando...' : 'digite um comando...'}
                />
                {!isProcessing && <span className="terminal-cursor"></span>}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-content container">
          <p className="footer-copyright-text">{copyrightTexts[currentLang] || copyrightTexts['pt']}</p>
        </div>
      </div>
    </footer>
  );
}
