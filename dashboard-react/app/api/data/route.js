import { NextResponse } from 'next/server';
import * as d3 from 'd3';
import path from 'path';
import fs from 'fs/promises';

const dataPath = path.join(process.cwd(), 'public', 'data', 'all_trials_processed.csv');

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

const prepareData = async (aggCol) => {
  const data = await fetchData();
  const grouped = d3.groups(data, d => d[aggCol]);
  return grouped.map(([key, values]) => ({
    aggCol: key,
    ...calculateQuartiles(values, '% Residuals (Mass)'),
  }));
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const aggCol = searchParams.get('aggcol') || 'Material Class I';
  const data = await prepareData(aggCol);
  return NextResponse.json(data);
}