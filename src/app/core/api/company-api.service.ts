import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from '../services/sharedService/shared.service';
import { Page } from '../model/page.model';
import {
  Comment, Company, CompanyDashboard, CompanyProfileRequest, CompanyRole, Invitation, Membership, Product,
  ProductDetails, ProductImage, ProductRequest, ProductStatus, ProductStatusCounts, Review, Subcategory
} from './models';

// Every backend call the company portal makes, in one place
@Injectable({ providedIn: 'root' })
export class CompanyApiService {
  private http = inject(HttpClient);
  private api = inject(SharedService).publicUrl;

  // ── Account ──
  getMyMembership(): Observable<Membership> {
    return this.http.get<Membership>(`${this.api}/membership/me`);
  }

  // ── Company ──
  getMyCompany(): Observable<Company> {
    return this.http.get<Company>(`${this.api}/company/my`);
  }

  updateMyCompany(payload: CompanyProfileRequest, logo?: File, banner?: File): Observable<Company> {
    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (logo) form.append('logo', logo);
    if (banner) form.append('banner', banner);
    return this.http.put<Company>(`${this.api}/company/my`, form);
  }

  getDashboard(): Observable<CompanyDashboard> {
    return this.http.get<CompanyDashboard>(`${this.api}/dashboard`);
  }

  // ── Products ──
  getProducts(filters: { q?: string; status?: ProductStatus | null; page?: number; size?: number }): Observable<Page<Product>> {
    let params = new HttpParams().set('page', filters.page ?? 0).set('size', filters.size ?? 20).set('sort', 'createdAt,desc');
    if (filters.q) params = params.set('q', filters.q);
    if (filters.status) params = params.set('status', filters.status);
    return this.http.get<Page<Product>>(`${this.api}/product/my`, { params });
  }

  getProductStatusCounts(): Observable<ProductStatusCounts> {
    return this.http.get<ProductStatusCounts>(`${this.api}/product/my/status-counts`);
  }

  getProduct(id: number): Observable<ProductDetails> {
    return this.http.get<ProductDetails>(`${this.api}/product/c/${id}`);
  }

  createProduct(payload: ProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.api}/product/c`, payload);
  }

  updateProduct(id: number, payload: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.api}/product/c/${id}`, payload);
  }

  uploadProductImage(productId: number, file: File): Observable<ProductImage> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ProductImage>(`${this.api}/productImage/${productId}`, form);
  }

  setMainImage(imageId: number, productId: number): Observable<void> {
    return this.http.post<void>(`${this.api}/productImage/${imageId}/main`, {}, { params: { productId } });
  }

  deleteImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/productImage/${imageId}`);
  }

  getSubcategories(): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(`${this.api}/subcategories/all`);
  }

  // ── Reviews & replies ──
  getReviews(filters: { rating?: number | null; productId?: number | null; unanswered?: boolean; page?: number; size?: number }): Observable<Page<Review>> {
    let params = new HttpParams().set('page', filters.page ?? 0).set('size', filters.size ?? 10).set('sort', 'createdAt,desc');
    if (filters.rating) params = params.set('rating', filters.rating);
    if (filters.productId) params = params.set('productId', filters.productId);
    if (filters.unanswered) params = params.set('unanswered', true);
    return this.http.get<Page<Review>>(`${this.api}/reviews/c/my`, { params });
  }

  getComments(reviewId: number, page = 0, size = 50): Observable<Page<Comment>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,asc');
    return this.http.get<Page<Comment>>(`${this.api}/comments/review/${reviewId}`, { params });
  }

  // Posts as the company, not as the signed-in person
  replyToReview(reviewId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.api}/comments/c/review/${reviewId}`, { content });
  }

  replyToComment(commentId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.api}/comments/c/reply/${commentId}`, { content });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/comments/${commentId}`);
  }

  // ── Team (company head only) ──
  getTeam(): Observable<Membership[]> {
    return this.http.get<Membership[]>(`${this.api}/membership`);
  }

  changeRole(userId: number, companyRole: CompanyRole): Observable<Membership> {
    return this.http.patch<Membership>(`${this.api}/membership/my/role`, { userId, companyRole });
  }

  removeMember(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/membership`, { params: { userId } });
  }

  getInvitations(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.api}/invitations/company`);
  }

  invite(email: string): Observable<void> {
    return this.http.post<void>(`${this.api}/invitations`, { invitedUserEmail: email });
  }

  cancelInvitation(id: number): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.api}/invitations/${id}/cancel`, {});
  }
}
