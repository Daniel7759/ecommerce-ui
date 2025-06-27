import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../model/cart.interface';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cart$: Observable<Cart>;
  currentCart: Cart | null = null;
  private subscription = new Subscription();

  constructor(private cartService: CartService) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    this.subscription.add(
      this.cart$.subscribe(cart => {
        this.currentCart = cart;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Incrementar cantidad de un producto
   */
  incrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1);
  }

  /**
   * Decrementar cantidad de un producto
   */
  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.product.id, item.quantity - 1);
    }
  }

  /**
   * Remover producto del carrito
   */
  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.product.id);
  }

  /**
   * Limpiar todo el carrito
   */
  clearCart(): void {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      this.cartService.clearCart();
    }
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  /**
   * Verificar si el carrito está vacío
   */
  get isEmpty(): boolean {
    return !this.currentCart || this.currentCart.items.length === 0;
  }

  /**
   * Proceder al checkout
   */
  proceedToCheckout(): void {
    if (this.isEmpty) return;
    
    // Aquí podrías navegar a la página de checkout
    console.log('Proceeding to checkout with cart:', this.currentCart);
    // this.router.navigate(['/checkout']);
  }
}
