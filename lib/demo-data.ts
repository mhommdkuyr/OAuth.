import type { Product } from "./types";

export const demoProducts: Product[] = [
  { id: "p1", name: "بيبسي 330 مل", category: "مشروبات", price: 450, stock: 42 },
  { id: "p2", name: "ماء شملان 330 مل", category: "مياه", price: 180, stock: 8 },
  { id: "p3", name: "عصير راني", category: "عصائر", price: 600, stock: 19 },
  { id: "p4", name: "بسكويت أبو ولد", category: "بسكويت", price: 350, stock: 4 },
  { id: "p5", name: "شاي الكبوس 250 جم", category: "مواد غذائية", price: 1750, stock: 27 },
];

export function findProduct(products: Product[], query: string) {
  const normalized = query.trim().toLowerCase();
  return products.find((product) => {
    const haystack = `${product.name} ${product.category}`.toLowerCase();
    return haystack.includes(normalized) || normalized.includes(product.name.toLowerCase());
  });
}
