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

export async function GET() {
  const uniqueValues = await getUniqueValues(columns);
  return NextResponse.json(uniqueValues);
}
