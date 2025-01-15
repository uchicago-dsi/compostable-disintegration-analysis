import path from "path";
import { fetchCloudData, fetchLocalData } from "@/lib/serverUtils";

export const dataSource = process.env.DATA_SOURCE;
export const bucketName = "cftp_data";
export const trialsFilename = `all_trials_processed${
  process.env.DATA_VERSION_ID || ""
}.csv`;
export const operatingConditionsFilename = `operating_conditions_avg${
  process.env.DATA_VERSION_ID || ""
}.csv`;

export const trialDataPath = path.join(
  process.cwd(),
  "public",
  "data",
  trialsFilename
);
export const operatingConditionsPath = path.join(
  process.cwd(),
  "public",
  "data",
  operatingConditionsFilename
);

export const loadData = async () => {
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
  return { trialData, operatingConditions };
};
