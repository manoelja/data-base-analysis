import { describe, it, expect } from 'vitest'
import {
  regionData,
  yearData,
  ageGroupData,
  sexoData,
  summaryStats,
  cleaningStats,
  analysisResults,
  techStack,
} from '../data/analysis'

describe('analysis data', () => {
  describe('regionData', () => {
    it('should have 5 regions', () => {
      expect(regionData).toHaveLength(5)
    })

    it('each region should have required fields', () => {
      regionData.forEach((region) => {
        expect(region).toHaveProperty('region')
        expect(region).toHaveProperty('births')
        expect(region).toHaveProperty('pctCesarea')
        expect(region).toHaveProperty('pctBaixoPeso')
        expect(region).toHaveProperty('pctPrematuro')
        expect(typeof region.births).toBe('number')
        expect(typeof region.pctCesarea).toBe('number')
      })
    })

    it('total births should match summaryStats', () => {
      const totalBirths = regionData.reduce((sum, r) => sum + r.births, 0)
      expect(totalBirths).toBe(summaryStats.totalBirths)
    })
  })

  describe('yearData', () => {
    it('should have 5 years (2019-2023)', () => {
      expect(yearData).toHaveLength(5)
    })

    it('years should be sequential', () => {
      const years = yearData.map((y) => y.year)
      expect(years).toEqual([2019, 2020, 2021, 2022, 2023])
    })

    it('each year should have avgWeight', () => {
      yearData.forEach((year) => {
        expect(year).toHaveProperty('avgWeight')
        expect(year.avgWeight).toBeGreaterThan(2000)
        expect(year.avgWeight).toBeLessThan(5000)
      })
    })
  })

  describe('ageGroupData', () => {
    it('should have 3 age groups', () => {
      expect(ageGroupData).toHaveLength(3)
    })

    it('percentages should sum to ~100', () => {
      const totalPct = ageGroupData.reduce((sum, g) => sum + g.pct, 0)
      expect(totalPct).toBeCloseTo(100, 0)
    })
  })

  describe('sexoData', () => {
    it('should have 2 categories', () => {
      expect(sexoData).toHaveLength(2)
    })

    it('percentages should sum to ~100', () => {
      const totalPct = sexoData.reduce((sum, s) => sum + s.pct, 0)
      // sexoData only includes Feminino (46.8%) and Masculino (50.9%)
      // NA records (2.4%) are not in the array, so sum is ~97.7%
      expect(totalPct).toBeCloseTo(97.7, 0)
    })
  })

  describe('summaryStats', () => {
    it('should have valid totalBirths', () => {
      expect(summaryStats.totalBirths).toBeGreaterThan(0)
    })

    it('pctCesarea should be between 0 and 100', () => {
      expect(summaryStats.pctCesarea).toBeGreaterThanOrEqual(0)
      expect(summaryStats.pctCesarea).toBeLessThanOrEqual(100)
    })
  })

  describe('cleaningStats', () => {
    it('should track record removal correctly', () => {
      expect(cleaningStats.initialRecords).toBeGreaterThan(cleaningStats.finalRecords)
      expect(cleaningStats.removedRecords).toBe(
        cleaningStats.initialRecords - cleaningStats.finalRecords
      )
    })

    it('should have step details', () => {
      expect(cleaningStats.steps.length).toBeGreaterThan(0)
      cleaningStats.steps.forEach((step) => {
        expect(step).toHaveProperty('label')
        expect(step).toHaveProperty('removed')
        expect(step).toHaveProperty('reason')
      })
    })
  })

  describe('analysisResults', () => {
    it('should have 10 analysis results', () => {
      expect(analysisResults).toHaveLength(10)
    })

    it('each result should have i18n fields', () => {
      analysisResults.forEach((result) => {
        expect(result.title).toHaveProperty('pt')
        expect(result.title).toHaveProperty('en')
        expect(result.description).toHaveProperty('pt')
        expect(result.problem).toHaveProperty('pt')
        expect(result.result).toHaveProperty('pt')
        expect(result.tags.length).toBeGreaterThan(0)
      })
    })
  })

  describe('techStack', () => {
    it('should have technologies listed', () => {
      expect(techStack.length).toBeGreaterThan(0)
    })

    it('each tech should have required fields', () => {
      techStack.forEach((tech) => {
        expect(tech).toHaveProperty('name')
        expect(tech).toHaveProperty('category')
        expect(tech).toHaveProperty('detail')
        expect(tech.name.length).toBeGreaterThan(0)
      })
    })
  })
})
