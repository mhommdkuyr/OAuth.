import { getSupabaseAdmin } from "./supabase";
import { isDemoMode } from "./config";

export async function approveOrder(orderId: string, paymentReviewId?: string) {
  const supabase = getSupabaseAdmin();

  if (!supabase || isDemoMode()) {
    return {
      success: true,
      mode: "demo",
      orderId,
      paymentReviewId: paymentReviewId ?? null,
      inventoryDeducted: true,
      invoiceQueued: true,
    };
  }

  const { data, error } = await supabase.rpc("approve_order", {
    p_order_id: orderId.replace("#", ""),
    p_payment_receipt_id: paymentReviewId ?? null,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function rejectOrder(
  orderId: string,
  paymentReviewId?: string,
  reason = "Rejected by merchant."
) {
  const supabase = getSupabaseAdmin();

  if (!supabase || isDemoMode()) {
    return {
      success: true,
      mode: "demo",
      orderId,
      paymentReviewId: paymentReviewId ?? null,
      inventoryDeducted: false,
      reason,
    };
  }

  const { data, error } = await supabase.rpc("reject_order", {
    p_order_id: orderId.replace("#", ""),
    p_payment_receipt_id: paymentReviewId ?? null,
    p_reason: reason,
  });

  if (error) throw new Error(error.message);
  return data;
}
