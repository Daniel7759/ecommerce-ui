import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../model';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-card-product',
  imports: [CommonModule],
  templateUrl: './card-product.html',
  styleUrl: './card-product.css'
})
export class CardProduct {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() viewProduct = new EventEmitter<Product>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService
  ) {}

  onAddToCart(): void {
    // Verificar si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      console.log('🛒 Agregando al carrito:', this.product.title);
      // Agregar producto al carrito usando el servicio
      this.cartService.addToCart({ 
        product: this.product, 
        quantity: 1 
      });
      // También emitir el evento para el componente padre si es necesario
      this.addToCart.emit(this.product);
    } else {
      console.log('🔐 Usuario no autenticado, redirigiendo al login...');
      // Redirigir al login con la URL actual como returnUrl
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
    }
  }

  onViewProduct(): void {
    console.log('🔗 Card-Product: Emitiendo evento viewProduct para:', this.product.id);
    this.viewProduct.emit(this.product);
  }

  // Helper para mostrar estrellas basado en rating
  getStarsArray(rating: number): boolean[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars);
    }
    return stars;
  }
}
