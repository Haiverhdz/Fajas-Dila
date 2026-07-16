export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  price: number; // en COP
  images: string[];
  sizes: string[];
  colors?: string[];
  features: string[];
  stock: number;
  featured: boolean;
};
