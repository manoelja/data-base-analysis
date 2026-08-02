import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle, BrainCircuit, CheckCircle2, Gauge, Info, Sliders, TrendingUp,
} from 'lucide-react';
import {
  lrBaixoPeso, modelComparison, rocCurves, shapImportance,
  type MlrTask, type ShapItem, type ModelMetrics, type RocCurve,
} from '../../data/ml';
import {
  ANOS, impactPotential, predict, REGIOES,
  type CalculatorInput, type Sexo,
} from './predictModel';
import Forecast from './Forecast';
import './Predictive.css';

const featureLabels: Record<string, Record<string, string>> = {
  IDADE_MAE: { pt: 'Idade da mãe', en: "Mother's age", es: 'Edad de la madre' },
  CONSULTAS_PRENATAL: { pt: 'Consultas pré-natal', en: 'Prenatal visits', es: 'Consultas prenatales' },
  SEMANAS_GESTACAO: { pt: 'Semanas de gestação', en: 'Gestational weeks', es: 'Semanas de gestación' },
  ANO: { pt: 'Ano', en: 'Year', es: 'Año' },
  SEXO_Feminino: { pt: 'Sexo feminino', en: 'Female sex', es: 'Sexo femenino' },
  SEXO_Masculino: { pt: 'Sexo masculino', en: 'Male sex', es: 'Sexo masculino' },
  REGIAO_Centro_Oeste: { pt: 'Região Centro-Oeste', en: 'Midwest region', es: 'Región Centro-Oeste' },
  REGIAO_Nordeste: { pt: 'Região Nordeste', en: 'Northeast region', es: 'Región Nordeste' },
  REGIAO_Norte: { pt: 'Região Norte', en: 'North region', es: 'Región Norte' },
  REGIAO_Sudeste: { pt: 'Região Sudeste', en: 'Southeast region', es: 'Región Sudeste' },
  REGIAO_Sul: { pt: 'Região Sul', en: 'South region', es: 'Región Sur' },
};

const MODEL_COLORS = ['#71717a', '#ff6b9d', '#b48cff', '#7dd3fc'];

// "±X.X p.p." = máximo |Δ| em pontos percentuais alterando apenas este campo
// (em direção ao extremo que mais muda o risco), dados os demais valores atuais.
const ImpactBadge = ({ value, title }: { value: number; title: string }) => (
  <span className={`pv-impact ${value < 5 ? 'low' : value < 15 ? 'mid' : 'high'}`} title={title}>
    ±{value.toFixed(1)} p.p.
  </span>
);

function featureLabel(feature: string, lang: string): string {
  const key = feature.replace(/-/g, '_');
  return featureLabels[key]?.[lang] ?? featureLabels[key]?.pt ?? feature;
}

const Predictive = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.split('-')[0];

  const [input, setInput] = useState<CalculatorInput>({
    idade: 26, consultas: 8, semanas: 39, ano: 2023,
    sexo: 'Masculino', regiao: 'Sudeste',
  });
  const [task, setTask] = useState<MlrTask>('baixo_peso');

  const result = useMemo(() => predict(input), [input]);
  const impact = useMemo(() => impactPotential(input), [input]);
  const { prob, contributions } = result;
  const threshold = lrBaixoPeso.threshold;
  const highRisk = prob >= threshold;
  const probPct = (prob * 100).toFixed(1);
  const impactTitle = t('predictive.impact');

  const topContrib = useMemo(() => {
    const sorted = [...contributions].sort((a, b) => b.value - a.value);
    const elevam = sorted.filter(c => c.value > 0).slice(0, 2);
    const reduzem = [...sorted].reverse().filter(c => c.value < 0).slice(0, 1);
    return { elevam, reduzem };
  }, [contributions]);

  const shap: ShapItem[] = shapImportance[task];
  const metrics: ModelMetrics[] = modelComparison[task];
  const curves: RocCurve[] = rocCurves[task];
  const maxShap = Math.max(...shap.map(s => s.value), 1);

  const rocPath = (curve: RocCurve): string => {
    const W = 170, H = 140, X0 = 25, Y0 = 15;
    return curve.fpr.map((fpr, i) => {
      const x = X0 + fpr * W;
      const y = Y0 + (1 - curve.tpr[i]) * H;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  return (
    <section id="predictive" className="predictive">
      <div className="container">
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {t('predictive.title')}
        </motion.h2>
        <motion.p className="predictive-subtitle" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}>
          {t('predictive.subtitle')}
        </motion.p>

        <div className="predictive-grid">
          {/* ============ Calculadora ============ */}
          <motion.div className="cyber-card predictive-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="card-label pv-card-label"><Sliders size={14} /> {t('predictive.calculator')}</div>

            <div className="pv-field">
              <label className="pv-label" htmlFor="pv-idade">
                <span>{t('predictive.idade')}</span>
                <span className="pv-label-right">
                  <ImpactBadge value={impact.idade} title={impactTitle} />
                  <span className="pv-value">{input.idade}</span>
                </span>
              </label>
              <input id="pv-idade" type="range" min={10} max={55} value={input.idade}
                onChange={e => setInput(p => ({ ...p, idade: Number(e.target.value) }))} className="pv-range" />
            </div>

            <div className="pv-field">
              <label className="pv-label" htmlFor="pv-semanas">
                <span>{t('predictive.semanas')}</span>
                <span className="pv-label-right">
                  <ImpactBadge value={impact.semanas} title={impactTitle} />
                  <span className="pv-value">{input.semanas}</span>
                </span>
              </label>
              <input id="pv-semanas" type="range" min={20} max={45} value={input.semanas}
                onChange={e => setInput(p => ({ ...p, semanas: Number(e.target.value) }))} className="pv-range" />
            </div>

            <div className="pv-field">
              <label className="pv-label" htmlFor="pv-consultas">
                <span>{t('predictive.consultas')}</span>
                <span className="pv-label-right">
                  <ImpactBadge value={impact.consultas} title={impactTitle} />
                  <span className="pv-value">{input.consultas}</span>
                </span>
              </label>
              <input id="pv-consultas" type="range" min={0} max={15} value={input.consultas}
                onChange={e => setInput(p => ({ ...p, consultas: Number(e.target.value) }))} className="pv-range" />
            </div>

            <div className="pv-field">
              <span className="pv-label">
                <span>{t('predictive.sexo')}</span>
                <span className="pv-label-right"><ImpactBadge value={impact.sexo} title={impactTitle} /></span>
              </span>
              <div className="pv-chips">
                {(['Feminino', 'Masculino'] as Sexo[]).map(s => (
                  <button key={s} type="button" className={`pv-chip ${input.sexo === s ? 'active' : ''}`}
                    aria-pressed={input.sexo === s}
                    onClick={() => setInput(p => ({ ...p, sexo: s }))}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pv-field">
              <span className="pv-label">
                <span>{t('predictive.regiao')}</span>
                <span className="pv-label-right"><ImpactBadge value={impact.regiao} title={impactTitle} /></span>
              </span>
              <div className="pv-chips pv-chips-grid">
                {REGIOES.map(r => (
                  <button key={r} type="button" className={`pv-chip ${input.regiao === r ? 'active' : ''}`}
                    aria-pressed={input.regiao === r}
                    onClick={() => setInput(p => ({ ...p, regiao: r }))}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="pv-field">
              <span className="pv-label">
                <span>{t('predictive.ano')}</span>
                <span className="pv-label-right"><ImpactBadge value={impact.ano} title={impactTitle} /></span>
              </span>
              <div className="pv-chips">
                {ANOS.map(a => (
                  <button key={a} type="button" className={`pv-chip ${input.ano === a ? 'active' : ''}`}
                    aria-pressed={input.ano === a}
                    onClick={() => setInput(p => ({ ...p, ano: a }))}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Resultado */}
            <div className={`pv-result ${highRisk ? 'risk' : 'ok'}`}>
              <div className="pv-result-head">
                <Gauge size={16} />
                <span>{t('predictive.probability')}</span>
              </div>
              <div className="pv-prob">{probPct}%</div>
              <div className="pv-gauge">
                <div className="pv-gauge-fill" style={{ width: `${probPct}%` }} />
                <div className="pv-gauge-threshold" style={{ left: `${(threshold * 100).toFixed(1)}%` }} title={`${t('predictive.limiar')}: ${(threshold * 100).toFixed(1)}%`} />
              </div>
              <div className={`pv-badge ${highRisk ? 'risk' : 'ok'}`}>
                {highRisk ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                {highRisk ? t('predictive.alto') : t('predictive.baixo')}
              </div>
              {topContrib.elevam.length > 0 && (
                <div className="pv-contrib">
                  <p className="pv-contrib-title">{t('predictive.fatores')}</p>
                  {topContrib.elevam.map(c => (
                    <div key={c.feature} className="pv-contrib-item up">
                      <TrendingUp size={12} /> {featureLabel(c.feature, lang)}
                    </div>
                  ))}
                  {topContrib.reduzem.map(c => (
                    <div key={c.feature} className="pv-contrib-item down">
                      <TrendingUp size={12} className="rotate" /> {featureLabel(c.feature, lang)}
                    </div>
                  ))}
                </div>
              )}
              <p className="pv-disclaimer"><Info size={12} /> {t('predictive.disclaimer')}</p>
            </div>
          </motion.div>

          {/* ============ Resultados dos modelos ============ */}
          <motion.div className="cyber-card predictive-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div className="card-label pv-card-label"><BrainCircuit size={14} /> {t('predictive.results')}</div>

            <div className="pv-tabs">
              {(['baixo_peso', 'prematuro'] as MlrTask[]).map(tk => (
                <button key={tk} type="button" className={`pv-tab ${task === tk ? 'active' : ''}`}
                  aria-pressed={task === tk}
                  onClick={() => setTask(tk)}>
                  {tk === 'baixo_peso' ? t('predictive.tabBaixoPeso') : t('predictive.tabPrematuro')}
                </button>
              ))}
            </div>

            {task === 'prematuro' && (
              <p className="pv-note"><Info size={12} /> {t('predictive.prematuroNota')}</p>
            )}

            {/* SHAP */}
            <p className="pv-block-title">{t('predictive.featureImportance')}</p>
            <div className="pv-shap">
              {shap.map(item => (
                <div key={item.feature} className="pv-shap-row">
                  <span className="pv-shap-label">{featureLabel(item.feature, lang)}</span>
                  <div className="pv-shap-track">
                    <motion.div className="pv-shap-fill" style={{ width: 0 }}
                      whileInView={{ width: `${(item.value / maxShap) * 100}%` }} viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.1 }} />
                  </div>
                  <span className="pv-shap-value">{item.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>

            {/* Comparativo */}
            <p className="pv-block-title">{t('predictive.comparativo')}</p>
            <div className="pv-models">
              {metrics.map((m, i) => (
                <div key={m.modelo} className="pv-model">
                  <div className="pv-model-head">
                    <span className="pv-model-name" style={{ color: MODEL_COLORS[i % MODEL_COLORS.length] }}>{m.modelo}</span>
                    <span className="pv-model-score">{m.rocAuc.toFixed(3)}</span>
                  </div>
                  <div className="pv-model-bar">
                    <div className="pv-model-fill" style={{ width: `${m.rocAuc * 100}%`, background: MODEL_COLORS[i % MODEL_COLORS.length] }} />
                  </div>
                  <div className="pv-model-meta">
                    <span>ROC-AUC {m.rocAuc.toFixed(3)}</span>
                    <span>PR-AUC {m.prAuc.toFixed(3)}</span>
                    <span>F1 {m.f1.toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ROC */}
            <p className="pv-block-title">{t('predictive.rocTitle')}</p>
            <div className="pv-roc">
              <svg viewBox="0 0 200 185" className="pv-roc-svg" role="img" aria-label="ROC curves">
                <line x1="25" y1="155" x2="195" y2="155" stroke="var(--text-secondary)" strokeOpacity="0.4" strokeWidth="1" />
                <line x1="25" y1="15" x2="25" y2="155" stroke="var(--text-secondary)" strokeOpacity="0.4" strokeWidth="1" />
                <line x1="25" y1="155" x2="195" y2="15" stroke="var(--text-secondary)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="4 4" />
                {curves.map((c, i) => (
                  <path key={c.modelo} d={rocPath(c)} fill="none"
                    stroke={MODEL_COLORS[i % MODEL_COLORS.length]} strokeWidth={i === 1 ? 2.6 : 1.8}
                    strokeOpacity={i === 0 ? 0.55 : 1} strokeLinejoin="round" strokeLinecap="round" />
                ))}
                <text x="14" y="100" fill="var(--text-secondary)" fontSize="7" textAnchor="middle" transform="rotate(-90 14 100)">{t('predictive.vp')}</text>
                <text x="110" y="172" fill="var(--text-secondary)" fontSize="7" textAnchor="middle">{t('predictive.fp')}</text>
              </svg>
              <div className="pv-roc-legend">
                {curves.map((c, i) => (
                  <div key={c.modelo} className="pv-roc-legend-item">
                    <span className="pv-legend-dot" style={{ background: MODEL_COLORS[i % MODEL_COLORS.length] }} />
                    <span className="pv-legend-name">{c.modelo}</span>
                    <span className="pv-legend-auc">AUC {c.auc.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ============ Projeções 2024-2025 ============ */}
        <Forecast />
      </div>
    </section>
  );
};

export default Predictive;
