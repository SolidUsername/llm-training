export interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  stock: number;
}

export interface ProductCreate {
  name: string;
  price: number;
  description: string | null;
  stock: number;
}

export interface ProductUpdate {
  name?: string;
  price?: number;
  description?: string | null;
  stock?: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export interface AddToCart {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItem {
  quantity: number;
}
