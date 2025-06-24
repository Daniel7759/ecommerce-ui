import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Fakestore } from '../../services/fakestore.service';
import { CommonModule } from '@angular/common';
import { Product as ProductInterface, ProductCategory } from '../../model';
import { CardProduct } from '../card-product/card-product';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-product',
  imports: [CommonModule, CardProduct],
  templateUrl: './product.html',
  styleUrl: './product.css'
})
export class Product implements OnInit, OnDestroy {

  products: ProductInterface[] = [];
  loading: boolean = false;
  error: string | null = null;
  viewMode: 'table' | 'cards' = 'cards';
  currentCategory: ProductCategory | null = null;
  currentCategorySlug: string | null = null;
  pageTitle: string = 'Todos los Productos';

  private destroy$ = new Subject<void>();

  // Mapeo de slugs a categorías de la API
  private slugToCategoryMap: { [key: string]: ProductCategory } = {
    'mens-clothing': "men's clothing",
    'womens-clothing': "women's clothing", 
    'jewelery': 'jewelery',
    'electronics': 'electronics'
  };

  // Mapeo de categorías a labels legibles
  private categoryToLabelMap: { [key in ProductCategory]: string } = {
    "men's clothing": "Men's Clothing",
    "women's clothing": "Women's Clothing",
    "jewelery": "Jewelery",    "electronics": "Electronics"
  };

  constructor(
    private fakeStoreService: Fakestore,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    // Precargar datos comunes al inicializar
    this.preloadData();
    
    // Escuchar cambios en los parámetros de la ruta
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const categorySlug = params['categorySlug'];
      
      if (categorySlug) {
        this.currentCategorySlug = categorySlug;
        this.currentCategory = this.slugToCategoryMap[categorySlug];
        
        if (this.currentCategory) {
          this.pageTitle = this.categoryToLabelMap[this.currentCategory];
          this.loadProductsByCategory(this.currentCategory);
        } else {
          // Slug no válido, redirigir a productos
          this.router.navigate(['/products']);
        }
      } else {
        // No hay categoría, cargar todos los productos
        this.currentCategory = null;
        this.currentCategorySlug = null;
        this.pageTitle = 'Todos los Productos';
        this.loadProducts();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    
    this.fakeStoreService.getAllProducts().subscribe({
      next: (products: ProductInterface[]) => {
        this.products = products;
        this.loading = false;
        console.log('Todos los productos cargados:');
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.error = 'Error al cargar los productos. Por favor, intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  loadProductsByCategory(category: ProductCategory): void {
    this.loading = true;
    this.error = null;
    
    this.fakeStoreService.getProductsByCategory(category).subscribe({
      next: (products: ProductInterface[]) => {
        this.products = products;
        this.loading = false;
        console.log(`Productos de la categoría "${category}":`);
      },
      error: (error) => {
        console.error('Error al cargar productos por categoría:', error);
        this.error = 'Error al cargar los productos de esta categoría. Por favor, intenta de nuevo.';
        this.loading = false;
      }
    });
  }
  // Método para precargar datos comunes al inicializar el componente
  preloadData(): void {
    // Precargar datos en segundo plano para mejorar la experiencia
    this.fakeStoreService.preloadCommonData();  }

  // Métodos para manejar eventos de las cards
  handleAddToCart(product: ProductInterface): void {
    console.log('Producto agregado al carrito:', product);
    // Aquí implementarías la lógica del carrito
  }

  handleViewProduct(product: ProductInterface): void {
    console.log('Ver producto:', product);
    // Aquí implementarías la navegación al detalle del producto
  }

  // Cambiar modo de vista
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'table' ? 'cards' : 'table';
  }

}
