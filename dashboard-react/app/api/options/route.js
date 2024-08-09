import { NextResponse } from "next/server";
import path from "path";
import { fetchCloudData, fetchLocalData } from "@/lib/serverUtils";

const bucketName = "cftp_data";
const trialsFilename = "all_trials_processed.csv";

// TODO: Re-add local data fetching if desired
const dataPath = path.join(
  process.cwd(),
  "public",
  "data",
  "all_trials_processed.csv"
);

const fetchData = async () => {
  const data = await fetchCloudData(trialsFilename, bucketName);
  return data;
};

const getUniqueValues = async (columns) => {
  const data = await fetchData();
  const uniqueValues = {};
  columns.forEach((column) => {
    uniqueValues[column] = [...new Set(data.map((item) => item[column]))];
  });
  return uniqueValues;
};

export async function GET() {
  const columns = [
    "Material Class I",
    "Material Class II",
    "Material Class III",
    "Test Method",
    "Technology",
  ];
  const uniqueValues = await getUniqueValues(columns);
  return NextResponse.json(uniqueValues);
}
