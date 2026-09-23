import { createHmac, timingSafeEqual } from "node:crypto";
import { respondAsStoreAgent } from "@/lib/ai";
import { demoProducts } from "@/lib/demo-data";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

async function verifiedSignature(request: Request, rawBody: string) {
  const secret = process.env.WHATSAPP_APP_SECRET;

  if (!secret) {
    return process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
  }

  const signature = request.headers.get("x-hub-signature-256");
  if (!signature?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const received = signature.slice("sha256=".length);

  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(received, "hex")
    );
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!(await verifiedSignature(request, rawBody))) {
    return Response.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);

    if (payload.object !== "whatsapp_business_account") {
      return Response.json({ ok: true, ignored: true });
    }

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        for (const message of change.value?.messages ?? []) {
          const from = message.from as string | undefined;
          const text = message.text?.body as string | undefined;

          if (!from || !text || message.type !== "text") continue;

          const result = await respondAsStoreAgent(text, demoProducts);
          await sendWhatsAppText(from, result.reply);
        }
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("whatsapp webhook error", error);
    return Response.json({ ok: false }, { status: 200 });
  }
}
