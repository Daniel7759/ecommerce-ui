import { Routes } from '@angular/router';
import { CardProduct } from './components/card-product/card-product';
import { Product } from './components/product/product';

export const routes: Routes = [
    { path: '', component: Product },
    { path: 'products', component: Product },
    { path: 'category/:categorySlug', component: Product },
    { path: 'product', component: CardProduct },
    { path: '**', redirectTo: '' } // Wildcard route - debe ir al final
];
