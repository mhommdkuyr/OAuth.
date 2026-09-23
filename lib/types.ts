export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
};

export type AgentAction =
  | { type: "search_products"; query: string }
  | { type: "check_stock"; query: string }
  | { type: "add_to_cart"; productId: string; quantity: number }
  | { type: "unknown" };

export type AgentResult = {
  reply: string;
  action: AgentAction;
  source: "rules" | "gemini";
};
