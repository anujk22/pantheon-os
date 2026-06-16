import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Canvas sync is not configured yet." },
    { status: 501 }
  );
}
