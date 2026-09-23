import { respondAsStoreAgent } from "@/lib/ai";
import { demoProducts } from "@/lib/demo-data";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      products?: Product[];
      customerName?: string;
    };

    const message = body.message?.trim();
    if (!message) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const products =
      Array.isArray(body.products) && body.products.length ? body.products : demoProducts;

    const result = await respondAsStoreAgent(message, products);

    return Response.json({
      reply: result.reply,
      action: result.action,
      source: result.source,
      customerName: body.customerName ?? null,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "AI request failed" },
      { status: 500 }
    );
  }
}
