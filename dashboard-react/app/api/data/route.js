import { NextResponse } from 'next/server';
import * as d3 from 'd3';
import path from 'path';
import fs from 'fs/promises';
import { moistureFilterDict, temperatureFilterDict, trialDurationDict } from '@/lib/constants';

const trialDataPath = path.join(process.cwd(), 'public', 'data', 'all_trials_processed.csv');
const operatingConditionsPath = path.join(process.cwd(), 'public', 'data', 'operating_conditions.csv');

const fetchData = async (dataPath) => {
  const data = await fs.readFile(dataPath, 'utf8');
  return d3.csvParse(data);
};

const calculateQuartiles = (data, key) => {
  const sorted = data.map(d => parseFloat(d[key])).sort((a, b) => a - b);
  return {
    min: d3.min(sorted),
    q1: d3.quantile(sorted, 0.25),
    median: d3.quantile(sorted, 0.5),
    q3: d3.quantile(sorted, 0.75),
    max: d3.max(sorted),
  };
};

const getFilteredTrialIDs = (data, column, low, high, inclusive) => {
  return data.filter(trial => {
    const value = parseFloat(trial[column]);
    console.log("value")
    console.log(value)
    if (inclusive) {
      return value >= low && value <= high;
    }
    return value > low && value < high;
  }).map(trial => trial['Trial ID']);
};

const filterTrialIDsByConditions = (column, filters, conditions, filterDict) => {
  const trialIDs = new Set();
  console.log("filters")
  console.log(filters)
  filters.forEach(filter => {
    if (!filter.includes('All')) {
        const [low, high, inclusive] = filterDict[filter];
        console.log("low")
        console.log(low)
        const filteredTrialIDs = getFilteredTrialIDs(conditions, column, low, high, inclusive);
        filteredTrialIDs.forEach(id => trialIDs.add(id));
    }
  });
  return Array.from(trialIDs);
};

const filterData = (data, column, conditions) => {
  if (conditions.some(condition => condition.includes('All'))) {
    console.log("all")
    return data;
  }
  console.log("conditions")
  console.log(conditions)
  return data.filter(row => conditions.some(condition => row[column] === condition));
}

const prepareData = async (searchParams) => {
  console.log("searchParams")
  console.log(searchParams)
  const aggCol = searchParams.get('aggcol') || 'Material Class I';
  const displayCol = searchParams.get('displaycol') || '% Residuals (Mass)';
  const uncapResults = searchParams.get('uncapresults') === 'true' || false;
  // TODO: Clean up the handling of defaults
  const testMethods = searchParams.get('testmethods') ? searchParams.get('testmethods').split(',') : ['All Test Methods'];
  const technologies = searchParams.get('technologies') ? searchParams.get('technologies').split(',') : ['All Technologies'];

  // Operating conditions filters
  const temperatureFilter = searchParams.get('temperature') ? searchParams.get('temperature').split(',') : ['All Temperatures'];
  const moistureFilter = searchParams.get('moisture') ? searchParams.get('moisture').split(',') : ['All Moistures'];
  const trialDurations = searchParams.get('trialdurations') ? searchParams.get('trialdurations').split(',') : ['All Durations'];

  const trialData = await fetchData(trialDataPath);
  const operatingConditions = await fetchData(operatingConditionsPath);

  var filteredData = [...trialData];

  filteredData = filterData(filteredData, 'Test Method', testMethods);
  filteredData = filterData(filteredData, 'Technology', technologies);
  
  if (!uncapResults) {
    filteredData = filteredData.map(d => {
      if (d[displayCol] > 1) {
        d[displayCol] = 1;
      }
      return d;
    });
  }

  const moistureTrialIDs = filterTrialIDsByConditions('Average % Moisture (In Field)', moistureFilter, operatingConditions, moistureFilterDict);
  const temperatureTrialIDs = filterTrialIDsByConditions('Average Temperature (F)', temperatureFilter, operatingConditions, temperatureFilterDict);
  const trialDurationTrialIDs = filterTrialIDsByConditions('Trial Duration', trialDurations, operatingConditions, trialDurationDict);

  const combinedTrialIDs = Array.from(new Set([...moistureTrialIDs, ...temperatureTrialIDs, ...trialDurationTrialIDs]));

  console.log("combinedTrialIDs")
  console.log(combinedTrialIDs)

  // TODO: Handle filtering difference between no results and unfiltered data
  if (combinedTrialIDs.length > 0) {
    filteredData = filteredData.filter(d => combinedTrialIDs.includes(d['Trial ID']));
  }

  const grouped = d3.groups(filteredData, d => d[aggCol]);
  return grouped.map(([key, values]) => ({
    aggCol: key,
    ...calculateQuartiles(values, displayCol),
  }));
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const data = await prepareData(searchParams);
  return NextResponse.json(data);
}