import { sendWhatsAppText } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) return process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

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
