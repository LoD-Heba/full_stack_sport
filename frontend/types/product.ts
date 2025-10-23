
export interface ProductImage {
  id: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  slug: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images?: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  slug?: string;
  price: number;
  stock: number;
  isAvailable?: boolean;
  images?: string[];
  categoryId: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}