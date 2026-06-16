import { NextResponse } from "next/server";
import { createCaseRecord } from "@/app/cases/actions";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      title?: string;
      description?: string | null;
    };

    const result = await createCaseRecord({
      title: body.title ?? "",
      description: body.description ?? null,
    });

    if (result.message) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Case could not be created." },
      { status: 500 }
    );
  }
}
