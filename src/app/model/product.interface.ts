/**
 * Interface para representar el rating de un producto de FakeStore API
 */
export interface ProductRating {
  rate: number;
  count: number;
}

/**
 * Interface para representar un producto de FakeStore API
 */
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
}

/**
 * Categorías disponibles en FakeStore API
 */
export type ProductCategory = 
  | "men's clothing" 
  | "women's clothing" 
  | "jewelery" 
  | "electronics";

/**
 * Interface extendida con información adicional que podrías necesitar
 */
export interface ProductExtended extends Product {
  quantity?: number;
  inCart?: boolean;
  isFavorite?: boolean;
}
