
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  slug?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}