import { checkWhatsAppConnection } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await checkWhatsAppConnection();
    return Response.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "WhatsApp connection check failed.",
      },
      { status: 500 }
    );
  }
}
