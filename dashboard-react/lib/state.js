"use client";
import { proxy } from "valtio";

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
    // Filters
    selectedTechnologies: [],
    selectedTestMethods: [],
    selectedMoistureLevels: [],
    selectedTemperatureLevels: [],
  },

  setFilterValue: (key, value) => {
    state.filters[key] = value;
  },
});

export default state;