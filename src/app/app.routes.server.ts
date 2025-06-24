import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas estáticas que se prerenderizarán
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'products',
    renderMode: RenderMode.Prerender
  },
  // Rutas dinámicas se renderizan solo en el cliente
  {
    path: 'category/**',
    renderMode: RenderMode.Client
  },
  // Cualquier otra ruta se renderizará en el servidor bajo demanda
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
