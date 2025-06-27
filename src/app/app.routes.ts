import { Routes } from '@angular/router';
import { CardProduct } from './components/card-product/card-product';
import { Product } from './components/product/product';
import { ProductDetail } from './components/product-detail/product-detail';
import { Login } from './components/login/login';
import { CartComponent } from './components/cart/cart';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: Product },
    { path: 'products', component: Product },
    { 
        path: 'category/:categorySlug', 
        component: Product,
        data: { prerender: false } // Deshabilitar prerendering para rutas dinámicas
    },
    { path: 'product', component: CardProduct },
    { path: 'product/:id', component: ProductDetail },
    { path: 'login', component: Login },
    { path: 'cart', component: CartComponent },
    // Rutas protegidas que requieren autenticación
    { 
        path: 'checkout', 
        component: Product, // Cambiar por componente de checkout cuando esté listo
        canActivate: [AuthGuard] 
    },
    { path: '**', redirectTo: '' } // Wildcard route - debe ir al final
];
