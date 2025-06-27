import { Routes } from '@angular/router';
import { CardProduct } from './components/card-product/card-product';
import { Product } from './components/product/product';
import { ProductDetail } from './components/product-detail/product-detail';

export const routes: Routes = [
    { path: '', component: Product },
    { path: 'products', component: Product },
    { 
        path: 'category/:categorySlug', 
        component: Product,
        data: { prerender: false } // Deshabilitar prerendering para rutas dinámicas
    },
    { path: 'product', component: CardProduct },
    { path: 'product/:id', component: ProductDetail},
    { path: '**', redirectTo: '' } // Wildcard route - debe ir al final
];
