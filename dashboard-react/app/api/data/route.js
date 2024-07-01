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
    if (inclusive) {
      return value >= low && value <= high;
    }
    return value > low && value < high;
  }).map(trial => trial['Trial ID']);
};

const filterTrialIDsByConditions = (column, filters, operatingConditions, filterDict) => {
  const trialIDs = new Set();
  console.log(`filtering on ${column}`)
  console.log("filters")
  console.log(filters)
  filters.forEach(filter => {
    if (filters.includes('All')) {
      operatingConditions.forEach(condition => trialIDs.add(condition['Trial ID']));
      return Array.from(trialIDs);
    }  
    else {
        const [low, high, inclusive] = filterDict[filter];
        console.log("low")
        console.log(low)
        const filteredTrialIDs = getFilteredTrialIDs(operatingConditions, column, low, high, inclusive);
        filteredTrialIDs.forEach(id => trialIDs.add(id));
    }
  });
  return trialIDs;
};

const filterData = (data, column, conditions) => {
  if (conditions.some(condition => condition.includes('All'))) {
    return data;
  }
  return data.filter(row => conditions.some(condition => row[column] === condition));
}

const getIntersectingTrialIDs = (...sets) => {
  if (sets.length === 0) return new Set();
  const [firstSet, ...restSets] = sets;
  return [...firstSet].filter(item => restSets.every(set => set.has(item)));
};

const prepareData = async (searchParams) => {
  console.log("searchParams")
  console.log(searchParams)
  // TODO: Clean up the handling of defaults
  // Display params
  const aggCol = searchParams.get('aggcol') || 'Material Class I';
  const displayCol = searchParams.get('displaycol') || '% Residuals (Mass)';
  const uncapResults = searchParams.get('uncapresults') === 'true' || false;
  const displayResiduals = searchParams.get('displayresiduals') === 'true';
  // Trial and item filters
  const testMethods = searchParams.get('testmethods') ? searchParams.get('testmethods').split(',') : ['All'];
  const technologies = searchParams.get('technologies') ? searchParams.get('technologies').split(',') : ['All'];
  const materials = searchParams.get('materials') ? searchParams.get('materials').split(',') : ['All'];
  // Operating conditions filters
  const temperatureFilter = searchParams.get('temperature') ? searchParams.get('temperature').split(',') : ['All'];
  const moistureFilter = searchParams.get('moisture') ? searchParams.get('moisture').split(',') : ['All'];
  const trialDurations = searchParams.get('trialdurations') ? searchParams.get('trialdurations').split(',') : ['All'];

  const trialData = await fetchData(trialDataPath);
  const operatingConditions = await fetchData(operatingConditionsPath);

  var filteredData = [...trialData];

  // Filter on trial and item filters
  filteredData = filterData(filteredData, 'Test Method', testMethods);
  filteredData = filterData(filteredData, 'Technology', technologies);
  filteredData = filterData(filteredData, 'Material Class II', materials);
  
  if (!uncapResults) {
    filteredData = filteredData.map(d => {
      if (d[displayCol] > 1) {
        d[displayCol] = 1;
      }
      return d;
    });
  }

  console.log("displayResiduals")
  console.log(displayResiduals)

  if (!displayResiduals) {
    filteredData = filteredData.map(d => {
      d[displayCol] = 1 - d[displayCol];
      if (d[displayCol] < 0) {
        d[displayCol] = 0;
      }
      return d;
    });
  }

  const moistureTrialIDs = filterTrialIDsByConditions('Average % Moisture (In Field)', moistureFilter, operatingConditions, moistureFilterDict);
  const temperatureTrialIDs = filterTrialIDsByConditions('Average Temperature (F)', temperatureFilter, operatingConditions, temperatureFilterDict);
  const trialDurationTrialIDs = filterTrialIDsByConditions('Trial Duration', trialDurations, operatingConditions, trialDurationDict);

  const combinedTrialIDs = getIntersectingTrialIDs(moistureTrialIDs, temperatureTrialIDs, trialDurationTrialIDs);

  console.log("combinedTrialIDs")
  console.log(combinedTrialIDs)

  filteredData = filteredData.filter(d => combinedTrialIDs.includes(d['Trial ID']));

  console.log("filteredData.length")
  console.log(filteredData.length)

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