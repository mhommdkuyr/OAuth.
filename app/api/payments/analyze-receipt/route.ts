import { analyzeReceiptImage } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "file is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "file must be an image" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "image is too large" }, { status: 413 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await analyzeReceiptImage(bytes, file.type);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "receipt analysis failed" },
      { status: 500 }
    );
  }
}
