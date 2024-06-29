import { NextResponse } from 'next/server';
import * as d3 from 'd3';
import path from 'path';
import fs from 'fs/promises';
import { moistureDict } from '@/lib/constants';

const trialDataPath = path.join(process.cwd(), 'public', 'data', 'all_trials_processed.csv');
const operatingConditionsPath = path.join(process.cwd(), 'public', 'data', 'moisture.csv');

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

const getFilteredTrialIDs = (data, col, low, high, inclusive) => {
return data.filter(d => {
  const value = parseFloat(d[col]);
  if (inclusive) {
    return value >= low && value <= high;
  }
  return value > low && value < high;
}).map(d => d["Trial ID"]);
};

const applyFilters = (data, filters) => {
  // console.log(filters)
  return data.filter(d => {
    return Object.entries(filters).every(([col, filterValue]) => {
      // if (!filterValue || filterValue === 'All') {
      //   return true; // No filter applied for this column
      // }
      if (Array.isArray(filterValue)) {
        return filterValue.some(val => d[col] === val);
      }
      return d[col] === filterValue;
    });
  });
};

const prepareData = async (searchParams) => {
  const aggCol = searchParams.get('aggcol') || 'Material Class I';
  const displayCol = searchParams.get('displaycol') || '% Residuals (Mass)';
  // TODO: Can I split this out somehow and iterate through?
  const testMethods = searchParams.get('testmethods') ? searchParams.get('testmethods').split(',') : [];
  const moistureFilter = searchParams.get('moisture') ? searchParams.get('moisture').split(',') : ['All Moistures'];

  const trialData = await fetchData(trialDataPath);
  const operatingConditions = await fetchData(operatingConditionsPath);

  // Filter data on params
  // TODO: make this generalizable
  var filteredData = testMethods.length > 0
    ? trialData.filter(d => testMethods.includes(d['Test Method']))
    : trialData;

  console.log("moistureFilter")
  console.log(moistureFilter)

  // console.log("operatingConditions")
  // console.log(operatingConditions)

  if (!moistureFilter.includes('All Moistures')) {
    let trialIDs = new Set();
    
    moistureFilter.forEach(moistureFilter => {
      const [low, high, inclusive] = moistureDict[moistureFilter];

      // Filter the operatingConditions data
      const filteredTrials = operatingConditions.filter(trial => {
        const moistureValue = parseFloat(trial['Average % Moisture (In Field)']);
        if (inclusive) {
          return moistureValue >= low && moistureValue <= high;
        }
        return moistureValue > low && moistureValue < high;
      });

      console.log("filteredTrials")
      console.log(filteredTrials)

      // Collect the Trial IDs of the filtered trials
      filteredTrials.forEach(trial => trialIDs.add(trial['Trial ID']));
    });

    console.log("trialIDs")
    console.log(trialIDs)

    // Filter the trialData based on the collected Trial IDs
    filteredData = filteredData.filter(data => trialIDs.has(data['Trial ID']));
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