import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpResponse, HttpHandler } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
}

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TIME = 5 * 60 * 1000; // 5 minutos

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Solo cachear peticiones GET
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    // Crear clave única para la petición
    const cacheKey = this.createCacheKey(req);
    
    // Verificar si existe en caché y no ha expirado
    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry && !this.isExpired(cachedEntry)) {
      console.log(`🚀 HTTP Cache HIT: ${req.url}`);
      return of(cachedEntry.response.clone());
    }

    // Si no está en caché o expiró, hacer la petición
    console.log(`🌐 HTTP Cache MISS: ${req.url}`);
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Guardar respuesta en caché
          this.cache.set(cacheKey, {
            response: event.clone(),
            timestamp: Date.now()
          });
          console.log(`💾 HTTP Response cached: ${req.url}`);
        }
      })
    );
  }

  private createCacheKey(req: HttpRequest<any>): string {
    return `${req.method}:${req.url}:${JSON.stringify(req.params)}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.CACHE_TIME;
  }

  // Método público para limpiar caché
  public clearCache(): void {
    this.cache.clear();
    console.log('🧹 HTTP Cache cleared');
  }
}
