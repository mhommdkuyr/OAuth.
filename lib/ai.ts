import { GoogleGenAI } from "@google/genai";
import { findProduct } from "./demo-data";
import type { AgentResult, Product } from "./types";

const money = (value: number) =>
  new Intl.NumberFormat("ar-YE", {
    style: "currency",
    currency: "YER",
    maximumFractionDigits: 0,
  }).format(value);

function extractQuantity(message: string) {
  const arabicDigits = message.replace(/[٠-٩]/g, (char) =>
    String("٠١٢٣٤٥٦٧٨٩".indexOf(char))
  );
  const match = arabicDigits.match(/(?:عدد|كمية|كم|أريد|اريد)?s*(d{1,3})/);
  return match ? Math.max(1, Number(match[1])) : 1;
}

function rulesFirst(message: string, products: Product[]): AgentResult | null {
  const lower = message.toLowerCase();
  const product = products.find((item) =>
    `${item.name} ${item.category}`.toLowerCase().split(" ").some((token) =>
      token.length > 2 && lower.includes(token)
    )
  );

  if (!product) return null;

  if (lower.includes("سعر") || lower.includes("كم ب") || lower.includes("بكم")) {
    return {
      reply: `سعر ${product.name} هو ${money(product.price)}.`,
      action: { type: "search_products", query: product.name },
      source: "rules",
    };
  }

  if (lower.includes("مخزون") || lower.includes("متوفر") || lower.includes("باقي")) {
    return {
      reply:
        product.stock > 0
          ? `نعم، ${product.name} متوفر حاليًا. المتبقي: ${product.stock} وحدة.`
          : `حاليًا ${product.name} غير متوفر.`,
      action: { type: "check_stock", query: product.name },
      source: "rules",
    };
  }

  if (lower.includes("أريد") || lower.includes("اريد") || lower.includes("أبغى") || lower.includes("ابغى")) {
    const quantity = extractQuantity(message);
    const canFulfill = product.stock >= quantity;
    return {
      reply: canFulfill
        ? `تم تجهيز ${quantity} × ${product.name} للسلة التجريبية. الإجمالي ${money(product.price * quantity)}.`
        : `الكمية المطلوبة (${quantity}) أكبر من المتوفر حاليًا (${product.stock}).`,
      action: { type: "add_to_cart", productId: product.id, quantity },
      source: "rules",
    };
  }

  return null;
}

export async function respondAsStoreAgent(
  message: string,
  products: Product[]
): Promise<AgentResult> {
  const ruleResult = rulesFirst(message, products);
  if (ruleResult) return ruleResult;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      reply: "أستطيع مساعدتك في البحث عن المنتجات والأسعار والمخزون. جرّب: «كم سعر شاي الكبوس؟» أو «هل البيبسي متوفر؟»",
      action: { type: "unknown" },
      source: "rules",
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const catalog = products
    .map((item) => `${item.id}|${item.name}|${item.category}|${item.price}|${item.stock}`)
    .join("\n");

  const response = await ai.models.generateContent({
    model,
    contents: [{
      role: "user",
      parts: [{
        text: `أنت وكيل متجر يمني يعمل عبر واتساب.
أجب بالعربية الواضحة وباختصار.
لا تخترع أي سعر أو مخزون؛ اعتمد فقط على الكتالوج أدناه.
لا تؤكد الدفع ولا تخصم المخزون بنفسك.
إذا فهمت الطلب، ضع في نهاية الرد سطرًا بصيغة:
ACTION: search_products|check_stock|add_to_cart|unknown
CATALOG:
${catalog}

رسالة العميل:
${message}`
      }]
    }],
    config: { temperature: 0.2 }
  });

  const text = response.text?.trim() || "تعذر الحصول على رد من الوكيل.";
  const actionLine = text.match(/ACTION:\s*(search_products|check_stock|add_to_cart|unknown)/i);
  const actionType = actionLine?.[1]?.toLowerCase();

  if (actionType === "search_products" || actionType === "check_stock") {
    return {
      reply: text.replace(/ACTION:[\s\S]*$/i, "").trim(),
      action: { type: actionType, query: message },
      source: "gemini",
    };
  }

  if (actionType === "add_to_cart") {
    return {
      reply: text.replace(/ACTION:[\s\S]*$/i, "").trim(),
      action: {
        type: "add_to_cart",
        productId: findProduct(products, message)?.id ?? "unknown",
        quantity: extractQuantity(message),
      },
      source: "gemini",
    };
  }

  return {
    reply: text.replace(/ACTION:[\s\S]*$/i, "").trim(),
    action: { type: "unknown" },
    source: "gemini",
  };
}

export async function analyzeReceiptImage(
  imageBytes: Uint8Array,
  mimeType: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      amount: null,
      reference: null,
      confidence: 0,
      note: "GEMINI_API_KEY غير مضبوط؛ لم يتم فحص السند.",
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const base64 = Buffer.from(imageBytes).toString("base64");

  const response = await ai.models.generateContent({
    model,
    contents: [
      { inlineData: { mimeType, data: base64 } },
      {
        text: "حلل صورة سند تحويل مالي. أرجع JSON فقط بالمفاتيح amount, reference, confidence, note. amount رقم فقط إن أمكن، reference سلسلة نصية، confidence من 0 إلى 1. لا تؤكد أن الدفع حقيقي؛ استخرج البيانات المرئية فقط.",
      },
    ],
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });

  const raw = response.text?.trim() || "{}";
  try {
    const parsed = JSON.parse(raw) as {
      amount?: number | null;
      reference?: string | null;
      confidence?: number;
      note?: string;
    };
    return {
      amount: typeof parsed.amount === "number" ? parsed.amount : null,
      reference: parsed.reference ?? null,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
      note: parsed.note ?? "تم استخراج البيانات المرئية.",
    };
  } catch {
    return {
      amount: null,
      reference: null,
      confidence: 0,
      note: "تعذر تفسير مخرجات تحليل السند.",
    };
  }
}
