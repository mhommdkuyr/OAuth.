import { hasGemini, hasSupabase, hasWhatsApp, isDemoMode } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    service: "yemen-whatsapp-commerce-ai",
    timestamp: new Date().toISOString(),
    mode: isDemoMode() ? "demo" : "live",
    integrations: {
      gemini: hasGemini(),
      supabase: hasSupabase(),
      whatsapp: hasWhatsApp(),
    },
  });
}
