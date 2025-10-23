// frontend/types/ecommerce.ts

export interface EcommerceDetail {
  id: string;
  productId: string;
  quantity: number;
  subTotal: number;
  product: {
    id: string;
    name: string;
    price: number;
    images?: Array<{ url: string }>;
  };
}

export interface Ecommerce {
  id: string;
  clientId: string;
  nameClient: string;
  nameCompany?: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  ecommerceDetail: EcommerceDetail[];
}

export interface CreateEcommerceDto {
  clientId: string;
  nameClient: string;
  nameCompany?: string;
  userId: string;
  ecommerceDetail: Array<{
    productId: string;
    quantity: number;
  }>;
}