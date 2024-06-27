import { NextResponse } from 'next/server';
import * as d3 from 'd3';
import path from 'path';
import fs from 'fs/promises';

const dataPath = path.join(process.cwd(), 'public', 'data', 'all_trials_processed.csv');

const moistureDict = {
  "<40%": [-Infinity, 0.4, false],
  "40-45%": [0.4, 0.45, true],
  "45-50%": [0.45, 0.50, true],
  "50-55%": [0.50, 0.55, true],
  "55-60%": [0.55, 0.60, true],
  ">60%": [0.60, Infinity, false],
};

const fetchData = async () => {
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
  console.log(filters)
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
  const data = await fetchData();

  const aggCol = searchParams.get('aggcol') || 'Material Class I';
  const displayCol = searchParams.get('displaycol') || '% Residuals (Mass)';
  // TODO: Can I split this out somehow and iterate through?
  const testMethods = searchParams.get('testmethods') || '';
  const moistureFilter = searchParams.get('moisture') || 'All Moistures';

  // Filter data on params
  // TODO: make this generalizable
  const filteredData = testMethods.length > 0
    ? data.filter(d => testMethods.includes(d['Test Method']))
    : data;

  // const brokenFilteredData = applyFilters(data, {
  //   'Test Method': selectedTestMethods,
  // });
  // console.log(brokenFilteredData)

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