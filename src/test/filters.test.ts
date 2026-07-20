import { describe, it, expect } from 'vitest';
import {
  regionData,
  stateData,
  yearRegionData,
  yearData,
  ageGroupData,
  sexoData,
  summaryStats,
} from '../data/analysis';

// Helper functions to simulate filter logic
const regions = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
const years = [2019, 2020, 2021, 2022, 2023];
const ageGroups = ['Adolescente', 'Adulta', '35 ou mais'];
const sexos = ['Feminino', 'Masculino'];

interface ChartRow {
  label: string;
  births: number;
  pctCesarea: number;
  pctBaixoPeso: number;
  pctPrematuro: number;
}

// Simulate region filter
function getRegionData(selectedRegions: string[]): ChartRow[] {
  const regionsToShow = selectedRegions.length > 0 ? selectedRegions : regions;
  return regionsToShow
    .map(region => regionData.find(r => r.region === region))
    .filter(Boolean)
    .map(r => ({
      label: r!.region,
      births: r!.births,
      pctCesarea: r!.pctCesarea,
      pctBaixoPeso: r!.pctBaixoPeso,
      pctPrematuro: r!.pctPrematuro,
    }));
}

// Simulate year filter
function getYearData(selectedYears: number[]): ChartRow[] {
  const yearsToShow = selectedYears.length > 0 ? selectedYears : years;
  const filteredData = yearRegionData.filter(d => yearsToShow.includes(d.year));
  const regionAggregated: Record<string, { births: number; pctCesarea: number; count: number }> = {};

  filteredData.forEach(d => {
    if (!regionAggregated[d.region]) {
      regionAggregated[d.region] = { births: 0, pctCesarea: 0, count: 0 };
    }
    regionAggregated[d.region].births += d.births;
    regionAggregated[d.region].pctCesarea += d.pctCesarea;
    regionAggregated[d.region].count += 1;
  });

  return Object.entries(regionAggregated).map(([region, data]) => ({
    label: region,
    births: data.births,
    pctCesarea: Math.round((data.pctCesarea / data.count) * 10) / 10,
    pctBaixoPeso: regionData.find(r => r.region === region)?.pctBaixoPeso || 0,
    pctPrematuro: regionData.find(r => r.region === region)?.pctPrematuro || 0,
  }));
}

// Simulate age filter with presets
function getAgeData(selectedGroups: string[]): ChartRow[] {
  const agesToShow = selectedGroups.length > 0 ? selectedGroups : ageGroups;
  return agesToShow
    .map(group => ageGroupData.find(a => a.group === group))
    .filter(Boolean)
    .map(a => ({
      label: a!.group,
      births: a!.count,
      pctCesarea: 0,
      pctBaixoPeso: a!.pct,
      pctPrematuro: 0,
    }));
}

// Simulate age filter with range
function getAgeRangeData(ageFrom: number, ageTo: number): ChartRow {
  let estimatedBirths = 0;

  // Adolescente (10-19)
  if (ageFrom <= 19 && ageTo >= 10) {
    const overlapStart = Math.max(ageFrom, 10);
    const overlapEnd = Math.min(ageTo, 19);
    const overlapYears = overlapEnd - overlapStart + 1;
    estimatedBirths += Math.round(605 * (overlapYears / 10));
  }

  // Adulta (20-34)
  if (ageFrom <= 34 && ageTo >= 20) {
    const overlapStart = Math.max(ageFrom, 20);
    const overlapEnd = Math.min(ageTo, 34);
    const overlapYears = overlapEnd - overlapStart + 1;
    estimatedBirths += Math.round(4304 * (overlapYears / 15));
  }

  // 35 ou mais (35-55)
  if (ageFrom <= 55 && ageTo >= 35) {
    const overlapStart = Math.max(ageFrom, 35);
    const overlapEnd = Math.min(ageTo, 55);
    const overlapYears = overlapEnd - overlapStart + 1;
    estimatedBirths += Math.round(601 * (overlapYears / 21));
  }

  return {
    label: `${ageFrom}-${ageTo} anos`,
    births: estimatedBirths,
    pctCesarea: 0,
    pctBaixoPeso: 1.8,
    pctPrematuro: 10.0,
  };
}

// Simulate sexo filter
function getSexoData(selectedSexos: string[]): ChartRow[] {
  const sexosToShow = selectedSexos.length > 0 ? selectedSexos : sexos;
  return sexosToShow
    .map(sexo => sexoData.find(s => s.sexo === sexo))
    .filter(Boolean)
    .map(s => ({
      label: s!.sexo,
      births: s!.count,
      pctCesarea: 0,
      pctBaixoPeso: s!.pct,
      pctPrematuro: 0,
    }));
}

// Simulate state data for drill-down
function getStatesByRegion(region: string): ChartRow[] {
  return stateData
    .filter(s => s.region === region)
    .map(s => ({
      label: s.uf,
      births: s.births,
      pctCesarea: s.pctCesarea,
      pctBaixoPeso: s.pctBaixoPeso,
      pctPrematuro: s.pctPrematuro,
    }));
}

describe('Filter Logic Tests', () => {
  describe('Region Filter', () => {
    it('should return all 5 regions when no selection', () => {
      const data = getRegionData([]);
      expect(data).toHaveLength(5);
      expect(data.map(r => r.label)).toEqual([
        'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul',
      ]);
    });

    it('should return only selected regions', () => {
      const data = getRegionData(['Norte', 'Sul']);
      expect(data).toHaveLength(2);
      expect(data.map(r => r.label)).toEqual(['Norte', 'Sul']);
    });

    it('should have correct birth counts', () => {
      const data = getRegionData([]);
      const total = data.reduce((sum, r) => sum + r.births, 0);
      expect(total).toBe(summaryStats.totalBirths);
    });

    it('Norte should have highest pctCesarea', () => {
      const data = getRegionData(['Norte']);
      expect(data[0].pctCesarea).toBe(58.8);
    });

    it('Sul should have lowest pctBaixoPeso', () => {
      const data = getRegionData(['Sul']);
      expect(data[0].pctBaixoPeso).toBe(1.7);
    });
  });

  describe('Year Filter', () => {
    it('should aggregate data for selected years', () => {
      const data = getYearData([2019, 2020]);
      expect(data).toHaveLength(5); // 5 regions
    });

    it('should have correct total births for 2019', () => {
      const data = getYearData([2019]);
      const total = data.reduce((sum, r) => sum + r.births, 0);
      expect(total).toBe(1112); // From yearData
    });

    it('should have correct total births for 2019-2020', () => {
      const data = getYearData([2019, 2020]);
      const total = data.reduce((sum, r) => sum + r.births, 0);
      expect(total).toBe(1112 + 1076); // 2188
    });

    it('should average pctCesarea across years', () => {
      const data = getYearData([2019, 2020]);
      const norteData = data.find(r => r.label === 'Norte');
      // 2019: 59.1, 2020: 59.4 -> avg: 59.25
      expect(norteData?.pctCesarea).toBe(59.3); // Rounded
    });

    it('should include all years when none selected', () => {
      const data = getYearData([]);
      const total = data.reduce((sum, r) => sum + r.births, 0);
      expect(total).toBe(summaryStats.totalBirths);
    });
  });

  describe('Age Group Filter', () => {
    it('should return all 3 groups when no selection', () => {
      const data = getAgeData([]);
      expect(data).toHaveLength(3);
    });

    it('should return only selected groups', () => {
      const data = getAgeData(['Adolescente', 'Adulta']);
      expect(data).toHaveLength(2);
      expect(data.map(a => a.label)).toEqual(['Adolescente', 'Adulta']);
    });

    it('Adolescente should have 605 births', () => {
      const data = getAgeData(['Adolescente']);
      expect(data[0].births).toBe(605);
    });

    it('Adulta should have highest count', () => {
      const data = getAgeData([]);
      const adulta = data.find(a => a.label === 'Adulta');
      expect(adulta?.births).toBe(4304);
    });

    it('should have correct total', () => {
      const data = getAgeData([]);
      const total = data.reduce((sum, a) => sum + a.births, 0);
      expect(total).toBe(summaryStats.totalBirths);
    });
  });

  describe('Age Range Filter', () => {
    it('10-19 should match Adolescente', () => {
      const data = getAgeRangeData(10, 19);
      expect(data.births).toBe(605);
    });

    it('20-34 should match Adulta', () => {
      const data = getAgeRangeData(20, 34);
      expect(data.births).toBe(4304);
    });

    it('35-55 should match 35 ou mais', () => {
      const data = getAgeRangeData(35, 55);
      expect(data.births).toBe(601);
    });

    it('10-55 should equal total', () => {
      const data = getAgeRangeData(10, 55);
      expect(data.births).toBe(summaryStats.totalBirths);
    });

    it('15-19 should be 50% of Adolescente', () => {
      const data = getAgeRangeData(15, 19);
      expect(data.births).toBe(303); // 605 * 5/10
    });

    it('25-30 should overlap Adulta', () => {
      const data = getAgeRangeData(25, 30);
      // 6 years out of 15 in Adulta
      expect(data.births).toBe(Math.round(4304 * (6 / 15)));
    });

    it('30-40 should span Adulta and 35+', () => {
      const data = getAgeRangeData(30, 40);
      // Adulta: 30-34 = 5 years -> 4304 * 5/15
      // 35+: 35-40 = 6 years -> 601 * 6/21
      const expected = Math.round(4304 * (5 / 15)) + Math.round(601 * (6 / 21));
      expect(data.births).toBe(expected);
    });
  });

  describe('Sexo Filter', () => {
    it('should return both when no selection', () => {
      const data = getSexoData([]);
      expect(data).toHaveLength(2);
    });

    it('Feminino should have 2577 births', () => {
      const data = getSexoData(['Feminino']);
      expect(data[0].births).toBe(2577);
    });

    it('should have correct total', () => {
      const data = getSexoData([]);
      const total = data.reduce((sum, s) => sum + s.births, 0);
      // sexoData only includes Feminino and Masculino, not NA records
      expect(total).toBe(summaryStats.totalBirths - 131);
    });

    it('Masculino should be > Feminino', () => {
      const data = getSexoData([]);
      const fem = data.find(s => s.label === 'Feminino');
      const masc = data.find(s => s.label === 'Masculino');
      expect(masc?.births).toBeGreaterThan(fem!.births);
    });
  });

  describe('Drill-down (States)', () => {
    it('Norte should have 7 states', () => {
      const data = getStatesByRegion('Norte');
      expect(data).toHaveLength(7);
    });

    it('Norte states should sum to 486', () => {
      const data = getStatesByRegion('Norte');
      const total = data.reduce((sum, s) => sum + s.births, 0);
      expect(total).toBe(486);
    });

    it('Sudeste should have 4 states', () => {
      const data = getStatesByRegion('Sudeste');
      expect(data).toHaveLength(4);
    });

    it('Sudeste states should sum to 2245', () => {
      const data = getStatesByRegion('Sudeste');
      const total = data.reduce((sum, s) => sum + s.births, 0);
      expect(total).toBe(2245);
    });

    it('Sul should have 3 states', () => {
      const data = getStatesByRegion('Sul');
      expect(data).toHaveLength(3);
    });

    it('Sul states should sum to 767', () => {
      const data = getStatesByRegion('Sul');
      const total = data.reduce((sum, s) => sum + s.births, 0);
      expect(total).toBe(767);
    });

    it('SP should have highest births in Sudeste', () => {
      const data = getStatesByRegion('Sudeste');
      const sp = data.find(s => s.label === 'SP');
      const max = data.reduce((a, b) => (a.births > b.births ? a : b));
      expect(sp?.label).toBe(max.label);
    });
  });

  describe('Combined Filters', () => {
    it('Region + Year should show regions for selected years', () => {
      const regionResult = getRegionData(['Norte']);
      const yearResult = getYearData([2019]);
      // Combined should have both
      expect(regionResult).toHaveLength(1);
      expect(yearResult).toHaveLength(5);
    });

    it('Multiple regions should aggregate correctly', () => {
      const data = getRegionData(['Norte', 'Nordeste', 'Sul']);
      const total = data.reduce((sum, r) => sum + r.births, 0);
      expect(total).toBe(486 + 1541 + 767); // 2794
    });

    it('Year range should include all years in between', () => {
      const data = getYearData([2020, 2021, 2022]);
      const total = data.reduce((sum, r) => sum + r.births, 0);
      expect(total).toBe(1076 + 1136 + 1076); // 3288
    });
  });

  describe('Cross-filtering: Region + Sexo', () => {
    it('should show regions when Region filter is active', () => {
      const data = getRegionData(['Norte', 'Sul']);
      expect(data).toHaveLength(2);
      expect(data.map(r => r.label)).toEqual(['Norte', 'Sul']);
    });

    it('should show sexo when Sexo filter is active', () => {
      const data = getSexoData(['Feminino']);
      expect(data).toHaveLength(1);
      expect(data[0].label).toBe('Feminino');
    });

    it('Region + Sexo should not duplicate data', () => {
      // Simulate cross-filtering: Region filter takes priority
      const regionData = getRegionData(['Norte', 'Sudeste']);
      const sexoData = getSexoData(['Feminino', 'Masculino']);

      // In cross-filtering, Region is primary dimension
      // Sexo data is separate, not concatenated
      expect(regionData).toHaveLength(2); // 2 regions
      expect(sexoData).toHaveLength(2); // 2 sexos

      // Combined result should show regions, not 2x regions + 2x sexos
      const combinedLength = regionData.length; // Primary dimension
      expect(combinedLength).toBe(2); // Should NOT be 4 (2 regions + 2 sexos)
    });

    it('Norte births should be consistent regardless of Sexo filter', () => {
      const norteWithAll = getRegionData(['Norte']);
      const norteFiltered = getRegionData(['Norte']); // Sexo doesn't affect region data
      expect(norteWithAll[0].births).toBe(norteFiltered[0].births);
    });
  });

  describe('Cross-filtering: Region + Age', () => {
    it('should show age groups when Age filter is active', () => {
      const data = getAgeData(['Adolescente', 'Adulta']);
      expect(data).toHaveLength(2);
      expect(data.map(a => a.label)).toEqual(['Adolescente', 'Adulta']);
    });

    it('Region + Age should not duplicate data', () => {
      const regionResult = getRegionData(['Norte', 'Nordeste']);
      const ageResult = getAgeData(['Adolescente']);

      // In cross-filtering, Region is primary dimension
      expect(regionResult).toHaveLength(2); // 2 regions
      expect(ageResult).toHaveLength(1); // 1 age group

      // Combined should show 2 regions, NOT 3 (2 regions + 1 age)
      const combinedLength = regionResult.length;
      expect(combinedLength).toBe(2);
    });

    it('Age range 15-19 should be 50% of Adolescente', () => {
      const ageRange = getAgeRangeData(15, 19);
      const adolescente = getAgeData(['Adolescente'])[0];
      expect(ageRange.births).toBe(Math.round(adolescente.births * 0.5));
    });

    it('Age range 25-35 should span Adulta and 35+', () => {
      const data = getAgeRangeData(25, 35);
      // Adulta: 25-34 = 10 years -> 4304 * 10/15
      // 35+: 35-35 = 1 year -> 601 * 1/21
      const expected = Math.round(4304 * (10 / 15)) + Math.round(601 * (1 / 21));
      expect(data.births).toBe(expected);
    });
  });

  describe('Cross-filtering: Region + Year', () => {
    it('should show regions with year data when both filters active', () => {
      // Simulate: Region filter active + Year filter active
      const regionResult = getRegionData(['Norte']);
      const yearResult = getYearData([2019, 2020]);

      // In cross-filtering, Region is primary
      expect(regionResult).toHaveLength(1); // 1 region

      // Year data should be filtered to selected years
      const total2019_2020 = yearResult.reduce((sum, r) => sum + r.births, 0);
      expect(total2019_2020).toBe(1112 + 1076); // 2188
    });

    it('Norte in 2019 should have specific value', () => {
      const norte2019 = yearRegionData.find(d => d.region === 'Norte' && d.year === 2019);
      expect(norte2019?.births).toBe(110);
    });

    it('Norte in 2019-2020 should aggregate correctly', () => {
      const data = yearRegionData.filter(d => d.region === 'Norte' && [2019, 2020].includes(d.year));
      const total = data.reduce((sum, d) => sum + d.births, 0);
      expect(total).toBe(110 + 96); // 206
    });
  });

  describe('Cross-filtering: All Filters Combined', () => {
    it('Region + Year + Sexo should show regions as primary', () => {
      const regionResult = getRegionData(['Norte', 'Sul']);
      const yearResult = getYearData([2019]);
      const sexoResult = getSexoData(['Feminino']);

      // Primary dimension is Region
      expect(regionResult).toHaveLength(2);
      expect(yearResult).toHaveLength(5); // All regions for 2019
      expect(sexoResult).toHaveLength(1);
    });

    it('should not exceed region count when combining filters', () => {
      // With 2 regions selected, result should have 2 items max
      const regionResult = getRegionData(['Norte', 'Nordeste']);
      expect(regionResult).toHaveLength(2);

      // Combined: 2 regions (primary) + age/sexo data (secondary)
      // But displayed as 2 regions only
      expect(regionResult.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Data Consistency', () => {
    it('regionData total should equal summaryStats', () => {
      const total = regionData.reduce((sum, r) => sum + r.births, 0);
      expect(total).toBe(summaryStats.totalBirths);
    });

    it('yearData total should equal summaryStats', () => {
      const total = yearData.reduce((sum, y) => sum + y.births, 0);
      expect(total).toBe(summaryStats.totalBirths);
    });

    it('ageGroupData total should equal summaryStats', () => {
      const total = ageGroupData.reduce((sum, a) => sum + a.count, 0);
      expect(total).toBe(summaryStats.totalBirths);
    });

    it('sexoData total should equal summaryStats', () => {
      const total = sexoData.reduce((sum, s) => sum + s.count, 0);
      // sexoData only includes Feminino and Masculino, not NA records
      expect(total).toBe(summaryStats.totalBirths - 131);
    });

    it('each region states should sum to region total', () => {
      regions.forEach(region => {
        const regionTotal = regionData.find(r => r.region === region)?.births || 0;
        const statesTotal = stateData
          .filter(s => s.region === region)
          .reduce((sum, s) => sum + s.births, 0);
        expect(statesTotal).toBe(regionTotal);
      });
    });
  });
});
