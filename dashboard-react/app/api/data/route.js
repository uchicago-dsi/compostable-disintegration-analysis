import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import * as d3 from "d3";
import path from "path";
import fs from "fs/promises";
import {
  moistureFilterDict,
  temperatureFilterDict,
  trialDurationDict,
} from "@/lib/constants";

const dataSource = process.env.DATA_SOURCE;
const bucketName = "cftp_data";
const serviceAccountKey = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    "base64"
  ).toString("ascii")
);
const trialsFilename = "all_trials_processed.csv";
const operatingConditionsFilename = "operating_conditions.csv";

const trialDataPath = path.join(
  process.cwd(),
  "public",
  "data",
  trialsFilename
);
const operatingConditionsPath = path.join(
  process.cwd(),
  "public",
  "data",
  operatingConditionsFilename
);

const fetchCloudData = async (filename, bucketName) => {
  const storage = new Storage({
    credentials: serviceAccountKey,
  });
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filename);

  try {
    const [fileContents] = await file.download();
    const data = d3.csvParse(fileContents.toString("utf-8"));
    return data;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

const fetchLocalData = async (dataPath) => {
  const data = await fs.readFile(dataPath, "utf8");
  return d3.csvParse(data);
};

const calculateQuartiles = (data, key) => {
  const sorted = data.map((d) => parseFloat(d[key])).sort((a, b) => a - b);
  return {
    min: d3.min(sorted),
    q1: d3.quantile(sorted, 0.25),
    median: d3.quantile(sorted, 0.5),
    q3: d3.quantile(sorted, 0.75),
    max: d3.max(sorted),
  };
};

const getFilteredTrialIDs = (data, column, low, high, inclusive) => {
  return data
    .filter((trial) => {
      const value = parseFloat(trial[column]);
      if (inclusive) {
        return value >= low && value <= high;
      }
      return value > low && value < high;
    })
    .map((trial) => trial["Trial ID"]);
};

const filterTrialIDsByConditions = (
  column,
  filters,
  operatingConditions,
  filterDict
) => {
  const trialIDs = new Set();
  console.log(`filtering on ${column}`);
  console.log("filters");
  console.log(filters);
  filters.forEach((filter) => {
    if (filters.includes("All")) {
      operatingConditions.forEach((condition) =>
        trialIDs.add(condition["Trial ID"])
      );
      return Array.from(trialIDs);
    } else {
      const [low, high, inclusive] = filterDict[filter];
      console.log("low");
      console.log(low);
      const filteredTrialIDs = getFilteredTrialIDs(
        operatingConditions,
        column,
        low,
        high,
        inclusive
      );
      filteredTrialIDs.forEach((id) => trialIDs.add(id));
    }
  });
  return trialIDs;
};

const filterData = (data, column, conditions) => {
  if (conditions.some((condition) => condition.includes("All"))) {
    return data;
  }
  return data.filter((row) =>
    conditions.some((condition) => row[column] === condition)
  );
};

const getIntersectingTrialIDs = (...sets) => {
  if (sets.length === 0 || sets.some((set) => set.size === 0)) {
    return new Set();
  }
  const [firstSet, ...restSets] = sets;
  const intersection = [...firstSet].filter((item) =>
    restSets.every((set) => set.has(item))
  );
  return new Set(intersection);
};

const prepareData = async (searchParams) => {
  console.log("searchParams");
  console.log(searchParams);
  // TODO: Clean up the handling of defaults
  // Display params
  const aggCol = searchParams.get("aggcol") || "Material Class I";
  const displayCol = searchParams.get("displaycol") || "% Residuals (Mass)";
  const uncapResults = searchParams.get("uncapresults") === "true" || false;
  const displayResiduals = searchParams.get("displayresiduals") === "true";
  // Trial and item filters
  const testMethods = searchParams.get("testmethods")
    ? searchParams.get("testmethods").split(",")
    : [];
  const technologies = searchParams.get("technologies")
    ? searchParams.get("technologies").split(",")
    : [];
  const materials = searchParams.get("materials")
    ? searchParams.get("materials").split(",")
    : [];
  // Operating conditions filters
  const temperatureFilter = searchParams.get("temperature")
    ? searchParams.get("temperature").split(",")
    : [];
  const moistureFilter = searchParams.get("moisture")
    ? searchParams.get("moisture").split(",")
    : [];
  const trialDurations = searchParams.get("trialdurations")
    ? searchParams.get("trialdurations").split(",")
    : [];

  let trialData;
  let operatingConditions;

  if (dataSource === "local") {
    trialData = await fetchLocalData(trialDataPath);
    operatingConditions = await fetchLocalData(operatingConditionsPath);
  } else if (dataSource === "google") {
    trialData = await fetchCloudData(trialsFilename, bucketName);
    operatingConditions = await fetchCloudData(
      operatingConditionsFilename,
      bucketName
    );
  } else {
    throw new Error("Invalid data source specified");
  }

  var filteredData = [...trialData];

  // filter data based on selected filters
  // TODO: This is wrong!
  filteredData = filterData(filteredData, "Test Method", testMethods);
  console.log("filteredData.length after test methods");
  console.log(filteredData.length);
  filteredData = filterData(filteredData, "Technology", technologies);
  filteredData = filterData(filteredData, "Material Class II", materials);

  if (!uncapResults) {
    filteredData = filteredData.map((d) => {
      if (d[displayCol] > 1) {
        d[displayCol] = 1;
      }
      return d;
    });
  }

  console.log("displayResiduals");
  console.log(displayResiduals);

  if (!displayResiduals) {
    filteredData = filteredData.map((d) => {
      d[displayCol] = 1 - d[displayCol];
      if (d[displayCol] < 0) {
        d[displayCol] = 0;
      }
      return d;
    });
  }

  console.log("moistureFilter");
  console.log(moistureFilter);
  const moistureTrialIDs = filterTrialIDsByConditions(
    "Average % Moisture (In Field)",
    moistureFilter,
    operatingConditions,
    moistureFilterDict
  );

  console.log("moistureTrialIDs");
  console.log(moistureTrialIDs);

  const temperatureTrialIDs = filterTrialIDsByConditions(
    "Average Temperature (F)",
    temperatureFilter,
    operatingConditions,
    temperatureFilterDict
  );
  const trialDurationTrialIDs = filterTrialIDsByConditions(
    "Trial Duration",
    trialDurations,
    operatingConditions,
    trialDurationDict
  );

  const combinedTrialIDs = getIntersectingTrialIDs(
    moistureTrialIDs,
    temperatureTrialIDs,
    trialDurationTrialIDs
  );

  console.log("combinedTrialIDs");
  console.log(combinedTrialIDs);

  if (combinedTrialIDs.size === 0) {
    filteredData = [];
  } else {
    filteredData = filteredData.filter((d) =>
      combinedTrialIDs.has(d["Trial ID"])
    );
  }

  console.log("filteredData.length");
  console.log(filteredData.length);

  // Not enough data - return empty object
  if (filteredData.length < 5) {
    return {};
  }

  const grouped = d3.groups(filteredData, (d) => d[aggCol]);

  const sortedGrouped = grouped.map(([key, values]) => {
    // TODO: Verify that this is always the same
    const classIName = values[0]["Material Class I"];
    const quartiles = calculateQuartiles(values, displayCol);

    return {
      aggCol: key,
      "Material Class I": classIName,
      ...quartiles,
    };
  });

  const materialClassIOrder = [
    "Fiber",
    "Biopolymer",
    "Mixed Materials",
    "Positive Control",
  ];

  sortedGrouped.sort((a, b) => {
    return (
      materialClassIOrder.indexOf(a["Material Class I"]) -
      materialClassIOrder.indexOf(b["Material Class I"])
    );
  });

  return sortedGrouped;
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const data = await prepareData(searchParams);
  return NextResponse.json(data);
}
