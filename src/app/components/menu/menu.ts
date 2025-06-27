import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProductCategory, User, AuthState } from '../../model';
import { CommonModule } from '@angular/common';
import { Fakestore } from '../../services/fakestore.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../model/cart.interface';
import { Subject, takeUntil, combineLatest } from 'rxjs';

interface MenuCategory {
  label: string;
  href: string;
  apiValue: ProductCategory;
}

@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit, OnDestroy {

  menuCategories: MenuCategory[] = [];
  authState: AuthState = { isAuthenticated: false, user: null, token: null };
  cart: Cart | null = null;
  isCartDropdownOpen = false;
  private destroy$ = new Subject<void>();
  
  constructor(
    private router: Router,
    private fakestoreService: Fakestore,
    private authService: AuthService,
    private cartService: CartService
  ) {
    console.log('Menu constructor - Router disponible:', !!this.router);
    console.log('Menu constructor - FakeStore disponible:', !!this.fakestoreService);
  }

  ngOnInit(): void {
    // Combinar observables de autenticación y carrito
    combineLatest([
      this.authService.authState$,
      this.cartService.cart$
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([authState, cart]) => {
      this.authState = authState;
      this.cart = cart;
      console.log('🔐 Estado de auth actualizado en menu:', authState.isAuthenticated);
      console.log('🛒 Carrito actualizado en menu:', cart.itemCount, 'items');
    });

    // Cargar categorías
    this.initializeCategories();
  }

  private initializeCategories(): void {
    // Descomenta esta línea si quieres cargar categorías dinámicamente
    this.loadCategoriesFromAPI();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método para manejar selección de categoría con navegación
  onCategoryClick(category: MenuCategory, event: Event): void {
    event.preventDefault();
    console.log('Navegando a categoría:', category.label, 'Slug:', category.href);
    this.router.navigate(['/category', category.href]);
  }

  // Método para navegar al home (todos los productos)
  navigateToHome(): void {
    this.router.navigate(['/products']);
  }

  // Método helper para convertir categoría API a título
  formatCategoryLabel(category: ProductCategory): string {
    return category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Método helper para convertir categoría a slug
  categoryToSlug(category: ProductCategory): string {
    return category
      .toLowerCase()
      .replace(/'/g, '')
      .replace(/\s+/g, '-');
  }
  // Método alternativo para cargar categorías dinámicamente desde la API
  loadCategoriesFromAPI(): void {
    this.fakestoreService.getCategories().subscribe({
      next: (categories: ProductCategory[]) => {
        this.menuCategories = categories.map(category => ({
          label: this.formatCategoryLabel(category),
          href: this.categoryToSlug(category),
          apiValue: category
        }));
        console.log('Categorías cargadas dinámicamente');
      },
      error: (error: any) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  /**
   * Manejar click en login/logout
   */
  onAuthClick(): void {
    if (this.authState.isAuthenticated) {
      this.logout();
    } else {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Realizar logout
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  /**
   * Obtener nombre de usuario para mostrar
   */
  getUserDisplayName(): string {
    if (this.authState.user) {
      return `${this.authState.user.name.firstname} ${this.authState.user.name.lastname}`;
    }
    return '';
  }

  /**
   * Obtener número de items en el carrito
   */
  getCartItemCount(): number {
    return this.cart ? this.cart.itemCount : 0;
  }

  /**
   * Verificar si el carrito está vacío
   */
  isCartEmpty(): boolean {
    return !this.cart || this.cart.items.length === 0;
  }

  /**
   * Obtener items del carrito para el dropdown
   */
  getCartItems(): CartItem[] {
    return this.cart ? this.cart.items : [];
  }

  /**
   * Mostrar dropdown del carrito
   */
  showCartDropdown(): void {
    this.isCartDropdownOpen = true;
  }

  /**
   * Ocultar dropdown del carrito
   */
  hideCartDropdown(): void {
    this.isCartDropdownOpen = false;
  }

  /**
   * Navegar al carrito completo
   */
  navigateToCart(): void {
    this.isCartDropdownOpen = false;
    this.router.navigate(['/cart']);
  }

  /**
   * Remover item del carrito desde el dropdown
   */
  removeFromCart(productId: number, event: Event): void {
    event.stopPropagation();
    this.cartService.removeFromCart(productId);
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
   * Obtener total del carrito
   */
  getCartTotal(): number {
    return this.cart ? this.cart.total : 0;
  }

}
