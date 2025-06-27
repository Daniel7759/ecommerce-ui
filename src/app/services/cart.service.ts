import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart, CartItem, AddToCartRequest } from '../model/cart.interface';
import { Product } from '../model/product.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'ecommerce_cart';
  private cartSubject = new BehaviorSubject<Cart>(this.initializeCart());

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Inicializar carrito desde localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.loadCartFromStorage();
    }
  }

  /**
   * Observable del estado actual del carrito
   */
  get cart$(): Observable<Cart> {
    return this.cartSubject.asObservable();
  }

  /**
   * Obtener el estado actual del carrito
   */
  get currentCart(): Cart {
    return this.cartSubject.value;
  }

  /**
   * Inicializar un carrito vacío
   */
  private initializeCart(): Cart {
    return {
      id: this.generateCartId(),
      items: [],
      total: 0,
      itemCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generar un ID único para el carrito
   */
  private generateCartId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cargar carrito desde localStorage
   */
  private loadCartFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (storedCart) {
        const cart: Cart = JSON.parse(storedCart);
        // Convertir fechas de string a Date
        if (cart.createdAt) cart.createdAt = new Date(cart.createdAt);
        if (cart.updatedAt) cart.updatedAt = new Date(cart.updatedAt);
        
        this.cartSubject.next(cart);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      // Si hay error, usar carrito vacío
      this.cartSubject.next(this.initializeCart());
    }
  }

  /**
   * Guardar carrito en localStorage
   */
  private saveCartToStorage(cart: Cart): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  /**
   * Actualizar el carrito y notificar cambios
   */
  private updateCart(cart: Cart): void {
    cart.updatedAt = new Date();
    cart.total = this.calculateTotal(cart.items);
    cart.itemCount = this.calculateItemCount(cart.items);
    
    this.cartSubject.next(cart);
    this.saveCartToStorage(cart);
  }

  /**
   * Calcular el total del carrito
   */
  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Calcular el número total de items
   */
  private calculateItemCount(items: CartItem[]): number {
    return items.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Calcular subtotal de un item
   */
  private calculateSubtotal(product: Product, quantity: number): number {
    return product.price * quantity;
  }

  /**
   * Buscar un item en el carrito por ID del producto
   */
  private findCartItem(items: CartItem[], productId: number): CartItem | undefined {
    return items.find(item => item.product.id === productId);
  }

  /**
   * Agregar producto al carrito
   */
  addToCart(request: AddToCartRequest): void {
    const { product, quantity = 1 } = request;
    const currentCart = { ...this.currentCart };
    const existingItem = this.findCartItem(currentCart.items, product.id);

    if (existingItem) {
      // Si el producto ya existe, actualizar cantidad
      existingItem.quantity += quantity;
      existingItem.subtotal = this.calculateSubtotal(product, existingItem.quantity);
    } else {
      // Si es un producto nuevo, agregarlo
      const newItem: CartItem = {
        product: { ...product },
        quantity,
        subtotal: this.calculateSubtotal(product, quantity)
      };
      currentCart.items.push(newItem);
    }

    this.updateCart(currentCart);
  }

  /**
   * Remover producto del carrito
   */
  removeFromCart(productId: number): void {
    const currentCart = { ...this.currentCart };
    currentCart.items = currentCart.items.filter(item => item.product.id !== productId);
    this.updateCart(currentCart);
  }

  /**
   * Actualizar cantidad de un producto
   */
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentCart = { ...this.currentCart };
    const existingItem = this.findCartItem(currentCart.items, productId);

    if (existingItem) {
      existingItem.quantity = quantity;
      existingItem.subtotal = this.calculateSubtotal(existingItem.product, quantity);
      this.updateCart(currentCart);
    }
  }

  /**
   * Limpiar todo el carrito
   */
  clearCart(): void {
    const emptyCart = this.initializeCart();
    this.updateCart(emptyCart);
  }

  /**
   * Obtener cantidad de un producto específico en el carrito
   */
  getProductQuantity(productId: number): number {
    const item = this.findCartItem(this.currentCart.items, productId);
    return item ? item.quantity : 0;
  }

  /**
   * Verificar si un producto está en el carrito
   */
  isProductInCart(productId: number): boolean {
    return this.getProductQuantity(productId) > 0;
  }

  /**
   * Obtener total del carrito
   */
  getTotal(): number {
    return this.currentCart.total;
  }

  /**
   * Obtener número total de items
   */
  getItemCount(): number {
    return this.currentCart.itemCount;
  }

  /**
   * Obtener todos los items del carrito
   */
  getItems(): CartItem[] {
    return [...this.currentCart.items];
  }
}
