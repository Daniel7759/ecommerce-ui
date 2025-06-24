import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Fakestore } from '../../services/fakestore.service';
import { CommonModule } from '@angular/common';
import { Product as ProductInterface, ProductCategory } from '../../model';
import { CardProduct } from '../card-product/card-product';
import { Carousel, CarouselSlide } from '../carousel/carousel';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-product',
  imports: [CommonModule, CardProduct, Carousel],
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
  
  // Carousel slides for home page
  carouselSlides: CarouselSlide[] = [
    {
      image: 'https://images.unsplash.com/photo-1580554430120-94cfcb3adf25?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Bienvenido a FakeStore',
      subtitle: 'Descubre los mejores productos al mejor precio',
      buttonText: 'Explorar Productos',
      alt: 'Banner Principal',
      buttonAction: () => this.router.navigate(['/products'])
    },
    {
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Ofertas Especiales',
      subtitle: 'Hasta 50% de descuento en productos seleccionados',
      buttonText: 'Ver Ofertas',
      alt: 'Ofertas Especiales'
    },
    {
      image: 'https://images.unsplash.com/photo-1745395436364-ed85bc5ea4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Ropa de Hombre',
      subtitle: 'Estilo y elegancia para cada ocasión',
      buttonText: 'Ver Colección',
      alt: 'Ropa de Hombre',
      buttonAction: () => this.router.navigate(['/category/mens-clothing'])
    },
    {
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Ropa de Mujer',
      subtitle: 'Moda femenina de última tendencia',
      buttonText: 'Ver Colección',
      alt: 'Ropa de Mujer',
      buttonAction: () => this.router.navigate(['/category/womens-clothing'])
    },
    {
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Electrónicos',
      subtitle: 'Tecnología de vanguardia',
      buttonText: 'Ver Productos',
      alt: 'Electrónicos',
      buttonAction: () => this.router.navigate(['/category/electronics'])
    }
  ];

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

  // Check if we're on the home page (no category selected)
  get isHomePage(): boolean {
    return !this.currentCategorySlug;
  }
}
