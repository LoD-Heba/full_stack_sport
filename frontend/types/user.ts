import { Role } from "./role";

// frontend/types/user.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  phone?: string;
  address: string;
  isEmailVerified: boolean;
  isActive: boolean;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  phone?: string;
  address: string;
  roleId: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  documentNumber?: string;
  phone?: string;
  address?: string;
  roleId?: string;
}