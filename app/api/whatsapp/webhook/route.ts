import { respondAsStoreAgent } from "@/lib/ai";
import { demoProducts } from "@/lib/demo-data";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

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
  try {
    const payload = await request.json();

    if (payload.object !== "whatsapp_business_account") {
      return Response.json({ ok: true, ignored: true });
    }

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;

        for (const message of value.messages ?? []) {
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
