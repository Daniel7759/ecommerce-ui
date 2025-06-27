import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../model';
import { ActivatedRoute, Router } from '@angular/router';
import { Fakestore } from '../../services/fakestore.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
}) 
export class ProductDetail implements OnInit, OnDestroy {

  product: Product | null = null;
  loading: boolean = true;
  error: string | null = null;
  showLoginModal: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fakeStore: Fakestore,
    private authService: AuthService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(+id);
      } else {
        this.error = 'ID de producto no válido';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(id: number): void {
    this.loading = true;
    this.error = null;
    console.log('🔍 Cargando producto con ID:', id);
    
    this.fakeStore.getProductById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        console.log('✅ Producto cargado exitosamente:', product);
      },
      error: (err) => {
        console.error('❌ Error al cargar producto:', err);
        this.error = 'Error al cargar el producto';
        this.loading = false;
        // Opcional: redirigir de vuelta si hay error
        // setTimeout(() => this.router.navigate(['/']), 3000);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Agregar producto al carrito
   */
  addToCart(): void {
    if (this.authService.isAuthenticated() && this.product) {
      console.log('🛒 Agregando al carrito:', this.product.title);
      this.cartService.addToCart({ 
        product: this.product, 
        quantity: 1 
      });
      // Mostrar mensaje de confirmación
      alert(`¡${this.product.title} agregado al carrito!`);
    } else {
      console.log('🔐 Usuario no autenticado, mostrando modal...');
      this.showLoginModal = true;
    }
  }

  /**
   * Comprar ahora
   */
  buyNow(): void {
    if (this.authService.isAuthenticated() && this.product) {
      console.log('💳 Comprando ahora:', this.product.title);
      // Agregar al carrito y redirigir al checkout
      this.cartService.addToCart({ 
        product: this.product, 
        quantity: 1 
      });
      // Redirigir al checkout
      this.router.navigate(['/checkout']);
    } else {
      console.log('🔐 Usuario no autenticado, mostrando modal...');
      this.showLoginModal = true;
    }
  }

  /**
   * Cerrar el modal de login
   */
  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  /**
   * Ir al login desde el modal
   */
  goToLogin(): void {
    this.showLoginModal = false;
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: this.router.url } 
    });
  }

}
