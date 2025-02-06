import { NextResponse } from "next/server";
import { getUniqueValues } from "../utils";

const columns = [
  "Material Class I",
  "Material Class II",
  "Material Class III",
  "Test Method",
  "Technology",
  "Item Brand",
  "Item Format",
];


export async function GET(request) {
  const useTestData = request.headers.get('use-test-data') === 'true';
  const uniqueValues = await getUniqueValues(columns, useTestData);
  return NextResponse.json(uniqueValues);
}
