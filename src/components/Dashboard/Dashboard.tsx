import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Filter, BarChart3, Table2, TrendingUp, LayoutGrid,
  CircleDot, Layers, GitCompare, Lightbulb,
  TrendingDown, AlertTriangle, CheckCircle, Lock
} from 'lucide-react';
import { regionData, yearData, ageGroupData, sexoData, summaryStats } from '../../data/analysis';
import './Dashboard.css';

type ChartType = 'bar' | 'horizontal' | 'grouped' | 'stacked' | 'line' | 'donut' | 'table';
type DataSource = 'region' | 'year' | 'age' | 'sexo';
type Metric = 'births' | 'pctCesarea' | 'pctBaixoPeso' | 'pctPrematuro';

const METRIC_COLORS: Record<Metric, string> = {
  births: '#ff6b9d',
  pctCesarea: '#b48cff',
  pctBaixoPeso: '#7dd3fc',
  pctPrematuro: '#86efac',
};

const metricLabels: Record<Metric, Record<string, string>> = {
  births: { pt: 'Nascimentos', en: 'Births', es: 'Nacimientos' },
  pctCesarea: { pt: '% Cesáreas', en: '% C-Sections', es: '% Cesáreas' },
  pctBaixoPeso: { pt: '% Baixo Peso', en: '% Low Weight', es: '% Bajo Peso' },
  pctPrematuro: { pt: '% Prematuros', en: '% Premature', es: '% Prematuros' },
};

const sourceLabels: Record<DataSource, Record<string, string>> = {
  region: { pt: 'Região', en: 'Region', es: 'Región' },
  year: { pt: 'Ano', en: 'Year', es: 'Año' },
  age: { pt: 'Faixa Etária', en: 'Age Group', es: 'Grupo Etario' },
  sexo: { pt: 'Sexo', en: 'Sex', es: 'Sexo' },
};

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.split('-')[0];

  const [dataSources, setDataSources] = useState<DataSource[]>(['region']);
  const [metrics, setMetrics] = useState<Metric[]>(['births']);
  const [chartType, setChartType] = useState<ChartType>('bar');

  const toggleSource = (src: DataSource) => {
    setDataSources(prev => {
      if (prev.includes(src)) {
        return prev.length > 1 ? prev.filter(s => s !== src) : prev;
      }
      return [...prev, src];
    });
  };

  const toggleMetric = (m: Metric) => {
    setMetrics(prev => {
      if (prev.includes(m)) {
        return prev.length > 1 ? prev.filter(x => x !== m) : prev;
      }
      return [...prev, m];
    });
  };

  const allData = useMemo(() => {
    const result: Record<DataSource, { label: string; values: Record<Metric, number> }[]> = {
      region: regionData.map(d => ({
        label: d.region,
        values: { births: d.births, pctCesarea: d.pctCesarea, pctBaixoPeso: d.pctBaixoPeso, pctPrematuro: d.pctPrematuro },
      })),
      year: yearData.map(d => ({
        label: String(d.year),
        values: { births: d.births, pctCesarea: d.pctCesarea, pctBaixoPeso: d.pctBaixoPeso, pctPrematuro: d.pctPrematuro },
      })),
      age: ageGroupData.map(d => ({
        label: d.group,
        values: { births: d.count, pctCesarea: 0, pctBaixoPeso: d.pct, pctPrematuro: 0 },
      })),
      sexo: sexoData.map(d => ({
        label: d.sexo,
        values: { births: d.count, pctCesarea: 0, pctBaixoPeso: d.pct, pctPrematuro: 0 },
      })),
    };
    return result;
  }, []);

  const chartData = useMemo(() => {
    const combined: { label: string; values: Record<Metric, number> }[] = [];

    dataSources.forEach(src => {
      const rows = allData[src];
      rows.forEach(row => {
        const exists = combined.find(c => c.label === row.label);
        if (exists) {
          metrics.forEach(m => {
            exists.values[m] += row.values[m];
          });
        } else {
          combined.push({
            label: row.label,
            values: { ...row.values },
          });
        }
      });
    });

    return combined.map(row => ({
      label: row.label,
      metrics: metrics.map(m => ({
        key: m,
        value: Math.round(row.values[m] * 10) / 10,
        color: METRIC_COLORS[m],
        label: metricLabels[m][lang] || metricLabels[m]['pt'],
      })),
    }));
  }, [dataSources, metrics, lang, allData]);

  const multiMetric = metrics.length > 1;
  const autoChart: ChartType = multiMetric ? 'grouped' : chartType;
  const isComparative = multiMetric;

  const insights = useMemo(() => {
    const result: { type: 'high' | 'low' | 'info' | 'warning'; text: string }[] = [];
    if (chartData.length === 0 || metrics.length === 0) return result;

    metrics.forEach(m => {
      const values = chartData.map(row => ({
        label: row.label,
        value: row.metrics.find(rm => rm.key === m)?.value || 0,
      }));

      const max = values.reduce((a, b) => a.value > b.value ? a : b);
      const min = values.reduce((a, b) => a.value < b.value ? a : b);
      const avg = values.reduce((a, b) => a + b.value, 0) / values.length;
      const mLabel = metricLabels[m][lang] || metricLabels[m]['pt'];

      if (m === 'births') {
        result.push({
          type: 'high',
          text: `${max.label} lidera com ${max.value.toLocaleString()} nascimentos (${mLabel}), representando ${((max.value / values.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}% do total.`,
        });
      } else if (m === 'pctCesarea') {
        result.push({
          type: max.value > 50 ? 'warning' : 'info',
          text: `${max.label} tem a maior taxa de cesáreas (${max.value}%)${max.value > 50 ? ' — acima de 50%, indicando possível medicalização excessiva' : ''}.`,
        });
        result.push({
          type: 'low',
          text: `${min.label} apresenta a menor taxa de cesáreas (${min.value}%), mais próxima da recomendação da OMS (10-15%).`,
        });
      } else if (m === 'pctBaixoPeso') {
        result.push({
          type: max.value > 7 ? 'warning' : 'info',
          text: `${max.label} tem ${max.value}% de baixo peso ao nascer${max.value > 7 ? ' — acima da média nacional' : ''}. Média geral: ${avg.toFixed(1)}%.`,
        });
      } else if (m === 'pctPrematuro') {
        result.push({
          type: max.value > 8 ? 'warning' : 'info',
          text: `${max.label} registra ${max.value}% de prematuros${max.value > 8 ? ', requerendo atenção neonatal' : ''}.`,
        });
      }
    });

    if (dataSources.length > 1) {
      result.push({
        type: 'info',
        text: `Análise combinando ${dataSources.map(s => sourceLabels[s][lang] || sourceLabels[s]['pt']).join(' + ')} — dados consolidados para visão panorâmica.`,
      });
    }

    return result;
  }, [chartData, metrics, dataSources, lang]);

  const getMaxVal = () => {
    let max = 0;
    chartData.forEach(row => {
      row.metrics.forEach(m => { if (m.value > max) max = m.value; });
    });
    return max || 1;
  };
  const maxVal = getMaxVal();

  const renderLegend = () => (
    <div className="chart-legend">
      {metrics.map(m => (
        <div key={m} className="legend-item">
          <span className="legend-dot" style={{ background: METRIC_COLORS[m] }} />
          <span>{metricLabels[m][lang] || metricLabels[m]['pt']}</span>
        </div>
      ))}
    </div>
  );

  return (
    <section id="dashboard" className="dashboard">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('dashboard.title')}
        </motion.h2>

        {/* Controls */}
        <motion.div
          className="dashboard-controls cyber-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="controls-header">
            <Filter size={16} />
            <span className="card-label">FILTROS</span>
            {isComparative && <span className="compare-badge">COMPARATIVO</span>}
          </div>

          <div className="controls-grid">
            <div className="control-group">
              <label className="control-label">{t('dashboard.source')}</label>
              <div className="control-buttons">
                {(Object.keys(sourceLabels) as DataSource[]).map(src => (
                  <button
                    key={src}
                    className={`control-btn ${dataSources.includes(src) ? 'active' : ''}`}
                    onClick={() => toggleSource(src)}
                  >
                    {sourceLabels[src][lang] || sourceLabels[src]['pt']}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">{t('dashboard.metric')} <span className="hint">(multi)</span></label>
              <div className="control-buttons">
                {(Object.keys(metricLabels) as Metric[]).map(m => (
                  <button
                    key={m}
                    className={`control-btn ${metrics.includes(m) ? 'active' : ''}`}
                    onClick={() => toggleMetric(m)}
                  >
                    <span className="metric-dot" style={{ background: METRIC_COLORS[m] }} />
                    {metricLabels[m][lang] || metricLabels[m]['pt']}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">{t('dashboard.chart')}</label>
              <div className="control-buttons chart-type-btns">
                {[
                  { type: 'bar' as ChartType, icon: <BarChart3 size={15} />, tip: 'Barras verticais', blocked: multiMetric },
                  { type: 'horizontal' as ChartType, icon: <TrendingUp size={15} />, tip: 'Barras horizontais', blocked: multiMetric },
                  { type: 'grouped' as ChartType, icon: <LayoutGrid size={15} />, tip: 'Agrupado (multi-métrica)', blocked: false },
                  { type: 'stacked' as ChartType, icon: <Layers size={15} />, tip: 'Empilhado (multi-métrica)', blocked: false },
                  { type: 'line' as ChartType, icon: <GitCompare size={15} />, tip: 'Linha', blocked: false },
                  { type: 'donut' as ChartType, icon: <CircleDot size={15} />, tip: 'Donut', blocked: multiMetric },
                  { type: 'table' as ChartType, icon: <Table2 size={15} />, tip: 'Tabela', blocked: false },
                ].map(c => (
                  <button
                    key={c.type}
                    className={`control-btn chart-btn ${autoChart === c.type ? 'active' : ''} ${c.blocked ? 'blocked' : ''}`}
                    onClick={() => !c.blocked && setChartType(c.type)}
                    title={c.blocked ? `${c.tip} (indisponível com multi-métrica)` : c.tip}
                    disabled={c.blocked}
                  >
                    {c.icon}
                    {c.blocked && <Lock size={10} className="lock-icon" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart Area */}
        <motion.div
          className="dashboard-chart-wrapper cyber-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className="chart-header">
            <div>
              <span className="chart-title">
                {dataSources.map(s => sourceLabels[s][lang] || sourceLabels[s]['pt']).join(' + ')}
                {' — '}
                {metrics.map(m => metricLabels[m][lang] || metricLabels[m]['pt']).join(', ')}
              </span>
              {isComparative && <span className="chart-compare-tag">COMPARATIVO</span>}
            </div>
            <span className="chart-subtitle">
              {summaryStats.totalBirths.toLocaleString()} registros
            </span>
          </div>

          {metrics.length > 1 && renderLegend()}

          <div className="dashboard-chart-scroll">

          {/* VERTICAL BAR */}
          {(autoChart === 'bar') && (
            <div className="bar-chart">
              {chartData.map((row, i) => (
                <div key={row.label} className="bar-col">
                  <div className="bar-value">
                    {row.metrics[0].value > 100 ? row.metrics[0].value.toLocaleString() : row.metrics[0].value}
                  </div>
                  <div className="bar-track">
                    <motion.div
                      className="bar-fill"
                      style={{ backgroundColor: row.metrics[0].color }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${(row.metrics[0].value / maxVal) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                    />
                  </div>
                  <div className="bar-label">{row.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* HORIZONTAL BAR */}
          {autoChart === 'horizontal' && (
            <div className="hbar-chart">
              {chartData.map((row, i) => (
                <div key={row.label} className="hbar-row">
                  <div className="hbar-label">{row.label}</div>
                  <div className="hbar-track">
                    <motion.div
                      className="hbar-fill"
                      style={{ backgroundColor: row.metrics[0].color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(row.metrics[0].value / maxVal) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                    />
                  </div>
                  <div className="hbar-value">
                    {row.metrics[0].value > 100 ? row.metrics[0].value.toLocaleString() : row.metrics[0].value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GROUPED BAR */}
          {autoChart === 'grouped' && (
            <div className="grouped-chart">
              {chartData.map((row, i) => (
                <div key={row.label} className="grouped-col">
                  <div className="grouped-bars">
                    {row.metrics.map((m, j) => (
                      <div key={m.key} className="grouped-bar-wrapper">
                        <div className="bar-value small">{m.value > 100 ? m.value.toLocaleString() : m.value}</div>
                        <div className="bar-track narrow">
                          <motion.div
                            className="bar-fill"
                            style={{ backgroundColor: m.color }}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${(m.value / maxVal) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.06 + j * 0.04 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bar-label">{row.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* STACKED BAR */}
          {autoChart === 'stacked' && (
            <div className="hbar-chart">
              {chartData.map((row, i) => {
                const total = row.metrics.reduce((a, b) => a + b.value, 0) || 1;
                return (
                  <div key={row.label} className="hbar-row">
                    <div className="hbar-label">{row.label}</div>
                    <div className="hbar-track tall">
                      <div className="stacked-bar">
                        {row.metrics.map((m, j) => (
                          <motion.div
                            key={m.key}
                            className="stacked-segment"
                            style={{ backgroundColor: m.color }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(m.value / total) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.06 + j * 0.04 }}
                            title={`${m.label}: ${m.value}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="hbar-value">{total > 100 ? Math.round(total).toLocaleString() : total.toFixed(1)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LINE CHART */}
          {autoChart === 'line' && (
            <div className="line-chart-wrapper">
              <svg viewBox={`0 0 ${chartData.length * 80 + 40} 260`} className="line-chart-svg">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                  <line
                    key={frac}
                    x1="30" y1={50 + (1 - frac) * 170}
                    x2={chartData.length * 80 + 30} y2={50 + (1 - frac) * 170}
                    stroke="rgba(255,255,255,0.06)" strokeWidth="1"
                  />
                ))}
                {metrics.map((m) => {
                  const points = chartData.map((row, i) => {
                    const val = row.metrics.find(rm => rm.key === m)?.value || 0;
                    const x = 50 + i * 80;
                    const y = 50 + (1 - val / maxVal) * 170;
                    return `${x},${y}`;
                  }).join(' ');
                  return (
                    <g key={m}>
                      <polyline
                        points={points}
                        fill="none"
                        stroke={METRIC_COLORS[m]}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {chartData.map((row, i) => {
                        const val = row.metrics.find(rm => rm.key === m)?.value || 0;
                        const x = 50 + i * 80;
                        const y = 50 + (1 - val / maxVal) * 170;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="5" fill={METRIC_COLORS[m]} />
                            <text x={x} y={y - 12} fill="var(--text-primary)" fontSize="10" textAnchor="middle" fontWeight="700">
                              {val > 100 ? val.toLocaleString() : val}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
                {/* X labels */}
                {chartData.map((row, i) => (
                  <text
                    key={i}
                    x={50 + i * 80}
                    y={245}
                    fill="var(--text-secondary)"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {row.label}
                  </text>
                ))}
              </svg>
            </div>
          )}

          {/* DONUT */}
          {autoChart === 'donut' && (
            <div className="donut-chart-wrapper">
              {chartData.map((row) => {
                const total = row.metrics.reduce((a, b) => a + b.value, 0) || 1;
                let cumAngle = -90;
                const r = 70;
                const cx = 90;
                const cy = 90;
                const circumference = 2 * Math.PI * r;

                return (
                  <div key={row.label} className="donut-card">
                    <svg viewBox="0 0 180 180" className="donut-svg">
                      {row.metrics.map((m) => {
                        const pct = m.value / total;
                        const dashLen = pct * circumference;
                        const dashOff = -cumAngle / 360 * circumference;
                        cumAngle += pct * 360;
                        return (
                          <circle
                            key={m.key}
                            cx={cx} cy={cy} r={r}
                            fill="none"
                            stroke={m.color}
                            strokeWidth="22"
                            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                            strokeDashoffset={-dashOff}
                            strokeLinecap="butt"
                          />
                        );
                      })}
                      <text x={cx} y={cy - 6} fill="var(--text-primary)" fontSize="13" textAnchor="middle" fontWeight="800">
                        {row.label}
                      </text>
                      <text x={cx} y={cy + 12} fill="var(--text-secondary)" fontSize="9" textAnchor="middle">
                        {total > 100 ? Math.round(total).toLocaleString() : total.toFixed(1)}
                      </text>
                    </svg>
                  </div>
                );
              })}
            </div>
          )}

          {/* TABLE */}
          {autoChart === 'table' && (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('dashboard.category')}</th>
                    {metrics.map(m => (
                      <th key={m}>
                        <span className="th-dot" style={{ background: METRIC_COLORS[m] }} />
                        {metricLabels[m][lang] || metricLabels[m]['pt']}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => (
                    <tr key={row.label}>
                      <td className="table-label">{row.label}</td>
                      {row.metrics.map(m => (
                        <td key={m.key} className="table-value" style={{ color: m.color + ' !important' }}>
                          {m.value > 100 ? m.value.toLocaleString() : m.value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </motion.div>

        {/* Insight Card */}
        {insights.length > 0 && (
          <motion.div
            className="insight-card cyber-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <div className="insight-header">
              <Lightbulb size={16} />
              <span className="card-label">INSIGHTS</span>
            </div>
            <div className="insight-list">
              {insights.map((insight, i) => (
                <div key={i} className={`insight-item insight-${insight.type}`}>
                  <div className="insight-icon">
                    {insight.type === 'high' && <TrendingUp size={14} />}
                    {insight.type === 'low' && <TrendingDown size={14} />}
                    {insight.type === 'warning' && <AlertTriangle size={14} />}
                    {insight.type === 'info' && <CheckCircle size={14} />}
                  </div>
                  <p className="insight-text">{insight.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
