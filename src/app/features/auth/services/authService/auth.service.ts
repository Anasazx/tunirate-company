import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SharedService } from '../../../../core/services/sharedService/shared.service';
import { AuthResponse } from '../../../../core/api/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl: string;
  private tokenKey = 'auth_user';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.loadFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private sharedService: SharedService, private http: HttpClient) {
    this.authUrl = this.sharedService.publicUrl + '/auth';
  }

  login(request: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, request).pipe(
      tap(res => {
        this.saveToStorage(res);
        this.currentUserSubject.next(res);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value?.token;
  }

  isCompanyMember(): boolean {
    return !!this.currentUserSubject.value?.companyId;
  }

  private saveToStorage(res: AuthResponse) {
    try {
      localStorage.setItem(this.tokenKey, JSON.stringify(res));
    } catch (e) {
      console.error('Failed to persist auth token', e);
    }
  }

  private loadFromStorage(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(this.tokenKey);
      const stored = raw ? JSON.parse(raw) as AuthResponse : null;
      // Sessions saved before company info was part of the login response must sign in again
      return stored?.companyId ? stored : null;
    } catch (e) {
      console.error('Failed to read auth token from storage', e);
      return null;
    }
  }

}
