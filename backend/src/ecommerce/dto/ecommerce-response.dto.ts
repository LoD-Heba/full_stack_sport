export class EcommerceResponseDto {
  id: string;
  nameClient: string;
  nameCompany?: string;
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  
  details: {
    id: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
    product: {
      id: string;
      name: string;
      price: number;
    };
  }[];
}