import { NextResponse } from 'next/server';
import * as d3 from 'd3';
import path from 'path';
import fs from 'fs/promises';

const dataPath = path.join(process.cwd(), 'public', 'data', 'all_trials_processed.csv');

const fetchData = async () => {
  const data = await fs.readFile(dataPath, 'utf8');
  return d3.csvParse(data);
};

const getUniqueValues = async (columns) => {
  const data = await fetchData();
  const uniqueValues = {};
  columns.forEach(column => {
    uniqueValues[column] = [...new Set(data.map(item => item[column]))];
  });
  return uniqueValues;
};

export async function GET() {
  const columns = ['Material Class I', 'Material Class II', 'Material Class III', 'Test Method', 'Technology'];
  const uniqueValues = await getUniqueValues(columns);
  return NextResponse.json(uniqueValues);
}