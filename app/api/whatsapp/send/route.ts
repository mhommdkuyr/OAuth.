import { sendWhatsAppText } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { to?: string; message?: string };

    if (!body.to || !body.message) {
      return Response.json({ error: "to and message are required" }, { status: 400 });
    }

    const result = await sendWhatsAppText(body.to, body.message);
    return Response.json({ ok: true, result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to send message." },
      { status: 500 }
    );
  }
}
