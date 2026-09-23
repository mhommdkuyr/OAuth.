import { approveOrder } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      paymentReviewId?: string;
    };

    const result = await approveOrder(id, body.paymentReviewId);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to approve order." },
      { status: 500 }
    );
  }
}
