
export interface OrderDetail {
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

export interface Order {
  id: string;
  nameClient: string;
  nameCompany?: string;
  status: 'Pendiente' | 'Vendido' | 'Rechazado';
  total: number;
  users: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  orderDetails: OrderDetail[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDto {
  nameClient: string;
  nameCompany?: string;
  status?: 'Pendiente' | 'Vendido' | 'Rechazado';
  userId: string;
  orderDetails: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface UpdateOrderDto extends Partial<CreateOrderDto> {}