export async function POST() {
  return Response.json(
    { error: "Voice transcription is not configured yet." },
    { status: 501 }
  );
}
