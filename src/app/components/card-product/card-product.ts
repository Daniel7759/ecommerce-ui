import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../model';
import { AuthService } from '../../services/auth.service';

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
    private router: Router
  ) {}

  onAddToCart(): void {
    // Verificar si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      console.log('🛒 Agregando al carrito:', this.product.title);
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
