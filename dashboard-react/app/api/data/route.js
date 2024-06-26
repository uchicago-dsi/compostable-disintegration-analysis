import * as aq from 'arquero';
import fs from 'fs';
import path from 'path';
import { NextResponse } from "next/server";

const ITEMS = path.join(process.cwd(), 'public', 'data', 'all_trials_processed.csv');
const MOISTURE = path.join(process.cwd(), 'public', 'data', 'moisture.csv');
const TEMPERATURES = path.join(process.cwd(), 'public', 'data', 'temperatures.csv');
const TRIAL_DURATIONS = path.join(process.cwd(), 'public', 'data', 'trial_durations.csv');

let cachedData = null;

const fetchData = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const loadData = async () => {
  try {
    const [rawItems, rawMoisture, rawTemperatures, rawTrialDurations] = await Promise.all([
      fetchData(ITEMS),
      fetchData(MOISTURE),
      fetchData(TEMPERATURES),
      fetchData(TRIAL_DURATIONS)
    ]);

    cachedData = {
      itemsTable: aq.fromCSV(rawItems),
      moistureTable: aq.fromCSV(rawMoisture),
      temperaturesTable: aq.fromCSV(rawTemperatures),
      trialDurationsTable: aq.fromCSV(rawTrialDurations),
    };
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

export async function GET(req, reqParams) {
    if (!cachedData) {
      await loadData();
    }

    return NextResponse.json({
      items: cachedData.itemsTable.objects(),
      moisture: cachedData.moistureTable.objects(),
      temperatures: cachedData.temperaturesTable.objects(),
      trialDurations: cachedData.trialDurationsTable.objects(),
    }, { status: 200 });
}

// export async function GET(req, reqParams) {
//   if (data.length == 0) {
//       await getData()
//   }

//   if (reqParams.params.datatype == "plants") {
//       if (cleanedData.length == 0) {
//           getCleanData(data)
//       }
//       return NextResponse.json(cleanedData, { status: 200 });
//   }

//   if (reqParams.params.datatype == "sales") {
//       if (salesData.length == 0) {
//           getSalesData(data)
//       }
//       return NextResponse.json(salesData, { status: 200 });
//   }
// }