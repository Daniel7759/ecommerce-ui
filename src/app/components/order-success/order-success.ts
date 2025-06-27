import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './order-success.html',
  styleUrls: ['./order-success.css']
})
export class OrderSuccessComponent implements OnInit {
  orderData: any;
  orderNumber: string;
  orderDate: Date;

  constructor(private router: Router) {
    // Generar número de orden
    this.orderNumber = this.generateOrderNumber();
    this.orderDate = new Date();
    
    // Obtener datos de la orden desde el estado de navegación
    const navigation = this.router.getCurrentNavigation();
    this.orderData = navigation?.extras?.state?.['orderData'];
  }

  ngOnInit(): void {
    // Si no hay datos de orden, redirigir al inicio
    if (!this.orderData) {
      this.router.navigate(['/']);
    }
  }

  private generateOrderNumber(): string {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}
