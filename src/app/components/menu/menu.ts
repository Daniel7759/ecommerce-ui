import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductCategory } from '../../model';
import { CommonModule } from '@angular/common';
import { Fakestore } from '../../services/fakestore.service';

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
export class Menu implements OnInit {

  menuCategories: MenuCategory[] = [];
  constructor(
    private router: Router,
    private fakestoreService: Fakestore
  ) {
    console.log('Menu constructor - Router disponible:', !!this.router);
    console.log('Menu constructor - FakeStore disponible:', !!this.fakestoreService);
  }

  ngOnInit(): void {
    // Descomenta esta línea si quieres cargar categorías dinámicamente
    this.loadCategoriesFromAPI();
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

}
