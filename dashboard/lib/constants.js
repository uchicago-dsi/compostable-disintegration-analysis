export function invertDictionary(dict) {
  return Object.fromEntries(
    Object.entries(dict).map(([key, value]) => [value, key])
  );
}

export const moistureFilterDict = {
  "<40%": [-Infinity, 0.4, false],
  "40-45%": [0.4, 0.45, true],
  "45-50%": [0.45, 0.5, true],
  "50-55%": [0.5, 0.55, true],
  "55-60%": [0.55, 0.6, true],
  ">60%": [0.6, Infinity, false],
};

export const temperatureFilterDict = {
  "<140F": [-Infinity, 140, false],
  "140-150F": [140, 150, true],
  "150-160F": [150, 160, true],
  ">160F": [160, Infinity, false],
};

export const trialDurationDict = {
  "40-59 Days": [40, 59, true],
  "60-90 Days": [59, 89, true],
  "90+ Days": [89, Infinity, false],
};

export const material2col = {
  "High-Level Material Categories": "Material Class I",
  "Generic Material Categories": "Material Class II",
  "Specific Material Categories": "Material Class III",
  "Item Types": "Item Format",
};

export const col2material = invertDictionary(material2col);

export const residuals2col = {
  "Residuals Remaining": "Residuals",
  "Percent Disintegrated": "Disintegrated",
};

export const display2col = {
  "Results by Mass": "% Residuals (Mass)",
  "Results by Surface Area": "% Residuals (Area)",
};

export const class2color = {
  "Positive Control": "#70AD47",
  "Mixed Materials": "#48646A",
  Fiber: "#298FC2",
  Biopolymer: "#FFB600",
};