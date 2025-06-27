import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Cart, CartItem } from '../../model/cart.interface';
import { Subject, takeUntil } from 'rxjs';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  currentStep = 1;
  maxSteps = 4;
  cart: Cart | null = null;
  isProcessing = false;
  
  // Payment methods
  paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Tarjeta de Crédito/Débito',
      icon: 'credit-card',
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'paypal',
      description: 'Paga con tu cuenta de PayPal'
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      icon: 'mercadopago',
      description: 'Paga con Mercado Pago'
    }
  ];

  selectedPaymentMethod: PaymentMethod | null = null;

  // Forms data
  shippingAddress: ShippingAddress = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'España'
  };

  paymentDetails: PaymentDetails = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  };

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/checkout' } 
      });
      return;
    }

    // Suscribirse al carrito
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;
        // Si el carrito está vacío, redirigir
        if (!cart || cart.items.length === 0) {
          this.router.navigate(['/']);
        }
      });

    // Pre-llenar datos del usuario si están disponibles
    const user = this.authService.getCurrentUser();
    if (user) {
      this.shippingAddress.fullName = `${user.name.firstname} ${user.name.lastname}`;
      this.shippingAddress.email = user.email;
      this.shippingAddress.phone = user.phone;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Navegar entre pasos
   */
  nextStep(): void {
    if (this.currentStep < this.maxSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.maxSteps) {
      this.currentStep = step;
    }
  }

  /**
   * Validaciones por paso
   */
  canProceedToStep2(): boolean {
    return this.cart !== null && this.cart.items.length > 0;
  }

  canProceedToStep3(): boolean {
    const addr = this.shippingAddress;
    return !!(addr.fullName && addr.email && addr.phone && 
             addr.address && addr.city && addr.postalCode && addr.country);
  }

  canProceedToStep4(): boolean {
    return this.selectedPaymentMethod !== null;
  }

  /**
   * Seleccionar método de pago
   */
  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
  }

  /**
   * Validar formulario de pago
   */
  isPaymentFormValid(): boolean {
    if (!this.selectedPaymentMethod) return false;

    if (this.selectedPaymentMethod.id === 'stripe') {
      const payment = this.paymentDetails;
      return !!(payment.cardNumber && payment.expiryDate && 
               payment.cvv && payment.cardholderName);
    }

    // PayPal y Mercado Pago no necesitan formulario adicional
    return true;
  }

  /**
   * Procesar pago
   */
  async processPayment(): Promise<void> {
    if (!this.canProceedToStep4() || !this.isPaymentFormValid()) {
      return;
    }

    this.isProcessing = true;

    try {
      // Simular procesamiento de pago
      await this.simulatePaymentProcessing();
      
      // Limpiar carrito
      this.cartService.clearCart();
      
      // Redirigir a página de éxito
      this.router.navigate(['/order-success'], {
        state: { 
          orderData: {
            cart: this.cart,
            shippingAddress: this.shippingAddress,
            paymentMethod: this.selectedPaymentMethod
          }
        }
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Simular procesamiento de pago
   */
  private simulatePaymentProcessing(): Promise<void> {
    return new Promise((resolve) => {
      // Simular delay de procesamiento
      setTimeout(() => {
        resolve();
      }, 2000);
    });
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
   * Calcular costo de envío (simulado)
   */
  getShippingCost(): number {
    return this.cart && this.cart.total > 50 ? 0 : 5.99;
  }

  /**
   * Calcular total final
   */
  getFinalTotal(): number {
    if (!this.cart) return 0;
    return this.cart.total + this.getShippingCost();
  }

  /**
   * Formatear número de tarjeta
   */
  formatCardNumber(): void {
    let value = this.paymentDetails.cardNumber.replace(/\s/g, '');
    let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    this.paymentDetails.cardNumber = formattedValue;
  }

  /**
   * Formatear fecha de expiración
   */
  formatExpiryDate(): void {
    let value = this.paymentDetails.expiryDate.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.paymentDetails.expiryDate = value;
  }

  /**
   * Volver al carrito
   */
  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }
}
