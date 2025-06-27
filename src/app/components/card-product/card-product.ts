import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../model';

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

  onAddToCart(): void {
    this.addToCart.emit(this.product);
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
