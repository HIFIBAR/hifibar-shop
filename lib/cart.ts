'use client';

export type CartItem = {
  productId: string;
  quantity: number;
  code: string;
  modele_tv: string;
  prix: number;
};

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem('hifibar_cart');
  return cart ? JSON.parse(cart) : [];
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const existingIndex = cart.findIndex(i => i.productId === item.productId);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  localStorage.setItem('hifibar_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
}

export function updateCartItemQuantity(productId: string, quantity: number): void {
  const cart = getCart();
  const index = cart.findIndex(i => i.productId === productId);

  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    localStorage.setItem('hifibar_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }
}

export function removeFromCart(productId: string): void {
  const cart = getCart().filter(i => i.productId !== productId);
  localStorage.setItem('hifibar_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
}

export function clearCart(): void {
  localStorage.removeItem('hifibar_cart');
  window.dispatchEvent(new Event('cartUpdated'));
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + (item.prix * item.quantity), 0);
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}
