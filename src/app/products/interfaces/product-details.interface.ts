export interface ProductDetails {
  id:          number;
  slug:        string;
  title:       string;
  description: string;
  categories:  Category[];
  colors:      Color[];
  lamps:       Lampara[];
  variants:    Variant[];
  images:      string[];
  novelty:     boolean;
}

export interface Category {
  slug: string;
  title: string;
}

export interface Color {
  id:   number;
  name: string;
  hexa: string;
}

export interface Lampara {
  id:   number;
  name: string;
  image: string;
}

export interface Variant {
  id:         number;
  code:       string;
  grafic:     null;
  attributes: Attribute[];
}

export interface Attribute {
  name:  string;
  value: string;
}
