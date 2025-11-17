import { CartItem } from '@/lib/cart';

export function calculateTotalWeight(items: Array<{ weight_grams: number; quantity: number }>): number {
  const productWeight = items.reduce((sum, item) => {
    return sum + (item.weight_grams * item.quantity);
  }, 0);

  const withPackaging = productWeight * 1.25;

  return Math.ceil(withPackaging);
}

export function calculateCartWeight(cartItems: CartItem[], products: Array<{ id: string; poids_gr: number }>): number {
  const itemsWithWeight = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      weight_grams: product?.poids_gr || 0,
      quantity: item.quantity
    };
  });

  return calculateTotalWeight(itemsWithWeight);
}

export function formatWeight(grams: number): string {
  if (grams < 1000) {
    return `${grams}g`;
  }
  return `${(grams / 1000).toFixed(2)}kg`;
}
