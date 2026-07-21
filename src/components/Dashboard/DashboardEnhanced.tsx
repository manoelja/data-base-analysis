import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Filter, BarChart3, Table2, TrendingUp, LayoutGrid,
  CircleDot, Layers, GitCompare, Lightbulb,
  TrendingDown, AlertTriangle, CheckCircle, ArrowLeft,
  MapPin, Calendar, Users, User, X, AlertCircle
} from 'lucide-react';
import { regionData, stateData, yearRegionData, ageGroupData, sexoData, summaryStats } from '../../data/analysis';
import './Dashboard.css';

type ChartType = 'bar' | 'horizontal' | 'grouped' | 'stacked' | 'line' | 'donut' | 'table';
type Metric = 'births' | 'pctCesarea' | 'pctBaixoPeso' | 'pctPrematuro';
type PrimaryFilter = 'region' | 'year' | 'age' | 'sexo';

const metricLabels: Record<Metric, Record<string, string>> = {
  births: { pt: 'Nascimentos', en: 'Births', es: 'Nacimientos' },
  pctCesarea: { pt: '% Cesáreas', en: '% C-Sections', es: '% Cesáreas' },
  pctBaixoPeso: { pt: '% Baixo Peso', en: '% Low Weight', es: '% Bajo Peso' },
  pctPrematuro: { pt: '% Prematuros', en: '% Premature', es: '% Prematuros' },
};

const primaryFilterLabels: Record<PrimaryFilter, Record<string, string>> = {
  region: { pt: 'Região', en: 'Region', es: 'Región' },
  year: { pt: 'Ano', en: 'Year', es: 'Año' },
  age: { pt: 'Faixa Etária', en: 'Age Group', es: 'Grupo Etario' },
  sexo: { pt: 'Sexo', en: 'Sex', es: 'Sexo' },
};

const regions = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
const years = [2019, 2020, 2021, 2022, 2023];
const ageGroups = ['Adolescente', 'Adulta', '35 ou mais'];
const sexos = ['Feminino', 'Masculino'];
const agePresets = [
  { label: '10-14', min: 10, max: 14 },
  { label: '15-19', min: 15, max: 19 },
  { label: '20-24', min: 20, max: 24 },
  { label: '25-29', min: 25, max: 29 },
  { label: '30-34', min: 30, max: 34 },
  { label: '35-39', min: 35, max: 39 },
  { label: '40-44', min: 40, max: 44 },
  { label: '45-55', min: 45, max: 55 },
];

interface ChartRow {
  label: string;
  values: Record<Metric, number>;
  onClick?: () => void;
  group: string;
}

const DashboardEnhanced = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.split('-')[0];

  const [metrics, setMetrics] = useState<Metric[]>(['births']);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [activeFilters, setActiveFilters] = useState<PrimaryFilter[]>([]);
  const [filterValues, setFilterValues] = useState<Record<PrimaryFilter, string[]>>({
    region: [],
    year: [],
    age: [],
    sexo: [],
  });
  const [ageFrom, setAgeFrom] = useState<number>(10);
  const [ageTo, setAgeTo] = useState<number>(55);
  const [isLight, setIsLight] = useState(document.documentElement.classList.contains('light-theme'));
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string; color?: string } | null>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains('light-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const metricColors: Record<Metric, string> = isLight
    ? { births: '#be185d', pctCesarea: '#6d28d9', pctBaixoPeso: '#0e7490', pctPrematuro: '#15803d' }
    : { births: '#ff6b9d', pctCesarea: '#b48cff', pctBaixoPeso: '#7dd3fc', pctPrematuro: '#86efac' };

  const toggleMetric = (m: Metric) => {
    setMetrics(prev => {
      if (prev.includes(m)) {
        return prev.length > 1 ? prev.filter(x => x !== m) : prev;
      }
      return [...prev, m];
    });
  };

  const toggleFilter = (filter: PrimaryFilter) => {
    setActiveFilters(prev => {
      if (prev.includes(filter)) {
        setFilterValues(fv => ({ ...fv, [filter]: [] }));
        return prev.filter(f => f !== filter);
      }
      return [...prev, filter];
    });
  };

  const toggleFilterValue = (filter: PrimaryFilter, value: string) => {
    setFilterValues(prev => {
      const current = prev[filter];
      if (current.includes(value)) {
        return { ...prev, [filter]: current.filter(v => v !== value) };
      }
      return { ...prev, [filter]: [...current, value] };
    });
  };

  const resetFilters = () => {
    setActiveFilters([]);
    setFilterValues({ region: [], year: [], age: [], sexo: [] });
    setAgeFrom(10);
    setAgeTo(55);
    setSelectedRegion(null);
  };

  const hasActiveFilters = activeFilters.length > 0 || selectedRegion;

  // Calculate age range births
  const calculateAgeRangeBirths = (from: number, to: number): number => {
    let births = 0;
    if (from <= 19 && to >= 10) {
      births += Math.round(1050 * ((Math.min(to, 19) - Math.max(from, 10) + 1) / 10));
    }
    if (from <= 34 && to >= 20) {
      births += Math.round(3580 * ((Math.min(to, 34) - Math.max(from, 20) + 1) / 15));
    }
    if (from <= 55 && to >= 35) {
      births += Math.round(880 * ((Math.min(to, 55) - Math.max(from, 35) + 1) / 21));
    }
    return births;
  };

  // Cross-filtering logic
  const chartData = useMemo(() => {
    // Drill-down to states
    if (selectedRegion) {
      const states = stateData.filter(s => s.region === selectedRegion);
      return states.map(s => ({
        label: s.uf,
        values: { births: s.births, pctCesarea: s.pctCesarea, pctBaixoPeso: s.pctBaixoPeso, pctPrematuro: s.pctPrematuro },
        onClick: undefined,
        group: selectedRegion,
      }));
    }

    // No filters - return empty (will show message)
    if (activeFilters.length === 0) {
      return [];
    }

    // Get selected values for each filter
    const selectedRegions = filterValues.region.length > 0 ? filterValues.region : regions;
    const selectedYears = filterValues.year.length > 0 ? filterValues.year.map(Number) : years;
    const selectedAgeGroups = filterValues.age.length > 0 ? filterValues.age : ageGroups;
    const selectedSexos = filterValues.sexo.length > 0 ? filterValues.sexo : sexos;

    const result: ChartRow[] = [];

    // Helper: Calculate age proportion (supports both presets and custom range)
    const getAgeProportion = (): number => {
      const isCustomRange = ageFrom !== 10 || ageTo !== 55;
      if (isCustomRange) {
        // Calculate proportion from custom range
        const customBirths = calculateAgeRangeBirths(ageFrom, ageTo);
        return customBirths / summaryStats.totalBirths;
      } else {
        // Calculate from selected presets
        return selectedAgeGroups.reduce((sum, ag) => {
          const ageData = ageGroupData.find(a => a.group === ag);
          return sum + (ageData?.pct || 0);
        }, 0) / 100;
      }
    };

    // Cross-filtering: Region is primary dimension when active
    if (activeFilters.includes('region')) {
      selectedRegions.forEach(region => {
        let regionBirths;
        let regionCesarea;

        // Cross with Year
        if (activeFilters.includes('year')) {
          const regionYearData = yearRegionData.filter(
            d => d.region === region && selectedYears.includes(d.year)
          );
          regionBirths = regionYearData.reduce((sum, d) => sum + d.births, 0);
          regionCesarea = regionYearData.length > 0
            ? regionYearData.reduce((sum, d) => sum + d.pctCesarea, 0) / regionYearData.length
            : 0;
        } else {
          const regionInfo = regionData.find(r => r.region === region);
          regionBirths = regionInfo?.births || 0;
          regionCesarea = regionInfo?.pctCesarea || 0;
        }

        // Cross with Age - adjust births proportionally
        if (activeFilters.includes('age')) {
          regionBirths = Math.round(regionBirths * getAgeProportion());
        }

        const regionInfo = regionData.find(r => r.region === region);
        result.push({
          label: region,
          values: {
            births: regionBirths,
            pctCesarea: Math.round(regionCesarea * 10) / 10,
            pctBaixoPeso: regionInfo?.pctBaixoPeso || 0,
            pctPrematuro: regionInfo?.pctPrematuro || 0,
          },
          onClick: () => setSelectedRegion(region),
          group: 'Região',
        });
      });
    }
    // Year only (no Region) - Show data BY YEAR
    else if (activeFilters.includes('year')) {
      selectedYears.forEach(year => {
        const yearDataItem = yearRegionData.filter(d => d.year === year);
        const totalBirths = yearDataItem.reduce((sum, d) => sum + d.births, 0);
        const avgCesarea = yearDataItem.length > 0
          ? yearDataItem.reduce((sum, d) => sum + d.pctCesarea, 0) / yearDataItem.length
          : 0;

        let births = totalBirths;

        // Cross with Age
        if (activeFilters.includes('age')) {
          births = Math.round(births * getAgeProportion());
        }

        result.push({
          label: String(year),
          values: {
            births,
            pctCesarea: Math.round(avgCesarea * 10) / 10,
            pctBaixoPeso: 7.1,
            pctPrematuro: 8.0,
          },
          onClick: undefined,
          group: 'Ano',
        });
      });
    }
    // Age only (no Region, no Year)
    else if (activeFilters.includes('age')) {
      // Check if custom age range is being used
      const isCustomRange = ageFrom !== 10 || ageTo !== 55;

      if (isCustomRange) {
        // Show only custom range
        const estimatedBirths = calculateAgeRangeBirths(ageFrom, ageTo);

        result.push({
          label: `${ageFrom}-${ageTo} anos`,
          values: { births: estimatedBirths, pctCesarea: 0, pctBaixoPeso: 1.8, pctPrematuro: 10.0 },
          onClick: undefined,
          group: 'Idade',
        });
      } else {
        // Show age groups
        selectedAgeGroups.forEach(ageGroup => {
          const ageData = ageGroupData.find(a => a.group === ageGroup);
          if (ageData) {
            const births = ageData.count;

            result.push({
              label: ageGroup,
              values: { births, pctCesarea: 0, pctBaixoPeso: ageData.pct, pctPrematuro: 0 },
              onClick: undefined,
              group: 'Faixa Etária',
            });
          }
        });
      }
    }
    // Sexo only (no Region, no Year, no Age)
    else if (activeFilters.includes('sexo')) {
      selectedSexos.forEach(sexo => {
        const sexoInfo = sexoData.find(s => s.sexo === sexo);
        if (sexoInfo) {
          result.push({
            label: sexo,
            values: { births: sexoInfo.count, pctCesarea: 0, pctBaixoPeso: sexoInfo.pct, pctPrematuro: 0 },
            onClick: undefined,
            group: 'Sexo',
          });
        }
      });
    }

    return result;
  }, [activeFilters, filterValues, selectedRegion, ageFrom, ageTo]);

  const filteredChartData = useMemo(() => {
    return chartData.map(row => ({
      ...row,
      metrics: metrics.map(m => ({
        key: m,
        value: Math.round(row.values[m] * 10) / 10,
        color: metricColors[m],
        label: metricLabels[m][lang] || metricLabels[m]['pt'],
      })),
    }));
  }, [chartData, metrics, lang]);

  const multiMetric = metrics.length > 1;

  const validChartTypes: Record<'true' | 'false', ChartType[]> = {
    false: ['bar', 'horizontal', 'grouped', 'stacked', 'line', 'donut', 'table'],
    true: ['grouped', 'stacked', 'line', 'table'],
  };

  const autoChart: ChartType = multiMetric
    ? (validChartTypes['true'].includes(chartType) ? chartType : 'grouped')
    : chartType;

  const getMaxVal = () => {
    let max = 0;
    filteredChartData.forEach(row => {
      row.metrics.forEach(m => { if (m.value > max) max = m.value; });
    });
    return max || 1;
  };
  const maxVal = getMaxVal();

  const getChartTitle = () => {
    if (selectedRegion) return `${selectedRegion} — Estados`;
    if (activeFilters.length === 0) return '';

    const hasRegion = activeFilters.includes('region');
    const hasYear = activeFilters.includes('year');
    const hasAge = activeFilters.includes('age');
    const hasSexo = activeFilters.includes('sexo');

    const parts: string[] = [];
    if (hasRegion) {
      const regionCount = filterValues.region.length;
      parts.push(regionCount === 1 ? filterValues.region[0] : `${regionCount} Regiões`);
    }
    if (hasYear) {
      const yearCount = filterValues.year.length;
      parts.push(yearCount === 1 ? filterValues.year[0] : `${yearCount} Anos`);
    }
    if (hasAge) {
      const ageCount = filterValues.age.length;
      parts.push(ageCount === 1 ? filterValues.age[0] : `${ageCount} Faixas`);
    }
    if (hasSexo) {
      const sexoCount = filterValues.sexo.length;
      parts.push(sexoCount === 1 ? filterValues.sexo[0] : `${sexoCount} Sexos`);
    }

    return parts.join(' × ') || 'Comparativo';
  };

  const handleMouseEnter = (e: React.MouseEvent, content: string, color?: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 10, content, color });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const insights = useMemo(() => {
    const result: { type: 'high' | 'low' | 'info' | 'warning'; text: string }[] = [];
    if (filteredChartData.length === 0 || metrics.length === 0) return result;

    const m = metrics[0];
    const values = filteredChartData.map(row => ({
      label: row.label,
      value: row.metrics.find(rm => rm.key === m)?.value || 0,
    }));

    const max = values.reduce((a, b) => a.value > b.value ? a : b);
    const min = values.length > 1 ? values.reduce((a, b) => a.value < b.value ? a : b) : null;
    const avg = values.reduce((sum, v) => sum + v.value, 0) / values.length;
    const total = values.reduce((sum, v) => sum + v.value, 0);

    // Context insights based on filters
    if (selectedRegion) {
      const regionStates = stateData.filter(s => s.region === selectedRegion);
      result.push({ type: 'info', text: `Visualizando ${regionStates.length} estados da região ${selectedRegion}.` });
    } else if (activeFilters.length > 0) {
      const filterNames = activeFilters.map(f => primaryFilterLabels[f][lang] || primaryFilterLabels[f]['pt']);
      result.push({ type: 'info', text: `Filtrado por: ${filterNames.join(' + ')}.` });
    }

    // Main metric insights
    result.push({ type: 'high', text: `${max.label} lidera com ${max.value.toLocaleString()} ${metricLabels[m][lang] || metricLabels[m]['pt']}.` });
    if (min) result.push({ type: 'low', text: `${min.label} apresenta o menor valor: ${min.value}.` });

    // Comparative insights
    if (values.length > 1) {
      const diff = max.value - min!.value;
      const diffPct = ((diff / min!.value) * 100).toFixed(1);
      result.push({ type: 'info', text: `Diferença entre maior e menor: ${diff.toLocaleString()} (${diffPct}% acima).` });

      if (avg > 0) {
        const aboveAvg = values.filter(v => v.value > avg);
        const belowAvg = values.filter(v => v.value <= avg);
        if (aboveAvg.length > 0 && belowAvg.length > 0) {
          result.push({ type: 'info', text: `Média: ${Math.round(avg).toLocaleString()} — ${aboveAvg.length} acima, ${belowAvg.length} abaixo.` });
        }
      }
    }

    // Region-specific insights
    if (activeFilters.includes('region') && !selectedRegion) {
      const regionValues = filteredChartData.filter(r => r.group === 'Região');
      if (regionValues.length > 0) {
        const northRegion = regionValues.find(r => r.label === 'Norte');
        const southRegion = regionValues.find(r => r.label === 'Sul');
        if (northRegion && southRegion) {
          const northVal = northRegion.metrics.find(rm => rm.key === m)?.value || 0;
          const southVal = southRegion.metrics.find(rm => rm.key === m)?.value || 0;
          if (northVal > southVal) {
            result.push({ type: 'info', text: `Norte apresenta valores ${((northVal / southVal - 1) * 100).toFixed(0)}% maiores que o Sul.` });
          }
        }
      }
    }

    // Year trend insights
    if (activeFilters.includes('year') && !activeFilters.includes('region')) {
      const yearValues = filteredChartData.filter(r => r.group === 'Ano');
      if (yearValues.length >= 2) {
        const firstYear = yearValues[0];
        const lastYear = yearValues[yearValues.length - 1];
        const firstVal = firstYear.metrics.find(rm => rm.key === m)?.value || 0;
        const lastVal = lastYear.metrics.find(rm => rm.key === m)?.value || 0;
        const trend = lastVal - firstVal;
        const trendPct = ((trend / firstVal) * 100).toFixed(1);

        if (trend > 0) {
          result.push({ type: 'warning', text: `Tendência crescente: +${trendPct}% de ${firstYear.label} para ${lastYear.label}.` });
        } else if (trend < 0) {
          result.push({ type: 'info', text: `Tendência decrescente: ${trendPct}% de ${firstYear.label} para ${lastYear.label}.` });
        } else {
          result.push({ type: 'info', text: `Valores estáveis entre ${firstYear.label} e ${lastYear.label}.` });
        }
      }
    }

    // Age-specific insights
    if (activeFilters.includes('age')) {
      const ageValues = filteredChartData.filter(r => r.group === 'Faixa Etária' || r.group === 'Idade');
      if (ageValues.length > 0) {
        const adolescente = ageValues.find(r => r.label.includes('Adolescente') || r.label.includes('10-19'));
        const adulta = ageValues.find(r => r.label.includes('Adulta') || r.label.includes('20-34'));
        const mais35 = ageValues.find(r => r.label.includes('35'));

        if (adolescente && adulta) {
          const adolesVal = adolescente.metrics.find(rm => rm.key === m)?.value || 0;
          const adultaVal = adulta.metrics.find(rm => rm.key === m)?.value || 0;
          if (adolesVal > 0 && adultaVal > 0) {
            result.push({ type: 'info', text: `Faixa Adulta (20-34) representa ${((adultaVal / (adolesVal + adultaVal)) * 100).toFixed(0)}% do total.` });
          }
        }

        if (mais35) {
          const mais35Val = mais35.metrics.find(rm => rm.key === m)?.value || 0;
          if (mais35Val > total * 0.15) {
            result.push({ type: 'warning', text: `Faixa 35+ representa ${((mais35Val / total) * 100).toFixed(0)}% — acima da média nacional (15.9%).` });
          }
        }
      }
    }

    // Sexo-specific insights
    if (activeFilters.includes('sexo')) {
      const sexoValues = filteredChartData.filter(r => r.group === 'Sexo');
      if (sexoValues.length === 2) {
        const fem = sexoValues.find(r => r.label === 'Feminino');
        const masc = sexoValues.find(r => r.label === 'Masculino');
        if (fem && masc) {
          const femVal = fem.metrics.find(rm => rm.key === m)?.value || 0;
          const mascVal = masc.metrics.find(rm => rm.key === m)?.value || 0;
          const ratio = (femVal / mascVal).toFixed(2);
          result.push({ type: 'info', text: `Proporção Feminino/Masculino: ${ratio} (esperado: ~1.05).` });
        }
      }
    }

    // Cesarean rate insights (if metric is births)
    if (m === 'births' && filteredChartData.length > 0) {
      const cesareaValues = filteredChartData.map(row => ({
        label: row.label,
        value: row.values.pctCesarea,
      })).filter(v => v.value > 0);

      if (cesareaValues.length > 0) {
        const maxCesarea = cesareaValues.reduce((a, b) => a.value > b.value ? a : b);
        const minCesarea = cesareaValues.reduce((a, b) => a.value < b.value ? a : b);

        if (maxCesarea.value > 50) {
          result.push({ type: 'warning', text: `${maxCesarea.label} tem ${maxCesarea.value}% de cesáreas — acima de 50%, indicando possível medicalização excessiva.` });
        }
        if (minCesarea.value < 15) {
          result.push({ type: 'info', text: `${minCesarea.label} tem ${minCesarea.value}% de cesáreas — próxima da recomendação da OMS (10-15%).` });
        }
      }
    }

    // Low birth weight insights
    if (filteredChartData.length > 0) {
      const baixoPesoValues = filteredChartData.map(row => ({
        label: row.label,
        value: row.values.pctBaixoPeso,
      })).filter(v => v.value > 0);

      if (baixoPesoValues.length > 0) {
        const maxBaixoPeso = baixoPesoValues.reduce((a, b) => a.value > b.value ? a : b);
        if (maxBaixoPeso.value > 7) {
          result.push({ type: 'warning', text: `${maxBaixoPeso.label} tem ${maxBaixoPeso.value}% de baixo peso — acima da média nacional (7.1%).` });
        }
      }
    }

    // Premature birth insights
    if (filteredChartData.length > 0) {
      const prematuroValues = filteredChartData.map(row => ({
        label: row.label,
        value: row.values.pctPrematuro,
      })).filter(v => v.value > 0);

      if (prematuroValues.length > 0) {
        const maxPrematuro = prematuroValues.reduce((a, b) => a.value > b.value ? a : b);
        if (maxPrematuro.value > 8) {
          result.push({ type: 'warning', text: `${maxPrematuro.label} tem ${maxPrematuro.value}% de prematuros — requer atenção neonatal.` });
        }
      }
    }

    // Multiple filters insight
    if (activeFilters.length > 1) {
      result.push({ type: 'info', text: `Análise cruzada: ${activeFilters.length} dimensões combinadas para visão abrangente.` });
    }

    return result;
  }, [filteredChartData, metrics, lang, selectedRegion, activeFilters]);

  const renderTooltip = () => {
    if (!tooltip) return null;
    const parts = tooltip.content.split(':');
    const label = parts[0]?.trim() || '';
    const value = parts.slice(1).join(':').trim() || '';
    return (
      <div className="chart-tooltip" style={{ position: 'fixed', left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)', pointerEvents: 'none' }}>
        {tooltip.color && <span className="tooltip-dot" style={{ backgroundColor: tooltip.color, color: tooltip.color }} />}
        <span className="tooltip-label">{label}</span>
        <span className="tooltip-value">{value}</span>
      </div>
    );
  };

  const filterIcons: Record<string, React.ReactNode> = {
    region: <MapPin size={14} />,
    year: <Calendar size={14} />,
    age: <Users size={14} />,
    sexo: <User size={14} />,
  };

  return (
    <section id="dashboard" className="dashboard">
      <div className="container">
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {t('dashboard.title')}
        </motion.h2>

        {/* Controls */}
        <motion.div className="dashboard-controls cyber-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="controls-header">
            <Filter size={16} />
            <span className="card-label">{t('dashboard.filters')}</span>
            {hasActiveFilters && (
              <button className="filter-reset-btn" onClick={resetFilters}>
                <X size={14} />
                {lang === 'pt' ? 'Limpar' : 'Clear'}
              </button>
            )}
          </div>

          {/* Primary Filters */}
          <div className="primary-filters">
            <label className="control-label">
              {lang === 'pt' ? 'Filtros (selecione um ou mais)' : 'Filters (select one or more)'}
            </label>
            <div className="primary-filter-buttons">
              {(['region', 'year', 'age', 'sexo'] as PrimaryFilter[]).map(filter => (
                <button
                  key={filter}
                  className={`primary-filter-btn ${activeFilters.includes(filter) ? 'active' : ''}`}
                  onClick={() => toggleFilter(filter)}
                >
                  {filterIcons[filter]}
                  <span>{primaryFilterLabels[filter][lang] || primaryFilterLabels[filter]['pt']}</span>
                  {activeFilters.includes(filter) && filterValues[filter].length > 0 && (
                    <span className="filter-count">{filterValues[filter].length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filters */}
          {activeFilters.map(filter => (
            <motion.div
              key={filter}
              className="secondary-filters"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="control-label">
                {primaryFilterLabels[filter][lang] || primaryFilterLabels[filter]['pt']}
              </label>

              {filter === 'age' ? (
                <div className="age-filter">
                  <div className="age-presets">
                    {ageGroups.map(group => (
                      <button
                        key={group}
                        className={`control-btn ${filterValues.age.includes(group) ? 'active' : ''}`}
                        onClick={() => toggleFilterValue('age', group)}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                  <div className="age-range">
                    <label className="period-label">{lang === 'pt' ? 'Ou selecione por idade:' : 'Or select by age:'}</label>
                    <div className="age-inputs">
                      <div className="period-select">
                        <label className="period-label">{lang === 'pt' ? 'De' : 'From'}</label>
                        <div className="age-input-wrapper">
                          <input type="number" className="age-input" min={10} max={55} value={ageFrom}
                            onChange={(e) => {
                              const val = Math.min(Number(e.target.value) || 10, ageTo);
                              setAgeFrom(val);
                              setFilterValues(fv => ({ ...fv, age: [] }));
                            }} />
                          <div className="age-spinner">
                            <button className="age-spinner-btn" onClick={() => {
                              const newVal = Math.min(ageFrom + 1, ageTo);
                              setAgeFrom(newVal);
                              setFilterValues(fv => ({ ...fv, age: [] }));
                            }}>▲</button>
                            <button className="age-spinner-btn" onClick={() => {
                              const newVal = Math.max(ageFrom - 1, 10);
                              setAgeFrom(newVal);
                              setFilterValues(fv => ({ ...fv, age: [] }));
                            }}>▼</button>
                          </div>
                        </div>
                      </div>
                      <span className="period-separator">—</span>
                      <div className="period-select">
                        <label className="period-label">{lang === 'pt' ? 'Até' : 'To'}</label>
                        <div className="age-input-wrapper">
                          <input type="number" className="age-input" min={10} max={55} value={ageTo}
                            onChange={(e) => {
                              const val = Math.max(Number(e.target.value) || 55, ageFrom);
                              setAgeTo(val);
                              setFilterValues(fv => ({ ...fv, age: [] }));
                            }} />
                          <div className="age-spinner">
                            <button className="age-spinner-btn" onClick={() => {
                              const newVal = Math.min(ageTo + 1, 55);
                              setAgeTo(newVal);
                              setFilterValues(fv => ({ ...fv, age: [] }));
                            }}>▲</button>
                            <button className="age-spinner-btn" onClick={() => {
                              const newVal = Math.max(ageTo - 1, ageFrom);
                              setAgeTo(newVal);
                              setFilterValues(fv => ({ ...fv, age: [] }));
                            }}>▼</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {(ageFrom !== 10 || ageTo !== 55) && (
                      <span className="age-range-badge">{ageFrom} — {ageTo} anos</span>
                    )}
                    <div className="age-presets-row">
                      {agePresets.map(preset => (
                        <button key={preset.label}
                          className={`control-btn preset-btn ${ageFrom === preset.min && ageTo === preset.max ? 'active' : ''}`}
                          onClick={() => {
                            setAgeFrom(preset.min);
                            setAgeTo(preset.max);
                            setFilterValues(fv => ({ ...fv, age: [] })); // Clear age groups
                          }}>
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : filter === 'year' ? (
                <div className="control-buttons secondary-btns">
                  {years.map(year => (
                    <button key={year}
                      className={`control-btn ${filterValues.year.includes(String(year)) ? 'active' : ''}`}
                      onClick={() => toggleFilterValue('year', String(year))}>
                      {year}
                    </button>
                  ))}
                </div>
              ) : filter === 'region' ? (
                <div className="control-buttons secondary-btns">
                  {regions.map(region => (
                    <button key={region}
                      className={`control-btn ${filterValues.region.includes(region) ? 'active' : ''}`}
                      onClick={() => toggleFilterValue('region', region)}>
                      {region}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="control-buttons secondary-btns">
                  {sexos.map(sexo => (
                    <button key={sexo}
                      className={`control-btn ${filterValues.sexo.includes(sexo) ? 'active' : ''}`}
                      onClick={() => toggleFilterValue('sexo', sexo)}>
                      {sexo}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {/* Metrics */}
          <div className="controls-grid">
            <div className="control-group">
              <label className="control-label">{t('dashboard.metric')} <span className="hint">(multi)</span></label>
              <div className="control-buttons">
                {(Object.keys(metricLabels) as Metric[]).map(m => (
                  <button key={m} className={`control-btn ${metrics.includes(m) ? 'active' : ''}`} onClick={() => toggleMetric(m)}>
                    <span className="metric-dot" style={{ background: metricColors[m] }} />
                    {metricLabels[m][lang] || metricLabels[m]['pt']}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">{t('dashboard.chart')}</label>
              <div className="control-buttons chart-type-btns">
                {[
                  { type: 'bar' as ChartType, icon: <BarChart3 size={15} /> },
                  { type: 'horizontal' as ChartType, icon: <TrendingUp size={15} /> },
                  { type: 'grouped' as ChartType, icon: <LayoutGrid size={15} /> },
                  { type: 'stacked' as ChartType, icon: <Layers size={15} /> },
                  { type: 'line' as ChartType, icon: <GitCompare size={15} /> },
                  { type: 'donut' as ChartType, icon: <CircleDot size={15} /> },
                  { type: 'table' as ChartType, icon: <Table2 size={15} /> },
                ].map(c => {
                  const isBlocked = multiMetric && !validChartTypes['true'].includes(c.type);
                  return (
                    <button key={c.type} className={`control-btn chart-btn ${autoChart === c.type ? 'active' : ''} ${isBlocked ? 'blocked' : ''}`}
                      onClick={() => setChartType(c.type)}>
                      {c.icon}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart Area */}
        <motion.div className="dashboard-chart-wrapper cyber-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          {/* Empty State - No Filters */}
          {!hasActiveFilters && (
            <div className="empty-state">
              <AlertCircle size={48} className="empty-icon" />
              <h3 className="empty-title">
                {lang === 'pt' ? 'Selecione um filtro para ver a análise' :
                 lang === 'en' ? 'Select a filter to see the analysis' :
                 'Seleccione un filtro para ver el análisis'}
              </h3>
              <p className="empty-description">
                {lang === 'pt' ? 'Use os filtros acima para explorar os dados de nascidos vivos por Região, Ano, Faixa Etária ou Sexo.' :
                 lang === 'en' ? 'Use the filters above to explore live birth data by Region, Year, Age Group, or Sex.' :
                 'Use los filtros arriba para explorar los datos de nacidos vivos por Región, Año, Grupo Etario o Sexo.'}
              </p>
            </div>
          )}

          {/* Chart Content */}
          {hasActiveFilters && (
            <>
              <div className="chart-header">
                <div>
                  <span className="chart-title">{getChartTitle()}</span>
                  {selectedRegion && (
                    <button className="drill-back-btn" onClick={() => setSelectedRegion(null)}>
                      <ArrowLeft size={12} /> {lang === 'pt' ? 'Voltar' : 'Back'}
                    </button>
                  )}
                </div>
                <span className="chart-subtitle">{summaryStats.totalBirths.toLocaleString()} registros</span>
              </div>

              {metrics.length > 1 && (
                <div className="chart-legend">
                  {metrics.map(m => (
                    <div key={m} className="legend-item">
                      <span className="legend-dot" style={{ background: metricColors[m] }} />
                      <span>{metricLabels[m][lang] || metricLabels[m]['pt']}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="dashboard-chart-scroll">
                {autoChart === 'bar' && (
                  <div className="bar-chart">
                    {filteredChartData.map((row, i) => (
                      <div key={`${row.group}-${row.label}`} className={`bar-col ${row.onClick ? 'clickable' : ''}`} onClick={row.onClick}
                        onMouseEnter={(e) => handleMouseEnter(e, `${row.label}: ${row.metrics[0].value}`, row.metrics[0].color)} onMouseLeave={handleMouseLeave}>
                        <div className="bar-value">{row.metrics[0].value > 100 ? row.metrics[0].value.toLocaleString() : row.metrics[0].value}</div>
                        <div className="bar-track">
                          <motion.div className="bar-fill" style={{ backgroundColor: row.metrics[0].color }} initial={{ height: 0 }}
                            whileInView={{ height: `${(row.metrics[0].value / maxVal) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }} />
                        </div>
                        <div className="bar-label">{row.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {autoChart === 'horizontal' && (
                  <div className="hbar-chart">
                    {filteredChartData.map((row, i) => (
                      <div key={`${row.group}-${row.label}`} className={`hbar-row ${row.onClick ? 'clickable' : ''}`} onClick={row.onClick}
                        onMouseEnter={(e) => handleMouseEnter(e, `${row.label}: ${row.metrics[0].value}`, row.metrics[0].color)} onMouseLeave={handleMouseLeave}>
                        <div className="hbar-label">{row.label}</div>
                        <div className="hbar-track">
                          <motion.div className="hbar-fill" style={{ backgroundColor: row.metrics[0].color }} initial={{ width: 0 }}
                            whileInView={{ width: `${(row.metrics[0].value / maxVal) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }} />
                        </div>
                        <div className="hbar-value">{row.metrics[0].value > 100 ? row.metrics[0].value.toLocaleString() : row.metrics[0].value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {autoChart === 'grouped' && (
                  <div className="grouped-chart">
                    {filteredChartData.map((row, i) => (
                      <div key={`${row.group}-${row.label}`} className={`grouped-col ${row.onClick ? 'clickable' : ''}`} onClick={row.onClick}>
                        <div className="grouped-bars">
                          {row.metrics.map((m, j) => (
                            <div key={m.key} className="grouped-bar-wrapper"
                              onMouseEnter={(e) => handleMouseEnter(e, `${m.label}: ${m.value}`, m.color)} onMouseLeave={handleMouseLeave}>
                              <div className="bar-value small">{m.value > 100 ? m.value.toLocaleString() : m.value}</div>
                              <div className="bar-track narrow">
                                <motion.div className="bar-fill" style={{ backgroundColor: m.color }} initial={{ height: 0 }}
                                  whileInView={{ height: `${(m.value / maxVal) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 + j * 0.04 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="bar-label">{row.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {autoChart === 'stacked' && (
                  <div className="hbar-chart">
                    {filteredChartData.map((row, i) => {
                      const total = row.metrics.reduce((a, b) => a + b.value, 0) || 1;
                      return (
                        <div key={`${row.group}-${row.label}`} className="hbar-row">
                          <div className="hbar-label">{row.label}</div>
                          <div className="hbar-track tall">
                            <div className="stacked-bar">
                              {row.metrics.map((m, j) => (
                                <motion.div key={m.key} className="stacked-segment" style={{ backgroundColor: m.color }} initial={{ width: 0 }}
                                  whileInView={{ width: `${(m.value / total) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 + j * 0.04 }}
                                  onMouseEnter={(e) => handleMouseEnter(e, `${m.label}: ${m.value}`, m.color)} onMouseLeave={handleMouseLeave} />
                              ))}
                            </div>
                          </div>
                          <div className="hbar-value">{total > 100 ? Math.round(total).toLocaleString() : total.toFixed(1)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {autoChart === 'line' && (
                  <div className="line-chart-wrapper">
                    <svg viewBox={`0 0 ${filteredChartData.length * 80 + 40} 210`} className="line-chart-svg">
                      {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                        <line key={frac} x1="30" y1={30 + (1 - frac) * 140} x2={filteredChartData.length * 80 + 30} y2={30 + (1 - frac) * 140} stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'} strokeWidth="1" />
                      ))}
                      {metrics.map((m, metricIdx) => {
                        const metricOffsetY = (metricIdx - (metrics.length - 1) / 2) * 4;
                        const points = filteredChartData.map((row, i) => {
                          const val = row.metrics.find(rm => rm.key === m)?.value || 0;
                          return `${50 + i * 80},${30 + (1 - val / maxVal) * 140 + metricOffsetY}`;
                        }).join(' ');
                        const getLabelOffset = (metric: Metric) => {
                          if (metric === 'births') return { dx: 0, dy: -8, anchor: 'middle' as const };
                          if (metric === 'pctCesarea') return { dx: -10, dy: -2, anchor: 'end' as const };
                          if (metric === 'pctBaixoPeso') return { dx: 10, dy: 6, anchor: 'start' as const };
                          return { dx: 0, dy: 12, anchor: 'middle' as const };
                        };
                        const offset = getLabelOffset(m);
                        return (
                          <g key={m}>
                            <polyline points={points} fill="none" stroke={metricColors[m]} strokeWidth={isLight ? "5" : "4"} strokeLinecap="round" strokeLinejoin="round" opacity={isLight ? "0.5" : "0.3"} />
                            <polyline points={points} fill="none" stroke={metricColors[m]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            {filteredChartData.map((row, i) => {
                              const val = row.metrics.find(rm => rm.key === m)?.value || 0;
                              const x = 50 + i * 80;
                              const y = 30 + (1 - val / maxVal) * 140 + metricOffsetY;
                              return (
                                <g key={i}>
                                  <circle cx={x} cy={y} r="4" fill={metricColors[m]} opacity={isLight ? "0.5" : "0.35"} />
                                  <circle cx={x} cy={y} r="2.5" fill={metricColors[m]} className={row.onClick ? 'clickable' : ''} onClick={row.onClick} />
                                  <text x={x + offset.dx} y={y + offset.dy} fill={metricColors[m]} fontSize="6" textAnchor={offset.anchor} fontWeight="700">
                                    {val > 100 ? val.toLocaleString() : val}
                                  </text>
                                </g>
                              );
                            })}
                          </g>
                        );
                      })}
                      {filteredChartData.map((row, i) => (
                        <text key={i} x={50 + i * 80} y={195} fill="var(--text-secondary)" fontSize="8" textAnchor="middle" fontWeight="600">{row.label}</text>
                      ))}
                    </svg>
                  </div>
                )}

                {autoChart === 'donut' && (
                  <div className="donut-chart-wrapper">
                    {filteredChartData.map((row) => {
                      const total = row.metrics.reduce((a, b) => a + b.value, 0) || 1;
                      let cumAngle = -90;
                      const r = 70, cx = 90, cy = 90, circumference = 2 * Math.PI * r;
                      return (
                        <div key={`${row.group}-${row.label}`} className={`donut-card ${row.onClick ? 'clickable' : ''}`} onClick={row.onClick}>
                          <svg viewBox="0 0 180 180" className="donut-svg">
                            {row.metrics.map((m) => {
                              const pct = m.value / total;
                              const dashLen = pct * circumference;
                              const dashOff = -cumAngle / 360 * circumference;
                              cumAngle += pct * 360;
                              return <circle key={m.key} cx={cx} cy={cy} r={r} fill="none" stroke={m.color} strokeWidth="22" strokeDasharray={`${dashLen} ${circumference - dashLen}`} strokeDashoffset={-dashOff} strokeLinecap="butt"
                                onMouseEnter={(e) => handleMouseEnter(e, `${m.label}: ${m.value > 100 ? Math.round(m.value).toLocaleString() : m.value}`, m.color)} onMouseLeave={handleMouseLeave} style={{ cursor: 'pointer' }} />;
                            })}
                            <text x={cx} y={cy - 6} fill="var(--text-primary)" fontSize="13" textAnchor="middle" fontWeight="800">{row.label}</text>
                            <text x={cx} y={cy + 12} fill="var(--text-secondary)" fontSize="9" textAnchor="middle">{total > 100 ? Math.round(total).toLocaleString() : total.toFixed(1)}</text>
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                )}

                {autoChart === 'table' && (
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>{t('dashboard.category')}</th>
                          {metrics.map(m => (
                            <th key={m}><span className="th-dot" style={{ background: metricColors[m] }} />{metricLabels[m][lang] || metricLabels[m]['pt']}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredChartData.map((row) => (
                          <tr key={`${row.group}-${row.label}`} className={row.onClick ? 'clickable' : ''} onClick={row.onClick}>
                            <td className="table-label">{row.label}</td>
                            {row.metrics.map(m => (
                              <td key={m.key} className="table-value" style={{ color: m.color + ' !important' }}>{m.value > 100 ? m.value.toLocaleString() : m.value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* Insight Card */}
        {hasActiveFilters && insights.length > 0 && (
          <motion.div className="insight-card cyber-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <div className="insight-header">
              <Lightbulb size={16} />
              <span className="card-label">{t('dashboard.insights')}</span>
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
      {renderTooltip()}
    </section>
  );
};

export default DashboardEnhanced;
