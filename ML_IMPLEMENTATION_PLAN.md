# Plano de Machine Learning — em linguagem simples

> **Projeto:** Data Base Analysis — Nascidos Vivos Brasileiros (SINASC/DataSUS 2019–2023)
> **Status:** **Implementado ✓** — a modelagem e o dashboard foram concluídos. Este documento explica o plano, o método e os resultados finais.
> **Base de dados:** 5.510 registros limpos

---

## O que este documento explica

Machine Learning (ou aprendizado de máquina) é a forma de **ensinar o computador a encontrar padrões nos dados e fazer previsões**, sem que alguém escreva as regras na mão. Este documento explica, sem palavras difíceis, o que foi feito na parte de Machine Learning deste projeto.

---

## 1. O problema que queremos resolver

Usando os registros de nascimentos, queremos que o computador responda perguntas como:

1. **O bebê vai nascer com peso baixo?** (menos de 2.500g) — a pergunta principal
2. **O bebê vai nascer antes da hora?** (antes das 37 semanas)
3. Quanto o bebê vai pesar, em média?
4. (Opcional) O parto será normal ou cesárea?
5. (Opcional) Agrupar estados parecidos entre si

Para "treinar" o computador, mostramos a ele exemplos de casos já conhecidos, junto com as informações disponíveis (idade da mãe, número de consultas de pré-natal, região, ano, tipo de parto etc.). Assim ele aprende o que esses dados têm a ver com o resultado.

## 2. Regras importantes (para não "trapacear")

Existe uma regra de ouro: **não podemos dar a resposta de presente para o computador**.

- Para prever **baixo peso**, não podemos usar o próprio peso do bebê como informação — senão o modelo "cola" na resposta.
- Para prever **prematuridade**, não podemos usar as semanas de gestação (que é justamente o que define a prematuridade).

Essas regras foram verificadas automaticamente no código, para garantir que os resultados são honestos.

## 3. Os modelos testados (e quem ganhou)

Testamos 4 formas diferentes de o computador aprender, do mais simples ao mais sofisticado:

1. **Dummy** — o "chute" básico: sempre responder a resposta mais comum. Serve só como base de comparação.
2. **Regressão Logística** — um modelo simples e fácil de entender, que calcula a probabilidade de um evento acontecer.
3. **Random Forest** — um "time" de árvores de decisão que vota no resultado final.
4. **XGBoost** — um modelo avançado e muito poderoso, geralmente o favorito quando os dados vêm em tabelas.

**Resultado:** o modelo mais simples — a **Regressão Logística** — foi o vencedor nas duas tarefas principais! Isso é ótimo: além de ser fácil de entender, ele roda direto no navegador, sem precisar de servidor.

## 4. Como sabemos se o modelo funciona?

Para não sermos enganados pelo acaso, usamos a **validação cruzada**: dividimos os dados em 5 partes; o modelo treina com 4 partes e é testado na 5ª, repetindo isso 5 vezes. As métricas usadas foram:

- **ROC-AUC e PR-AUC** — notas que avaliam a qualidade das previsões (quanto maior, melhor; importantes porque o problema de baixo peso é raro, cerca de 1,8% dos casos).
- **Sensibilidade** — a capacidade de encontrar os casos de risco.
- **Especificidade** — a capacidade de não errar nos casos seguros.

Também escolhemos um **ponto de corte** (limiar) que equilibra esses dois erros — uma técnica clássica chamada regra de Youden.

## 5. Entendendo o que o modelo aprendeu (SHAP)

O SHAP é uma ferramenta que mostra **quais fatores mais influenciam o risco**. O que descobrimos:

- Mães muito novas (adolescentes) ou com 35 anos ou mais têm **mais risco** de bebê de baixo peso.
- Mais consultas de pré-natal **diminuem o risco** (o pré-natal protege).

## 6. Calculadora de risco no site

Como o modelo vencedor é simples, exportamos apenas os números dele (os coeficientes) para o site. Assim, a calculadora de risco funciona **na hora, no navegador** — os dados de quem usa o site não saem da máquina, e não é preciso rodar nenhum modelo em servidor.

## 7. Projeções 2024–2025

Também projetamos quantos nascimentos devem ocorrer em 2024 e 2025:

- **Método:** olhamos a tendência dos anos anteriores e a participação (%) de cada região, faixa etária e sexo, e projetamos o futuro com uma faixa de valores prováveis (intervalo de 95%).
- **Validação honesta:** testamos o método com o ano de 2023 (que já conhecemos). O erro no total foi de apenas **−2,0%**.
- **Destaques:** a participação da região **Norte** está caindo de forma estatisticamente significativa; a participação de mães com **35 anos ou mais** também está caindo (quase significativa).

## 8. Qualidade e testes

- **95 testes automatizados** passando (matemática dos modelos e projeções).
- Build e lint (verificações de código) sem erros.
- Os detalhes técnicos completos (fórmulas, números e arquivos) estão nos documentos técnicos do repositório (`ml/`).

## 9. Riscos (e o que fizemos para evitá-los)

| Risco | O que fizemos |
|:--|:--|
| Poucos dados (5.510 registros) | Validação cruzada e modelos simples, para não "decorar" os dados |
| Problema raro (1,8% de baixo peso) | Métricas próprias para casos raros (PR-AUC) e pesos balanceados |
| "Trapaça" (vazamento de dados) | Regras da seção 2, verificadas automaticamente no código |
| Errar por causa de uma única divisão dos dados | Aumento de dados sintéticos (SMOTE) aplicado apenas dentro de cada rodada da validação cruzada |

---

## Resumo em uma frase

**Ensinamos o computador a prever o risco de baixo peso ao nascer usando os dados do projeto — e o modelo mais simples venceu, o que permite que a calculadora funcione direto no navegador, de graça e sem enviar dados para lugar nenhum.**
