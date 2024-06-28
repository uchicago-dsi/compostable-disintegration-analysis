"use client";
import { proxy } from "valtio";

const state = proxy({
  data: [],

  setData: (newData) => {
    state.data = newData;
  },

  options: {},

  setOptions: (key, newOptions) => {
    state.options[key] = newOptions;
  },

  filters: {
    aggCol: 'Material Class I',
    displayCol: '% Residuals (Mass)',
    selectedTechnologies: [],
    selectedTestMethods: [],
    selectedMoistureLevels: [],
  },

  setFilterValue: (key, value) => {
    state.filters[key] = value;
  },
});

export default state;