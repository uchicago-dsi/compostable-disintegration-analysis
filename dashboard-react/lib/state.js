"use client";
import { proxy, subscribe } from "valtio";
import {
  moistureFilterDict,
  temperatureFilterDict,
  trialDurationDict,
} from "@/lib/constants";

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
    aggCol: "Material Class I",
    displayCol: "% Residuals (Mass)",
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
    initialized: false,
  },

  setFilterValue: (key, value) => {
    state.filters[key] = value;
  },

  expandedMenu: null,

  setExpandedMenu: (menu) => {
    if (state.expandedMenu !== menu) {
      state.expandedMenu = menu;
    }
  },
});

const fetchData = async () => {
  let url = new URL("/api/data", window.location.origin);
  let params = new URLSearchParams(url.search);
  // Display options
  params.append("aggcol", state.filters.aggCol);
  params.append("displaycol", state.filters.displayCol);
  params.append("uncapresults", state.filters.uncapResults);
  params.append(
    "displayresiduals",
    state.filters.displayResiduals === "Residuals" ? true : false
  );
  // Trial & item filters
  params.append("testmethods", state.filters.selectedTestMethods.join(","));
  params.append("technologies", state.filters.selectedTechnologies.join(","));
  params.append("materials", state.filters.selectedMaterialTypes.join(","));
  // Operating conditions filters
  params.append(
    "temperature",
    state.filters.selectedTemperatureLevels.join(",")
  );
  params.append("moisture", state.filters.selectedMoistureLevels.join(","));
  params.append(
    "trialdurations",
    state.filters.selectedTrialDurations.join(",")
  );

  url.search = params.toString();
  console.log(params.toString());

  try {
    const response = await fetch(url);
    const result = await response.json();
    state.setData(result);
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
};

subscribe(state.filters, fetchData);

export default state;
