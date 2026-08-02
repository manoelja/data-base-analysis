import { useEffect, useMemo, useRef, useState } from 'react';
import type { FocusEvent as ReactFocusEvent, MouseEvent as ReactMouseEvent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Info, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import {
  forecastData,
  type ForecastDimension,
  type ForecastSeries,
} from '../../data/forecast';
import './Predictive.css';

const DIMENSIONS: ForecastDimension[] = ['total', 'regiao', 'faixa_etaria', 'sexo'];

const DIM_LABEL_KEYS: Record<ForecastDimension, string> = {
  total: 'forecast.dimTotal',
  regiao: 'forecast.dimRegiao',
  faixa_etaria: 'forecast.dimFaixaEtaria',
  sexo: 'forecast.dimSexo',
};

const seriesLabels: Record<string, Record<string, string>> = {
  regiao_centro_oeste: { pt: 'Centro-Oeste', en: 'Midwest', es: 'Centro-Oeste' },
  regiao_nordeste: { pt: 'Nordeste', en: 'Northeast', es: 'Nordeste' },
  regiao_norte: { pt: 'Norte', en: 'North', es: 'Norte' },
  regiao_sudeste: { pt: 'Sudeste', en: 'Southeast', es: 'Sudeste' },
  regiao_sul: { pt: 'Sul', en: 'South', es: 'Sur' },
  faixa_etaria_adolescente: { pt: 'Adolescente', en: 'Adolescent', es: 'Adolescente' },
  faixa_etaria_adulta: { pt: 'Adulta', en: 'Adult', es: 'Adulta' },
  faixa_etaria_35_ou_mais: { pt: '35 anos ou mais', en: '35+ years', es: '35 años o más' },
  sexo_feminino: { pt: 'Feminino', en: 'Female', es: 'Femenino' },
  sexo_masculino: { pt: 'Masculino', en: 'Male', es: 'Masculino' },
};

// Ao trocar de dimensão, começa na série em destaque (a com tendência relevante).
const DEFAULT_SERIES: Record<'regiao' | 'faixa_etaria' | 'sexo', string> = {
  regiao: 'regiao_norte',
  faixa_etaria: 'faixa_etaria_35_ou_mais',
  sexo: 'sexo_feminino',
};

function seriesLabel(id: string, lang: string): string {
  return seriesLabels[id]?.[lang] ?? seriesLabels[id]?.pt ?? id;
}

function seriesListOf(dim: ForecastDimension): ForecastSeries[] {
  switch (dim) {
    case 'total':
      return [forecastData.total];
    case 'regiao':
      return forecastData.regiao;
    case 'faixa_etaria':
      return forecastData.faixaEtaria;
    case 'sexo':
      return forecastData.sexo;
  }
}

const CHART_W = 560;
const CHART_H = 250;
const X0 = 48;
const X1 = CHART_W - 16;
const Y0 = 14;
const Y1 = CHART_H - 34;

type TipData = {
  left: number;
  top: number;
  year: number;
  value: number;
  lo?: number;
  hi?: number;
  proj: boolean;
};

function ForecastChart({ series, isShare, lang, t }: {
  series: ForecastSeries;
  isShare: boolean;
  lang: string;
  t: TFunction;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipData | null>(null);

  // Ao redimensionar a janela, as coordenadas px do tooltip ficam obsoletas.
  useEffect(() => {
    const onResize = () => setTip(null);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const hist = isShare && series.shareHistory ? series.shareHistory : series.history;
  const proj = isShare && series.shareProjection ? series.shareProjection : series.projection;
  const suffix = isShare ? '%' : '';

  if (hist.length === 0 || proj.length === 0) return null;

  const years = Array.from(new Set([...hist.map(p => p.year), ...proj.map(p => p.year)])).sort((a, b) => a - b);
  const yearMin = years[0];
  const yearMax = years[years.length - 1];
  const allVals = [...hist.map(p => p.value), ...proj.flatMap(p => [p.lo, p.value, p.hi])];
  let lo = Math.min(...allVals);
  let hi = Math.max(...allVals);
  const pad = (hi - lo) * 0.1 || 1;
  lo -= pad;
  hi += pad;

  const x = (yr: number) => X0 + ((yr - yearMin) / (yearMax - yearMin || 1)) * (X1 - X0);
  const y = (v: number) => Y1 - ((v - lo) / (hi - lo)) * (Y1 - Y0);

  const histPath = hist.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.year).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const projPath = proj.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.year).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  // Polígono da banda: sobe pelo limite inferior, desce pelo superior.
  const bandPath =
    `M ${x(proj[0].year).toFixed(1)} ${y(proj[0].lo).toFixed(1)} ` +
    proj.slice(1).map(p => `L ${x(p.year).toFixed(1)} ${y(p.lo).toFixed(1)}`).join(' ') +
    ` L ${x(proj[proj.length - 1].year).toFixed(1)} ${y(proj[proj.length - 1].hi).toFixed(1)} ` +
    proj.slice(0, -1).reverse().map(p => `L ${x(p.year).toFixed(1)} ${y(p.hi).toFixed(1)}`).join(' ') +
    ' Z';

  const ticks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);
  const lastHist = hist[hist.length - 1];
  const lastProj = proj[proj.length - 1];
  const fmt = (v: number) => v.toLocaleString(lang, { maximumFractionDigits: 1 });

  const points = [
    ...hist.map(p => ({ key: `h${p.year}`, year: p.year, value: p.value, lo: undefined, hi: undefined, proj: false as const })),
    ...proj.map(p => ({ key: `p${p.year}`, year: p.year, value: p.value, lo: p.lo, hi: p.hi, proj: true as const })),
  ];

  const placeTip = (
    e: ReactMouseEvent<SVGCircleElement> | ReactFocusEvent<SVGCircleElement>,
    pt: (typeof points)[number], cx: number, cy: number,
  ) => {
    const svg = e.currentTarget.ownerSVGElement;
    const container = chartRef.current;
    if (!svg || !container) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const sp = new DOMPoint(cx, cy).matrixTransform(ctm);
    const rect = container.getBoundingClientRect();
    // Clamp horizontal: mantém o tooltip (min-width ~128px) dentro das bordas,
    // mesmo em contêineres estreitos (Math.max evita min > max).
    const half = 68;
    const left = Math.min(Math.max(sp.x - rect.left, half), Math.max(half, rect.width - half));
    setTip({ left, top: sp.y - rect.top, year: pt.year, value: pt.value, lo: pt.lo, hi: pt.hi, proj: pt.proj });
  };

  const hideTip = () => setTip(null);

  return (
    <div className="pv-forecast-chart" ref={chartRef}>
      {/* Sem role="img" no svg: os círculos interativos (tabIndex) precisam de rótulos
          individuais no acessibility tree; o aria-label descreve o gráfico como um todo. */}
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="pv-forecast-svg"
        aria-label={`${seriesLabel(series.id, lang)} — ${isShare ? t('forecast.modeShare') : t('forecast.modeValue')} 2019–2025`}>
        {ticks.map((v, i) => (
          <g key={i}>
            <line x1={X0} y1={y(v)} x2={X1} y2={y(v)} stroke="var(--text-secondary)" strokeOpacity="0.12" strokeWidth="1" />
            <text x={X0 - 6} y={y(v) + 3} fill="var(--text-secondary)" fontSize="9" textAnchor="end" fontFamily="monospace">
              {fmt(v)}{suffix}
            </text>
          </g>
        ))}
        <path d={bandPath} fill="var(--accent-color)" fillOpacity="0.12" />
        <path d={projPath} fill="none" stroke="var(--lavender)" strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" strokeLinecap="round" />
        <path d={histPath} fill="none" stroke="var(--accent-color)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        {points.map(pt => (
          <g key={pt.key}>
            {/* ponto visível (decorativo) */}
            <circle
              cx={x(pt.year)} cy={y(pt.value)}
              r={pt.proj ? 3 : 3.4}
              fill={pt.proj ? 'var(--lavender)' : 'var(--accent-color)'}
              stroke="var(--bg-color)" strokeWidth="1.5"
              aria-hidden="true"
            />
            {/* área de hover ampliada + acessível */}
            <circle
              className="pv-chart-hit"
              cx={x(pt.year)} cy={y(pt.value)} r="11"
              tabIndex={0}
              aria-label={`${pt.year}: ${fmt(pt.value)}${suffix}${pt.proj && pt.lo !== undefined && pt.hi !== undefined
                ? `, ${t('forecast.band')} ${fmt(pt.lo)}–${fmt(pt.hi)}${suffix}`
                : ''}`}
              onMouseEnter={e => placeTip(e, pt, x(pt.year), y(pt.value))}
              onMouseLeave={hideTip}
              onFocus={e => placeTip(e, pt, x(pt.year), y(pt.value))}
              onBlur={hideTip}
            />
          </g>
        ))}
        {years.map(yr => (
          <text key={yr} x={x(yr)} y={Y1 + 16} fill="var(--text-secondary)" fontSize="9.5" textAnchor="middle" fontFamily="monospace">{yr}</text>
        ))}
      </svg>

      {tip && (
        <div className={`pv-tooltip ${tip.top > 100 ? '' : 'below'}`} style={{ left: tip.left, top: tip.top }} role="tooltip">
          <div className="pv-tooltip-year">{tip.year} · {tip.proj ? t('forecast.projection') : t('forecast.history')}</div>
          <div className="pv-tooltip-value">{fmt(tip.value)}{suffix}</div>
          {tip.lo !== undefined && tip.hi !== undefined && (
            <div className="pv-tooltip-band">{t('forecast.band')}: {fmt(tip.lo)} – {fmt(tip.hi)}{suffix}</div>
          )}
        </div>
      )}

      <div className="pv-roc-legend">
        <div className="pv-roc-legend-item"><span className="pv-legend-line solid" /> {t('forecast.history')}</div>
        <div className="pv-roc-legend-item"><span className="pv-legend-line dashed" /> {t('forecast.projection')}</div>
        <div className="pv-roc-legend-item"><span className="pv-legend-band" /> {t('forecast.band')}</div>
      </div>

      <div className="pv-forecast-summary">
        <div>
          <span className="pv-val-label">{t('forecast.lastObserved')}</span>
          <span className="pv-val-value">{fmt(lastHist.value)}{suffix}</span>
          <span className="pv-val-detail">{lastHist.year}</span>
        </div>
        <div>
          <span className="pv-val-label">{t('forecast.projection2025')}</span>
          <span className="pv-val-value">{fmt(lastProj.value)}{suffix}</span>
          <span className="pv-val-detail">[{fmt(lastProj.lo)} – {fmt(lastProj.hi)}]{suffix}</span>
        </div>
        {series.slopePp !== undefined && series.pValue !== undefined && (
          <div>
            <span className="pv-val-label">{t('forecast.trend')}</span>
            <span className="pv-val-value">{series.slopePp >= 0 ? '+' : ''}{series.slopePp.toFixed(2)} p.p./ano</span>
            <span className="pv-val-detail">p = {series.pValue.toFixed(3)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const Forecast = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.split('-')[0];

  const [dim, setDim] = useState<ForecastDimension>('total');
  const [seriesId, setSeriesId] = useState<string>('regiao_norte');
  const [isShare, setIsShare] = useState(false);

  const list = useMemo(() => seriesListOf(dim), [dim]);
  const active = list.find(s => s.id === seriesId) ?? list[0];

  const seriesById = useMemo(() => {
    const m = new Map<string, ForecastSeries>();
    for (const s of [forecastData.total, ...forecastData.regiao, ...forecastData.faixaEtaria, ...forecastData.sexo]) {
      m.set(s.id, s);
    }
    return m;
  }, []);

  const changeDim = (d: ForecastDimension) => {
    setDim(d);
    setIsShare(false);
    if (d !== 'total') setSeriesId(DEFAULT_SERIES[d]);
  };

  const v = forecastData.validation;
  const fmt = (n: number) => n.toLocaleString(lang, { maximumFractionDigits: 1 });

  return (
    <motion.div className="cyber-card predictive-card pv-forecast" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="card-label pv-card-label"><LineChart size={14} /> {t('forecast.title')}</div>
      <p className="pv-forecast-sub">{t('forecast.subtitle')}</p>

      <div className="pv-tabs pv-forecast-dims">
        {DIMENSIONS.map(d => (
          <button key={d} type="button" className={`pv-tab ${dim === d ? 'active' : ''}`}
            aria-pressed={dim === d}
            onClick={() => changeDim(d)}>
            {t(DIM_LABEL_KEYS[d])}
          </button>
        ))}
      </div>

      {dim !== 'total' && (
        <>
          <div className="pv-forecast-mode">
            <button type="button" className={!isShare ? 'active' : ''} aria-pressed={!isShare}
              onClick={() => setIsShare(false)}>
              {t('forecast.modeValue')}
            </button>
            <button type="button" className={isShare ? 'active' : ''} aria-pressed={isShare}
              onClick={() => setIsShare(true)}>
              {t('forecast.modeShare')}
            </button>
          </div>
          <div className="pv-chips pv-forecast-series">
            {list.map(s => (
              <button key={s.id} type="button" className={`pv-chip ${active?.id === s.id ? 'active' : ''}`}
                aria-pressed={active?.id === s.id}
                onClick={() => setSeriesId(s.id)}>
                {seriesLabel(s.id, lang)}
              </button>
            ))}
          </div>
        </>
      )}

      <ForecastChart series={active} isShare={isShare && dim !== 'total'} lang={lang} t={t} />

      <div className="pv-forecast-foot">
        <div>
          <p className="pv-block-title">{t('forecast.highlights')}</p>
          <div className="pv-forecast-highlights">
            {forecastData.highlights.map(h => {
              const s = seriesById.get(h.id);
              if (!s) return null;
              const isDown = h.direction === 'down';
              return (
                <div key={h.id} className={`pv-highlight-card ${isDown ? 'down' : 'up'}`}>
                  <div className="pv-highlight-icon">{isDown ? <TrendingDown size={14} /> : <TrendingUp size={14} />}</div>
                  <div>
                    <div className="pv-highlight-name">{seriesLabel(h.id, lang)}</div>
                    <div className="pv-highlight-meta">
                      {isDown ? '↓' : '↑'} {Math.abs(h.slopePp).toFixed(2)} p.p./ano · p = {h.pValue.toFixed(3)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="pv-block-title">{t('forecast.validation')}</p>
          <div className="pv-val-card">
            <div className="pv-val-item">
              <span className="pv-val-label">{t('forecast.holdoutTotal')}</span>
              <span className="pv-val-value">{v.totalHoldout.errorPct.toFixed(1)}%</span>
              <span className="pv-val-detail">
                {t('forecast.predicted')} {fmt(v.totalHoldout.predicted)} · {t('forecast.actual')} {fmt(v.totalHoldout.actual)}
              </span>
            </div>
            <div className="pv-val-divider" />
            <span className="pv-val-label">{t('forecast.maeTitle')}</span>
            {(['regiao', 'faixa_etaria', 'sexo'] as Exclude<ForecastDimension, 'total'>[]).map(d => (
              <div key={d} className="pv-val-row">
                <span>{t(DIM_LABEL_KEYS[d])}</span>
                <span>{v.shareMaePp[d].toFixed(2)} p.p.</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="pv-disclaimer"><Info size={12} /> {t('forecast.disclaimer')}</p>
    </motion.div>
  );
};

export default Forecast;
