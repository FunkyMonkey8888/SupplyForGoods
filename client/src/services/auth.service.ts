import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  /* ---------- SAVE METHODS ---------- */

  saveLoginData(
    token: string,
    role: string,
    userId: string,
    username: string
  ): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
  }

  /* ---------- GETTERS ---------- */

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** ✅ NORMALIZED ROLE */
  getRole(): string | null {
    const role = localStorage.getItem('role');
    if (!role) return null;

    return role.startsWith('ROLE_')
      ? role.replace('ROLE_', '')
      : role;
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  /** ✅ CORRECT LOGIN CHECK */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /* ---------- ✅ ADMIN PROTECTION METHODS ---------- */

  /** ✅ Check if current user is ADMIN */
  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  /**
   * ✅ Enforce admin access
   * Redirects non-admin users safely
   */
  requireAdmin(): boolean {
    if (this.isAdmin()) {
      return true;
    }

    this.router.navigate(['/unauthorized']); // or /login
    return false;
  }

  /* ---------- LOGOUT ---------- */

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}