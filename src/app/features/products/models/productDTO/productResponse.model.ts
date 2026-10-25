import { ProductStatus } from "../../enums/productStatus.enum.model";

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  subcategoryName: string;
  companyId: number;
  companyName: string;
  companyIsVerified?: boolean;
  companyLogoUrl?: string;
  imageUrl: string;
  createdAt: string;
  createdByName: string;
  updatedByName: string | null;
  status: ProductStatus;
}
