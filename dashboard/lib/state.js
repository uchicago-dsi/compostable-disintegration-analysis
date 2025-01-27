"use client";
import { proxy, subscribe } from "valtio";
import {
  moistureFilterDict,
  temperatureFilterDict,
  trialDurationDict,
} from "@/lib/constants";

const state = proxy({
  data: [],
  dataLoaded: false,

  setData: (newData) => {
    state.data = newData;
    state.dataLoaded = true;
  },

  // TODO: I don't like this name...
  options: {},

  setOptions: (key, newOptions) => {
    state.options[key] = newOptions;
  },

  errorMessage: "",

  setErrorMessage: (message) => {
    console.log("setting error message");
    console.log(message);
    state.errorMessage = message;
  },

  filters: {
    // Display options
    aggCol: "Material Class I",
    displayCol: "% Residuals (Mass)",
    uncapResults: false,
    displayResiduals: "Residuals",
    testMethod: "Mesh Bag",
    timepoint: "Final",
    // Trial filters
    selectedTechnologies: [],
    selectedMaterialTypes: [],
    selectedSpecificMaterialTypes: [],
    selectedBrands: [],
    selectedFormats: [],
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
    state.expandedMenu = menu;
  },
});

const fetchData = async () => {
  let url = new URL("/api/data", window.location.origin);
  let params = new URLSearchParams(url.search);
  // Display options
  params.append("aggcol", state.filters.aggCol);
  params.append("displaycol", state.filters.displayCol);
  params.append("timepoint", state.filters.timepoint);
  params.append("uncapresults", state.filters.uncapResults);
  params.append(
    "displayresiduals",
    state.filters.displayResiduals === "Residuals" ? true : false
  );
  // Trial & item filters
  params.append("testmethod", state.filters.testMethod);
  params.append("technologies", state.filters.selectedTechnologies.join(","));
  params.append("materials", state.filters.selectedMaterialTypes.join(","));
  params.append(
    "specificMaterials",
    state.filters.selectedSpecificMaterialTypes.join(",")
  );
  params.append("brands", state.filters.selectedBrands.join(","));
  params.append("formats", state.filters.selectedFormats.join(","));
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
    const data = await response.json();
    if (data.message) {
      state.setErrorMessage(data.message);
      state.setData([]);
      return;
    } else {
      state.setErrorMessage("");
      state.setData(data);
    }
  } catch (error) {
    state.setErrorMessage("Failed to fetch data");
    console.error("Failed to fetch data:", error);
  }
};

subscribe(state.filters, fetchData);

// When filering for midpoint measurements, include all timesteps
subscribe(state.filters, (change) => {
  const timestepChange = change.find(f => f[1].includes('timepoint'))
  if (timestepChange && timestepChange[2] !== 'Final') {
    state.setFilterValue('selectedTrialDurations', Object.keys(trialDurationDict));
  }
});

export default state;
