
export interface EcommerceDetail {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface Ecommerce {
  id: string;
  nameClient: string;
  nameCompany?: string;
  status: 'Pendiente' | 'Vendido' | 'Rechazado';
  total: number;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  users: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  ecommerceDetail: EcommerceDetail[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEcommerceDto {
  clientId: string;
  nameClient: string;
  nameCompany?: string;
  status?: 'Pendiente' | 'Vendido' | 'Rechazado';
  userId: string;
  ecommerceDetail: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface UpdateEcommerceDto extends Partial<CreateEcommerceDto> {}