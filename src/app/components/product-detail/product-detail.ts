import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../model';
import { ActivatedRoute, Router } from '@angular/router';
import { Fakestore } from '../../services/fakestore.service';
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
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fakeStore: Fakestore
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

}
