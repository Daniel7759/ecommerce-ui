import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, shareReplay, catchError, map } from 'rxjs';
import { Product, ProductCategory } from '../model';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expirationTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class Fakestore {

  private readonly urlBase: string = 'https://fakestoreapi.com/';
  private readonly urlProducts: string = this.urlBase + 'products';
  
  // Caché en memoria con expiración (5 minutos por defecto)
  private readonly CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutos en ms
  private cache = new Map<string, CacheEntry<any>>();
  
  // Caché reactivo para productos
  private allProducts$ = new BehaviorSubject<Product[] | null>(null);
  private categoriesCache$ = new BehaviorSubject<ProductCategory[] | null>(null);
  private productsByCategory = new Map<ProductCategory, BehaviorSubject<Product[] | null>>();

  constructor(private http: HttpClient) { }
  /**
   * Método helper para verificar si el caché está expirado
   */
  private isCacheExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.timestamp + entry.expirationTime;
  }

  /**
   * Método helper para obtener datos del caché
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && !this.isCacheExpired(entry)) {
      console.log(`🚀 Cache HIT para: ${key}`);
      return entry.data;
    }
    if (entry) {
      console.log(`⏰ Cache EXPIRADO para: ${key}`);
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Método helper para guardar datos en caché
   */
  private setCache<T>(key: string, data: T, customExpirationTime?: number): void {
    const expirationTime = customExpirationTime || this.CACHE_EXPIRATION_TIME;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expirationTime
    });
    console.log(`💾 Guardado en cache: ${key} (expira en ${expirationTime / 1000}s)`);
  }

  /**
   * Obtiene todos los productos (con caché inteligente)
   */
  getAllProducts(): Observable<Product[]> {
    const cacheKey = 'all-products';
    
    // Verificar caché en memoria
    const cachedData = this.getFromCache<Product[]>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // Verificar si ya tenemos datos en el BehaviorSubject
    if (this.allProducts$.value) {
      console.log('📦 Datos ya disponibles en BehaviorSubject');
      return of(this.allProducts$.value);
    }

    console.log('🌐 Realizando petición HTTP para todos los productos...');
    return this.http.get<Product[]>(this.urlProducts).pipe(
      map(products => {
        // Guardar en caché y BehaviorSubject
        this.setCache(cacheKey, products);
        this.allProducts$.next(products);
        return products;
      }),
      shareReplay(1), // Compartir la respuesta entre múltiples suscriptores
      catchError(error => {
        console.error('Error al obtener productos:', error);
        throw error;
      })
    );
  }
  /**
   * Obtiene un producto por su ID (con caché)
   */
  getProductById(id: number): Observable<Product> {
    const cacheKey = `product-${id}`;
    
    // Verificar caché primero
    const cachedProduct = this.getFromCache<Product>(cacheKey);
    if (cachedProduct) {
      return of(cachedProduct);
    }

    // Si tenemos todos los productos en caché, buscar ahí primero
    if (this.allProducts$.value) {
      const product = this.allProducts$.value.find(p => p.id === id);
      if (product) {
        console.log(`🔍 Producto ${id} encontrado en caché de todos los productos`);
        this.setCache(cacheKey, product);
        return of(product);
      }
    }

    console.log(`🌐 Realizando petición HTTP para producto ${id}...`);
    return this.http.get<Product>(`${this.urlProducts}/${id}`).pipe(
      map(product => {
        this.setCache(cacheKey, product);
        return product;
      }),
      shareReplay(1),
      catchError(error => {
        console.error(`Error al obtener producto ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtiene productos por categoría (con caché inteligente)
   */
  getProductsByCategory(category: ProductCategory): Observable<Product[]> {
    const cacheKey = `category-${category}`;
    
    // Verificar caché en memoria
    const cachedData = this.getFromCache<Product[]>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // Verificar si ya tenemos datos en el BehaviorSubject para esta categoría
    if (!this.productsByCategory.has(category)) {
      this.productsByCategory.set(category, new BehaviorSubject<Product[] | null>(null));
    }
    
    const categorySubject = this.productsByCategory.get(category)!;
    if (categorySubject.value) {
      console.log(`📦 Productos de categoría '${category}' ya disponibles en BehaviorSubject`);
      return of(categorySubject.value);
    }

    // Optimización: Si tenemos todos los productos, filtrar desde ahí
    if (this.allProducts$.value) {
      const filteredProducts = this.allProducts$.value.filter(product => product.category === category);
      console.log(`⚡ Filtrando categoría '${category}' desde caché de todos los productos`);
      this.setCache(cacheKey, filteredProducts);
      categorySubject.next(filteredProducts);
      return of(filteredProducts);
    }

    console.log(`🌐 Realizando petición HTTP para categoría '${category}'...`);
    return this.http.get<Product[]>(`${this.urlProducts}/category/${category}`).pipe(
      map(products => {
        // Guardar en caché y BehaviorSubject
        this.setCache(cacheKey, products);
        categorySubject.next(products);
        return products;
      }),
      shareReplay(1),
      catchError(error => {
        console.error(`Error al obtener productos de categoría '${category}':`, error);
        throw error;
      })
    );
  }
  /**
   * Obtiene todas las categorías disponibles (con caché)
   */
  getCategories(): Observable<ProductCategory[]> {
    const cacheKey = 'categories';
    
    // Verificar caché en memoria
    const cachedData = this.getFromCache<ProductCategory[]>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // Verificar BehaviorSubject
    if (this.categoriesCache$.value) {
      console.log('📦 Categorías ya disponibles en BehaviorSubject');
      return of(this.categoriesCache$.value);
    }

    console.log('🌐 Realizando petición HTTP para categorías...');
    return this.http.get<ProductCategory[]>(`${this.urlBase}products/categories`).pipe(
      map(categories => {
        // Guardar en caché (categorías rara vez cambian, caché más largo)
        this.setCache(cacheKey, categories, 30 * 60 * 1000); // 30 minutos
        this.categoriesCache$.next(categories);
        return categories;
      }),
      shareReplay(1),
      catchError(error => {
        console.error('Error al obtener categorías:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene un número limitado de productos (con caché)
   */
  getLimitedProducts(limit: number): Observable<Product[]> {
    const cacheKey = `limited-products-${limit}`;
    
    // Verificar caché
    const cachedData = this.getFromCache<Product[]>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // Si tenemos todos los productos y el límite es menor, usar esos datos
    if (this.allProducts$.value && this.allProducts$.value.length >= limit) {
      const limitedProducts = this.allProducts$.value.slice(0, limit);
      console.log(`⚡ Devolviendo ${limit} productos desde caché de todos los productos`);
      this.setCache(cacheKey, limitedProducts);
      return of(limitedProducts);
    }

    console.log(`🌐 Realizando petición HTTP para ${limit} productos...`);
    return this.http.get<Product[]>(`${this.urlProducts}?limit=${limit}`).pipe(
      map(products => {
        this.setCache(cacheKey, products);
        return products;
      }),
      shareReplay(1),
      catchError(error => {
        console.error(`Error al obtener ${limit} productos:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtiene productos ordenados (con caché)
   */
  getSortedProducts(sort: 'asc' | 'desc' = 'asc'): Observable<Product[]> {
    const cacheKey = `sorted-products-${sort}`;
    
    // Verificar caché
    const cachedData = this.getFromCache<Product[]>(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    console.log(`🌐 Realizando petición HTTP para productos ordenados (${sort})...`);
    return this.http.get<Product[]>(`${this.urlProducts}?sort=${sort}`).pipe(
      map(products => {
        this.setCache(cacheKey, products);
        return products;
      }),
      shareReplay(1),
      catchError(error => {
        console.error(`Error al obtener productos ordenados (${sort}):`, error);
        throw error;
      })
    );
  }

  /**
   * Métodos para gestión del caché
   */

  // Limpiar todo el caché
  clearCache(): void {
    this.cache.clear();
    this.allProducts$.next(null);
    this.categoriesCache$.next(null);
    this.productsByCategory.clear();
    console.log('🧹 Caché completamente limpiado');
  }

  // Limpiar caché expirado
  clearExpiredCache(): void {
    const now = Date.now();
    let cleared = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isCacheExpired(entry)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      console.log(`🧹 ${cleared} entradas de caché expiradas limpiadas`);
    }
  }

  // Invalidar caché específico
  invalidateCache(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ Caché invalidado para: ${key}`);
  }

  // Obtener estadísticas del caché
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Precargar datos comunes (útil para mejorar la experiencia de usuario)
   */
  preloadCommonData(): void {
    console.log('🔄 Precargando datos comunes...');
    
    // Precargar categorías (son pocas y no cambian frecuentemente)
    this.getCategories().subscribe({
      next: () => console.log('✅ Categorías precargadas'),
      error: (error) => console.error('❌ Error precargando categorías:', error)
    });

    // Precargar productos más populares
    this.getLimitedProducts(10).subscribe({
      next: () => console.log('✅ Top 10 productos precargados'),
      error: (error) => console.error('❌ Error precargando productos populares:', error)
    });
  }
}
