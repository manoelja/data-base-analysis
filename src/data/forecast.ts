// Auto-gerado por ml/export_forecast.py — NÃO editar manualmente.
// Projeção top-down 2024-2025 (método em ml/PROJECAO_TECH_DESIGN.md):
// total OLS + participações ancoradas + reconciliação + intervalo 95%.

export type ForecastDimension = 'total' | 'regiao' | 'faixa_etaria' | 'sexo';

export interface ForecastPoint {
  year: number;
  value: number;
}

export interface ProjectionPoint {
  year: number;
  value: number;
  lo: number;
  hi: number;
}

export interface ForecastSeries {
  id: string;
  dimension: ForecastDimension;
  label: string;
  history: ForecastPoint[];
  projection: ProjectionPoint[];
  shareHistory?: ForecastPoint[];
  shareProjection?: ProjectionPoint[];
  slopePp?: number;
  pValue?: number;
}

export interface ForecastHighlights {
  id: string;
  direction: 'up' | 'down';
  slopePp: number;
  pValue: number;
}

export interface ForecastValidation {
  totalHoldout: { predicted: number; actual: number; errorPct: number };
  shareMaePp: Record<Exclude<ForecastDimension, 'total'>, number>;
}

export const forecastData: {
  total: ForecastSeries;
  regiao: ForecastSeries[];
  faixaEtaria: ForecastSeries[];
  sexo: ForecastSeries[];
  highlights: ForecastHighlights[];
  validation: ForecastValidation;
} = {
  total: {
  "id": "total",
  "dimension": "total",
  "label": "Total",
  "history": [
    {
      "year": 2019,
      "value": 1112
    },
    {
      "year": 2020,
      "value": 1076
    },
    {
      "year": 2021,
      "value": 1136
    },
    {
      "year": 2022,
      "value": 1076
    },
    {
      "year": 2023,
      "value": 1110
    }
  ],
  "projection": [
    {
      "year": 2024,
      "value": 1100.8,
      "lo": 963.2,
      "hi": 1238.4
    },
    {
      "year": 2025,
      "value": 1100.4,
      "lo": 941.5,
      "hi": 1259.3
    }
  ]
},
  regiao: [
  {
    "id": "regiao_centro_oeste",
    "dimension": "regiao",
    "label": "Centro-Oeste",
    "history": [
      {
        "year": 2019,
        "value": 91
      },
      {
        "year": 2020,
        "value": 96
      },
      {
        "year": 2021,
        "value": 98
      },
      {
        "year": 2022,
        "value": 96
      },
      {
        "year": 2023,
        "value": 90
      }
    ],
    "projection": [
      {
        "year": 2024,
        "value": 89.1,
        "lo": 63.6,
        "hi": 114.5
      },
      {
        "year": 2025,
        "value": 88.9,
        "lo": 59.5,
        "hi": 118.3
      }
    ],
    "shareHistory": [
      {
        "year": 2019,
        "value": 8.18
      },
      {
        "year": 2020,
        "value": 8.92
      },
      {
        "year": 2021,
        "value": 8.63
      },
      {
        "year": 2022,
        "value": 8.92
      },
      {
        "year": 2023,
        "value": 8.11
      }
    ],
    "shareProjection": [
      {
        "year": 2024,
        "value": 8.09,
        "lo": 6.01,
        "hi": 10.17
      },
      {
        "year": 2025,
        "value": 8.08,
        "lo": 5.68,
        "hi": 10.48
      }
    ],
    "slopePp": -0.015,
    "pValue": 0.923
  },
  {
    "id": "regiao_nordeste",
    "dimension": "regiao",
    "label": "Nordeste",
    "history": [
      {
        "year": 2019,
        "value": 316
      },
      {
        "year": 2020,
        "value": 283
      },
      {
        "year": 2021,
        "value": 352
      },
      {
        "year": 2022,
        "value": 308
      },
      {
        "year": 2023,
        "value": 282
      }
    ],
    "projection": [
      {
        "year": 2024,
        "value": 275.6,
        "lo": 147.5,
        "hi": 403.7
      },
      {
        "year": 2025,
        "value": 271.4,
        "lo": 123.7,
        "hi": 419.1
      }
    ],
    "shareHistory": [
      {
        "year": 2019,
        "value": 28.42
      },
      {
        "year": 2020,
        "value": 26.3
      },
      {
        "year": 2021,
        "value": 30.99
      },
      {
        "year": 2022,
        "value": 28.62
      },
      {
        "year": 2023,
        "value": 25.41
      }
    ],
    "shareProjection": [
      {
        "year": 2024,
        "value": 25.04,
        "lo": 13.83,
        "hi": 36.24
      },
      {
        "year": 2025,
        "value": 24.67,
        "lo": 11.73,
        "hi": 37.61
      }
    ],
    "slopePp": -0.37,
    "pValue": 0.663
  },
  {
    "id": "regiao_norte",
    "dimension": "regiao",
    "label": "Norte",
    "history": [
      {
        "year": 2019,
        "value": 110
      },
      {
        "year": 2020,
        "value": 96
      },
      {
        "year": 2021,
        "value": 100
      },
      {
        "year": 2022,
        "value": 87
      },
      {
        "year": 2023,
        "value": 93
      }
    ],
    "projection": [
      {
        "year": 2024,
        "value": 88.0,
        "lo": 66.4,
        "hi": 109.6
      },
      {
        "year": 2025,
        "value": 83.7,
        "lo": 59.1,
        "hi": 108.3
      }
    ],
    "shareHistory": [
      {
        "year": 2019,
        "value": 9.89
      },
      {
        "year": 2020,
        "value": 8.92
      },
      {
        "year": 2021,
        "value": 8.8
      },
      {
        "year": 2022,
        "value": 8.09
      },
      {
        "year": 2023,
        "value": 8.38
      }
    ],
    "shareProjection": [
      {
        "year": 2024,
        "value": 7.99,
        "lo": 6.3,
        "hi": 9.68
      },
      {
        "year": 2025,
        "value": 7.61,
        "lo": 5.66,
        "hi": 9.55
      }
    ],
    "slopePp": -0.386,
    "pValue": 0.044
  },
  {
    "id": "regiao_sudeste",
    "dimension": "regiao",
    "label": "Sudeste",
    "history": [
      {
        "year": 2019,
        "value": 434
      },
      {
        "year": 2020,
        "value": 451
      },
      {
        "year": 2021,
        "value": 431
      },
      {
        "year": 2022,
        "value": 447
      },
      {
        "year": 2023,
        "value": 482
      }
    ],
    "projection": [
      {
        "year": 2024,
        "value": 487.3,
        "lo": 365.6,
        "hi": 608.9
      },
      {
        "year": 2025,
        "value": 496.4,
        "lo": 355.3,
        "hi": 637.4
      }
    ],
    "shareHistory": [
      {
        "year": 2019,
        "value": 39.03
      },
      {
        "year": 2020,
        "value": 41.91
      },
      {
        "year": 2021,
        "value": 37.94
      },
      {
        "year": 2022,
        "value": 41.54
      },
      {
        "year": 2023,
        "value": 43.42
      }
    ],
    "shareProjection": [
      {
        "year": 2024,
        "value": 44.27,
        "lo": 34.7,
        "hi": 53.83
      },
      {
        "year": 2025,
        "value": 45.11,
        "lo": 34.06,
        "hi": 56.15
      }
    ],
    "slopePp": 0.842,
    "pValue": 0.289
  },
  {
    "id": "regiao_sul",
    "dimension": "regiao",
    "label": "Sul",
    "history": [
      {
        "year": 2019,
        "value": 161
      },
      {
        "year": 2020,
        "value": 150
      },
      {
        "year": 2021,
        "value": 155
      },
      {
        "year": 2022,
        "value": 138
      },
      {
        "year": 2023,
        "value": 163
      }
    ],
    "projection": [
      {
        "year": 2024,
        "value": 160.9,
        "lo": 113.7,
        "hi": 208.1
      },
      {
        "year": 2025,
        "value": 160.0,
        "lo": 105.6,
        "hi": 214.5
      }
    ],
    "shareHistory": [
      {
        "year": 2019,
        "value": 14.48
      },
      {
        "year": 2020,
        "value": 13.94
      },
      {
        "year": 2021,
        "value": 13.64
      },
      {
        "year": 2022,
        "value": 12.83
      },
      {
        "year": 2023,
        "value": 14.68
      }
    ],
    "shareProjection": [
      {
        "year": 2024,
        "value": 14.61,
        "lo": 10.74,
        "hi": 18.49
      },
      {
        "year": 2025,
        "value": 14.54,
        "lo": 10.07,
        "hi": 19.02
      }
    ],
    "slopePp": -0.07,
    "pValue": 0.809
  }
],
  faixaEtaria: [
  {
    "id": "faixa_etaria_adolescente",
    "dimension": "faixa_etaria",
    "label": "Adolescente",
    "history": [
      {
        "year": 2019,
        "value": 125
      },
      {
        "year": 2020,
        "value": 107
      },
      {
        "year": 2021,
        "value": 117
      },
      {
        "year": 2022,
        "value": 112
      },
      {
        "year": 2023,
        "value": 144
      }
    ],
    "projection": [
      {
        "year": 2024,
        "value": 147.1,
        "lo": 83.2,
        "hi": 211.0
      },
      {
        "year": 2025,
        "value": 151.4,
        "lo": 77.5,
        "hi": 225.3
      }
    ],
    "shareHistory": [
      {
        "year": 2019,
        "value": 11.24
      },
      {
        "year": 2020,
        "value": 9.94
      },
      {
        "year": 2021,
        "value": 10.3
      },
      {
        "year": 2022,
        "value": 10.41
      },
      {
        "year": 2023,
        "value": 12.97
      }
    ],
    "shareProjection": [
      {
        "year": 2024,
        "value": 13.37,
        "lo": 7.81,
        "hi": 18.92
      },
      {
        "year": 2025,
        "value": 13.76,
        "lo": 7.34,
        "hi": 20.18
      }
    ],
    "slopePp": 0.393,
    "pValue": 0.379
  },
  {
    "id": "faixa_etaria_adulta",
    "dimension": "faixa_etaria",
    "label": "Adulta",
    "history": [
      {
        "year": 2019,
        "value": 848
      },
      {
        "year": 2020,
        "value": 840
      },
      {
        "year": 2021,
        "value": 907
      },
      {
        "year": 2022,
        "value": 846
      },
      {
        "year": 2023,
        "value": 863
      }
    ],
    "projection": [
      {
        "year": 2024,
        "value": 859.7,
        "lo": 731.9,
        "hi": 987.5
      },
      {
        "year": 2025,
        "value": 863.3,
        "lo": 715.3,
        "hi": 1011.4
      }
    ],
    "shareHistory": [
      {
        "year": 2019,
        "value": 76.26
      },
      {
        "year": 2020,
        "value": 78.07
      },
      {
        "year": 2021,
        "value": 79.84
      },
      {
        "year": 2022,
        "value": 78.62
      },
      {
        "year": 2023,
        "value": 77.75
      }
    ],
    "shareProjection": [
      {
        "year": 2024,
        "value": 78.1,
        "lo": 71.82,
        "hi": 84.39
      },
      {
        "year": 2025,
        "value": 78.45,
        "lo": 71.2,
        "hi": 85.71
      }
    ],
    "slopePp": 0.354,
    "pValue": 0.472
  },
  {
    "id": "faixa_etaria_35_ou_mais",
    "dimension": "faixa_etaria",
    "label": "35 ou mais",
    "history": [
      {
        "year": 2019,
        "value": 139
      },
      {
        "year": 2020,
        "value": 129
      },
      {
        "year": 2021,
        "value": 112
      },
      {
        "year": 2022,
        "value": 118
      },
      {
        "year": 2023,
        "value": 103
      }
    ],
    "projection": [
      {
        "year": 2024,
        "value": 93.9,
        "lo": 52.0,
        "hi": 135.9
      },
      {
        "year": 2025,
        "value": 85.7,
        "lo": 37.6,
        "hi": 133.8
      }
    ],
    "shareHistory": [
      {
        "year": 2019,
        "value": 12.5
      },
      {
        "year": 2020,
        "value": 11.99
      },
      {
        "year": 2021,
        "value": 9.86
      },
      {
        "year": 2022,
        "value": 10.97
      },
      {
        "year": 2023,
        "value": 9.28
      }
    ],
    "shareProjection": [
      {
        "year": 2024,
        "value": 8.53,
        "lo": 4.87,
        "hi": 12.19
      },
      {
        "year": 2025,
        "value": 7.79,
        "lo": 3.56,
        "hi": 12.01
      }
    ],
    "slopePp": -0.746,
    "pValue": 0.059
  }
],
  sexo: [
  {
    "id": "sexo_feminino",
    "dimension": "sexo",
    "label": "Feminino",
    "history": [
      {
        "year": 2019,
        "value": 547
      },
      {
        "year": 2020,
        "value": 510
      },
      {
        "year": 2021,
        "value": 500
      },
      {
        "year": 2022,
        "value": 470
      },
      {
        "year": 2023,
        "value": 550
      }
    ],
    "projection": [
      {
        "year": 2024,
        "value": 556.4,
        "lo": 375.0,
        "hi": 737.8
      },
      {
        "year": 2025,
        "value": 553.0,
        "lo": 343.8,
        "hi": 762.2
      }
    ],
    "shareHistory": [
      {
        "year": 2019,
        "value": 50.41
      },
      {
        "year": 2020,
        "value": 48.53
      },
      {
        "year": 2021,
        "value": 44.96
      },
      {
        "year": 2022,
        "value": 44.8
      },
      {
        "year": 2023,
        "value": 50.83
      }
    ],
    "shareProjection": [
      {
        "year": 2024,
        "value": 50.54,
        "lo": 35.32,
        "hi": 65.76
      },
      {
        "year": 2025,
        "value": 50.25,
        "lo": 32.68,
        "hi": 67.83
      }
    ],
    "slopePp": -0.289,
    "pValue": 0.8
  },
  {
    "id": "sexo_masculino",
    "dimension": "sexo",
    "label": "Masculino",
    "history": [
      {
        "year": 2019,
        "value": 538
      },
      {
        "year": 2020,
        "value": 541
      },
      {
        "year": 2021,
        "value": 612
      },
      {
        "year": 2022,
        "value": 579
      },
      {
        "year": 2023,
        "value": 532
      }
    ],
    "projection": [
      {
        "year": 2024,
        "value": 544.4,
        "lo": 363.6,
        "hi": 725.3
      },
      {
        "year": 2025,
        "value": 547.4,
        "lo": 338.5,
        "hi": 756.3
      }
    ],
    "shareHistory": [
      {
        "year": 2019,
        "value": 49.59
      },
      {
        "year": 2020,
        "value": 51.47
      },
      {
        "year": 2021,
        "value": 55.04
      },
      {
        "year": 2022,
        "value": 55.2
      },
      {
        "year": 2023,
        "value": 49.17
      }
    ],
    "shareProjection": [
      {
        "year": 2024,
        "value": 49.46,
        "lo": 34.24,
        "hi": 64.68
      },
      {
        "year": 2025,
        "value": 49.75,
        "lo": 32.17,
        "hi": 67.32
      }
    ],
    "slopePp": 0.289,
    "pValue": 0.8
  }
],
  highlights: [
  {
    "id": "regiao_norte",
    "direction": "down",
    "slopePp": -0.386,
    "pValue": 0.044
  },
  {
    "id": "faixa_etaria_35_ou_mais",
    "direction": "down",
    "slopePp": -0.746,
    "pValue": 0.059
  }
],
  validation: {
  "totalHoldout": {
    "predicted": 1088.0,
    "actual": 1110,
    "errorPct": -2.0
  },
  "shareMaePp": {
    "regiao": 1.9,
    "faixa_etaria": 1.85,
    "sexo": 8.07
  }
},
};
