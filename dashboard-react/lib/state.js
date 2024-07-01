"use client";
import { proxy } from "valtio";
import { moistureFilterDict, temperatureFilterDict, trialDurationDict } from "@/lib/constants";

const state = proxy({
  data: [],

  setData: (newData) => {
    state.data = newData;
  },

  // TODO: I don't like this name...
  options: {},

  setOptions: (key, newOptions) => {
    state.options[key] = newOptions;
  },

  filters: {
    // Display options
    aggCol: 'Material Class I',
    displayCol: '% Residuals (Mass)',
    uncapResults: false,
    displayResiduals: "Residuals",
    // Trial filters
    selectedTechnologies: [],
    selectedTestMethods: [],
    selectedMaterialTypes: [],
    // Operating conditions filters
    selectedMoistureLevels: Object.keys(moistureFilterDict),
    selectedTemperatureLevels: Object.keys(temperatureFilterDict),
    selectedTrialDurations: Object.keys(trialDurationDict),
    initialized: false
  },

  setFilterValue: (key, value) => {
    state.filters[key] = value;
  },
});

export default state;