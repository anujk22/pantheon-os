import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createCaseRecord } from "@/lib/cases";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    const isFormPost =
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data");

    let title = "";
    let description: string | null = null;

    if (isFormPost) {
      const formData = await req.formData();
      title = String(formData.get("title") ?? "");
      description = String(formData.get("description") ?? "") || null;
    } else {
      const body = (await req.json()) as {
        title?: string;
        description?: string | null;
      };
      title = body.title ?? "";
      description = body.description ?? null;
    }

    const result = await createCaseRecord({
      title,
      description,
    });

    if (result.message) {
      if (isFormPost) {
        return new NextResponse(result.message, { status: 400 });
      }
      return NextResponse.json(result, { status: 400 });
    }

    revalidatePath("/cases");
    if (isFormPost) {
      return NextResponse.redirect(
        new URL(`/cases/${result.caseId}`, req.url),
        303
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Case could not be created." },
      { status: 500 }
    );
  }
}
