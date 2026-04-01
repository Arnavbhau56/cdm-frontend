// Auth service: handles login, logout, and JWT token storage in localStorage.

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'cdm_access';
  private readonly REFRESH_KEY = 'cdm_refresh';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<{ access: string; refresh: string }>(
      `${environment.apiUrl}/auth/login/`,
      { username, password }
    ).pipe(
      tap(tokens => {
        localStorage.setItem(this.TOKEN_KEY, tokens.access);
        localStorage.setItem(this.REFRESH_KEY, tokens.refresh);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
