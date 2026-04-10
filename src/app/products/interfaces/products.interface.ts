export interface ProductsResponse {
  count:    number;
  pages:    number;
  products: Product[];
}

export interface Product {
  id:          number;
  slug:        string;
  description: string;
  categories:  Category[];
  images:      string[];
  variants:    Variant[];
  title:       string;
  novelty:     boolean;
  order_novelty?:     number;
}

export interface Category {
  slug:  string;
  title: string;
}

export interface Variant {
  code: string;
}
