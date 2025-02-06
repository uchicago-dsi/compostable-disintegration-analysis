import path from "path";
import { fetchCloudData, fetchLocalData } from "@/lib/serverUtils";

export const dataSource = process.env.DATA_SOURCE;
export const bucketName = "cftp_data";
export const getFileNames = (useTestData = false) => {
  return {
    trialsFilename: `all_trials_processed${process.env.DATA_VERSION_ID || ""}${
      useTestData ? "_test" : ""
    }.csv`,

    operatingConditionsFilename: `operating_conditions_avg${
      process.env.DATA_VERSION_ID || ""
    }${useTestData ? "_test" : ""}.csv`,
  };
};
export const getLocalPaths = (useTestData = false) => {
  const { trialsFilename, operatingConditionsFilename } = getFileNames(
    useTestData
  );
  return {
    trialDataPath: path.join(process.cwd(), "public", "data", trialsFilename),
    operatingConditionsPath: path.join(
      process.cwd(),
      "public",
      "data",
      operatingConditionsFilename
    ),
  };
}

export const loadData = async (useTestData = false) => {
  let trialData;
  let operatingConditions;

  if (dataSource === "local") {
    const { trialDataPath, operatingConditionsPath } = getLocalPaths(useTestData);
    trialData = await fetchLocalData(trialDataPath);
    operatingConditions = await fetchLocalData(operatingConditionsPath);
  } else if (dataSource === "google") {
    const { trialsFilename, operatingConditionsFilename } = getFileNames(useTestData)
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
