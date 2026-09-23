const DEFAULT_WHATSAPP_GRAPH_VERSION = "v26.0";

export function isDemoMode() {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
}

export function hasGemini() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function hasWhatsApp() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    (process.env.WHATSAPP_GRAPH_VERSION || DEFAULT_WHATSAPP_GRAPH_VERSION)
  );
}
