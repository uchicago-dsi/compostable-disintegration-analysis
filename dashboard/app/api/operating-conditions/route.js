import { NextResponse } from "next/server";
import { fetchCloudData, fetchLocalData } from "@/lib/serverUtils";

const bucketName = "cftp_data";
const trialsFilename = "operating_conditions_full.csv";

const mappings = {
  IV: "In-Vessel",
  CASP: "Covered Aerated Static Pile",
  WR: "Windrow",
  EASP: "Extended Aerated Static Pile",
  ASP: "Aerated Static Pile",
  AD: "Anaerobic Digestion",
};

const replaceTrialNames = (data) => {
  return data.map((row) => {
    const newRow = {};
    Object.keys(row).forEach((column) => {
      // Match the trial columns based on the prefix (e.g., IV, CASP, WR, etc.)
      const prefixMatch = column.match(/^[A-Z]+/);
      if (prefixMatch) {
        const prefix = prefixMatch[0];
        const mappedName = mappings[prefix] || prefix;

        const identifierMatch = column.match(/\d{3}/); // Get the first number (e.g., 004)
        if (identifierMatch) {
          const identifier = identifierMatch[0];
          // Create the new column name (MappedName - Identifier)
          const newColumnName = `${mappedName} - ${identifier}`;
          newRow[newColumnName] = row[column];
        } else {
          newRow[column] = row[column];
        }
      } else {
        newRow[column] = row[column];
      }
    });
    return newRow;
  });
};

export async function GET() {
  try {
    let data = await fetchCloudData(trialsFilename, bucketName);
    const updatedData = replaceTrialNames(data);
    return NextResponse.json(updatedData);
  } catch (error) {
    console.error("Error fetching or processing CSV data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
