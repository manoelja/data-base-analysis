### O que é

Projeto que corrige e analisa dados de nascidos vivos do Brasil (SINASC/DataSUS, 2019–2023) com R, SQL e SQLite.

### O que foi feito

- Diagnóstico: valores vazios, peso como texto e sexo grafado de formas diferentes
- Limpeza: sexo padronizado, peso virou número, idades de 10 a 55, sem siglas inválidas
- Novas colunas: baixo peso, prematuro, faixa etária e tipo de parto em palavras
- Removidos 570 registros (9,4%) — restaram 5.510 limpos

### Resultados

- Norte com mais cesáreas; Centro-Oeste com mais prematuridade
- Consultas em SQL e em R deram os mesmos resultados

### Para saber mais

Documento completo com código em R: data-base-analysis.Rmd.
