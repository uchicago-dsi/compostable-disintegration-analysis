import { NextResponse } from "next/server";
import { prepareData } from "../utils";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const data = await prepareData(searchParams);
  return NextResponse.json(data);
}
