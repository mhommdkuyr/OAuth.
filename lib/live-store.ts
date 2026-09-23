import { getSupabaseAdmin } from "./supabase";
import { isDemoMode } from "./config";
import { demoProducts } from "./demo-data";
import type { Product } from "./types";

type DataClient = {
  from: (table: string) => {
    select: (...args: string[]) => any;
    eq: (...args: string[]) => any;
    order: (...args: string[]) => any;
    maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
    upsert: (values: unknown, options?: unknown) => any;
    single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
    insert: (values: unknown) => Promise<{ error: { message: string } | null }>;
  };
};

function dbClient() {
  const client = getSupabaseAdmin();
  return client && !isDemoMode()
    ? (client as unknown as DataClient)
    : null;
}

export async function merchantForWhatsAppNumber(phoneNumberId: string) {
  const db = dbClient();
  if (!db) return null;

  const result = await db
    .from("merchants")
    .select("id,name,whatsapp_phone_number_id")
    .eq("whatsapp_phone_number_id", phoneNumberId)
    .maybeSingle();

  if (result.error) throw new Error(result.error.message);
  return result.data as { id: string; name: string; whatsapp_phone_number_id: string } | null;
}

export async function productsForMerchant(merchantId: string): Promise<Product[]> {
  const db = dbClient();
  if (!db) return demoProducts;

  const result = await db
    .from("products")
    .select("id,name,category,price_yer,stock")
    .eq("merchant_id", merchantId)
    .eq("active", true)
    .order("name");

  if (result.error) throw new Error(result.error.message);

  return (result.data ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    category: item.category ?? "عام",
    price: item.price_yer,
    stock: item.stock,
  }));
}

export async function rememberInboundWhatsAppMessage(args: {
  merchantId: string;
  customerPhone: string;
  messageId?: string;
  messageType: string;
  textBody?: string;
  mediaId?: string;
}) {
  const db = dbClient();
  if (!db || !args.messageId) return true;

  const existing = await db
    .from("whatsapp_messages")
    .select("id")
    .eq("merchant_id", args.merchantId)
    .eq("wa_message_id", args.messageId)
    .maybeSingle();

  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return false;

  const customer = await db
    .from("customers")
    .upsert(
      { merchant_id: args.merchantId, whatsapp_phone: args.customerPhone },
      { onConflict: "merchant_id,whatsapp_phone" }
    )
    .select("id")
    .single();

  if (customer.error) throw new Error(customer.error.message);

  const inserted = await db.from("whatsapp_messages").insert({
    merchant_id: args.merchantId,
    customer_id: customer.data?.id ?? null,
    wa_message_id: args.messageId,
    direction: "inbound",
    message_type: args.messageType,
    text_body: args.textBody ?? null,
    media_id: args.mediaId ?? null,
  });

  if (inserted.error) throw new Error(inserted.error.message);
  return true;
}
