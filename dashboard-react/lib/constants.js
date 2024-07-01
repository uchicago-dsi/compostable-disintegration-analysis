export const moistureFilterDict = {
    "<40%": [-Infinity, 0.4, false],
    "40-45%": [0.4, 0.45, true],
    "45-50%": [0.45, 0.50, true],
    "50-55%": [0.50, 0.55, true],
    "55-60%": [0.55, 0.60, true],
    ">60%": [0.60, Infinity, false],
  };

export const temperatureFilterDict = {
    "<140F": [-Infinity, 140, false],
    "140-150F": [140, 150, true],
    "150-160F": [150, 160, true],
    ">160F": [160, Infinity, false],
}

export const trialDurationDict = {
    "30-45 Days": [30, 45, true],
    "45-75 Days": [45, 75, true],
    ">75 Days": [75, Infinity, false],
}

export const selection2material = {
    "High-Level Material Categories": "Material Class I",
    "Generic Material Categories": "Material Class II",
    "Specific Material Categories": "Material Class III",
    "Item Types": "Item Format",
}