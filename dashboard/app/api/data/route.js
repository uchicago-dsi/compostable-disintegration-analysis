import { NextResponse } from "next/server";
import { prepareData } from "../utils";

export async function GET(request) {
  const useTestData = request.headers.get('use-test-data') === 'true'
  const { searchParams } = new URL(request.url);
  const data = await prepareData(searchParams, useTestData);
  return NextResponse.json(data);
}
