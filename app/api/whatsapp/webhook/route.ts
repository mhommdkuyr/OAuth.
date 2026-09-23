import { createHmac, timingSafeEqual } from "node:crypto";
import { respondAsStoreAgent, analyzeReceiptImage } from "@/lib/ai";
import { sendWhatsAppText, downloadWhatsAppMedia } from "@/lib/whatsapp";
import {
  merchantForWhatsAppNumber,
  productsForMerchant,
  rememberInboundWhatsAppMessage,
} from "@/lib/live-store";

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
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
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
        const value = change.value;
        const phoneNumberId = value?.metadata?.phone_number_id as string | undefined;

        const merchant = phoneNumberId
          ? await merchantForWhatsAppNumber(phoneNumberId)
          : null;

        const products = merchant
          ? await productsForMerchant(merchant.id)
          : undefined;

        for (const message of value?.messages ?? []) {
          const from = message.from as string | undefined;
          const messageId = message.id as string | undefined;

          if (!from) continue;

          if (merchant && messageId) {
            const isNew = await rememberInboundWhatsAppMessage({
              merchantId: merchant.id,
              customerPhone: from,
              messageId,
              messageType: String(message.type ?? "unknown"),
              textBody: message.text?.body as string | undefined,
              mediaId: message.image?.id as string | undefined,
            });

            if (!isNew) continue;
          }

          if (message.type === "text" && message.text?.body) {
            const result = await respondAsStoreAgent(
              message.text.body as string,
              products?.length ? products : (await import("@/lib/demo-data")).demoProducts
            );
            await sendWhatsAppText(from, result.reply);
            continue;
          }

          if (message.type === "image" && message.image?.id) {
            const media = await downloadWhatsAppMedia(message.image.id);
            const receipt = await analyzeReceiptImage(media.buffer, media.mimeType);

            const reply = receipt.amount
              ? `تم استلام صورة السند. المبلغ المقروء: ${receipt.amount} ر.ي. المرجع: ${receipt.reference ?? "غير واضح"}. تمت إحالة العملية للمراجعة البشرية؛ تحليل الصورة لا يثبت الدفع.`
              : "تم استلام صورة السند، لكن تعذر استخراج المبلغ بثقة كافية. تمت إحالة العملية للمراجعة البشرية.";

            await sendWhatsAppText(from, reply);
          }
        }
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("whatsapp webhook error", error);
    return Response.json({ ok: false }, { status: 200 });
  }
}
