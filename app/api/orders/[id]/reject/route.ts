import { rejectOrder } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      paymentReviewId?: string;
      reason?: string;
    };

    const result = await rejectOrder(
      id,
      body.paymentReviewId,
      body.reason ?? "السند يحتاج إلى مراجعة بشرية."
    );
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to reject order." },
      { status: 500 }
    );
  }
}
