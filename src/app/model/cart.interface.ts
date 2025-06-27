import { Product } from './product.interface';

/**
 * Interface para representar un item en el carrito de compras
 */
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

/**
 * Interface para el estado completo del carrito
 */
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

/**
 * Interface para acciones del carrito
 */
export interface AddToCartRequest {
  product: Product;
  quantity?: number;
}

/**
 * Interface para respuesta de la API del carrito
 */
export interface CartResponse {
  id: number;
  userId: number;
  date: string;
  products: Array<{
    productId: number;
    quantity: number;
  }>;
}

/**
 * Interface para representar el carrito de compras completo
 */
export interface Cart {
  id?: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para las operaciones del carrito
 */
export interface CartOperations {
  addItem(product: Product, quantity?: number): void;
  removeItem(productId: number): void;
  updateQuantity(productId: number, quantity: number): void;
  clearCart(): void;
  getTotal(): number;
  getItemCount(): number;
}
