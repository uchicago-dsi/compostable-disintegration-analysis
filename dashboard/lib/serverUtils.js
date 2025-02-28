import * as d3 from "d3";
import { Storage } from "@google-cloud/storage";
import fs from "fs/promises";

export const fetchCloudData = async (filename, bucketName) => {
  const serviceAccountKey = JSON.parse(
    Buffer.from(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
      "base64"
    ).toString("ascii")
  );

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

export const fetchLocalData = async (dataPath) => {
  const data = await fs.readFile(dataPath, "utf8");
  return d3.csvParse(data);
};
