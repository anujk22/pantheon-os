import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await req.json()
      : Object.fromEntries(await req.formData());

    const name = String(payload.name ?? "").trim();
    const llmProvider = String(payload.llmProvider ?? "lmstudio");
    const llmBaseUrl = String(payload.llmBaseUrl ?? "http://127.0.0.1:1234/v1");
    const llmApiKey = String(payload.llmApiKey ?? "");

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    
    // Upsert the user configuration
    await prisma.user.upsert({
      where: { email: "local-admin@pantheon.local" },
      update: {
        name,
        llmProvider,
        llmBaseUrl,
        llmApiKey
      },
      create: {
        name,
        email: "local-admin@pantheon.local",
        llmProvider,
        llmBaseUrl,
        llmApiKey
      }
    });

    if (contentType.includes("application/json")) {
      const response = NextResponse.json({ success: true });
      setOnboardingCookie(response);
      return response;
    }

    const response = NextResponse.redirect(new URL("/", req.url), { status: 303 });
    setOnboardingCookie(response);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Onboarding Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function setOnboardingCookie(response: NextResponse) {
  response.cookies.set("pantheon_onboarded", "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
      httpOnly: true,
      sameSite: "lax",
  });
}
