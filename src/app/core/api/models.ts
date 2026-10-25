// Shapes of the backend responses used by the company portal

export type ProductStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
export type CompanyRole = 'HEAD' | 'WORKER';
export type CompanyStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED';

export interface AuthResponse {
  token: string;
  user: { id: number; name: string; email: string; emailVerified: boolean; avatarUrl: string | null };
  role: 'USER' | 'ADMIN';
  companyId?: number | null;
  companyRole?: CompanyRole | null;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Membership {
  user: UserSummary;
  companyId: number;
  companyName: string;
  companyRole: CompanyRole;
  joinedAt: string;
}

export interface SocialLink {
  id?: string;
  platform: string;
  url: string;
}

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
  categoryName?: string;
}

export interface Company {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  phoneNumber: string | null;
  address: string | null;
  country: string;
  industry: string | null;
  subcategories: Subcategory[];
  socialLinks: SocialLink[];
  status: CompanyStatus;
}

export interface CompanyProfileRequest {
  description: string | null;
  phoneNumber: string | null;
  address: string | null;
  country: string;
  industry: string | null;
  socialLinks: { platform: string; url: string }[];
}

export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

// Row of the products table (GET /product/my)
export interface Product {
  id: number;
  name: string;
  description: string | null;
  categoryName: string | null;
  subcategoryName: string | null;
  image: ProductImage | null;
  createdAt: string;
  createdByName: string | null;
  updatedByName: string | null;
  status: ProductStatus;
}

// GET /product/c/{id}
export interface ProductDetails {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  subcategoryId: number | null;
  subcategoryName: string | null;
  averageRating: number;
  reviewsCount: number;
  images: ProductImage[];
  createdByName: string | null;
  updatedByName: string | null;
  status: ProductStatus;
}

export interface ProductRequest {
  name: string;
  description: string | null;
  subcategoryId: number | null;
  // DRAFT keeps it private; anything else submits it for review
  status: 'DRAFT' | 'PENDING_REVIEW';
}

export type ProductStatusCounts = Partial<Record<ProductStatus, number>>;

export interface Comment {
  id: number;
  content: string;
  actorName: string;
  actorType: 'USER' | 'COMPANY';
  actorId: number;
  actorAvatarUrl: string | null;
  reviewId: number;
  repliedToCommentId: number | null;
  repliedToActorName: string | null;
  likeCount: number;
  deleted: boolean;
  createdAt: string;
}

export interface Review {
  id: number;
  rating: number;
  content: string | null;
  user: { id: number; name: string; avatarUrl: string | null } | null;
  commentsCount: number;
  // The company's latest reply, if any
  previewComment: Comment | null;
  likeCount: number;
  createdAt: string;
  productId: number;
  productName: string;
}

export interface RecentReview {
  id: number;
  rating: number;
  content: string | null;
  userName: string;
  productName: string;
  productId: number;
  createdAt: string;
}

export interface CompanyDashboard {
  totalProducts: number;
  totalReviews: number;
  averageRating: number;
  totalTeamMembers: number;
  recentReviews: RecentReview[];
  unansweredReviews: number;
  ratingDistribution: Record<string, number>;
  productsByStatus: Record<string, number>;
  reviewsOverTime: { date: string; count: number }[];
}

export interface Invitation {
  id: number;
  userName: string;
  userEmail: string;
  invitedByName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  expired: boolean;
}
