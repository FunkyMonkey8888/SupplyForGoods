import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private isLoggedIn = false;

  constructor() {}

  /* -------------------------------
     TOKEN MANAGEMENT
  -------------------------------- */

  saveToken(token: string): void {
    this.token = token;
    this.isLoggedIn = true;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  /* -------------------------------
     ROLE MANAGEMENT
  -------------------------------- */

  setRole(role: string): void {
    localStorage.setItem('role', role);
  }

  get getRole(): string | null {
    return localStorage.getItem('role');
  }

  /* -------------------------------
     LOGIN STATUS
  -------------------------------- */

  get getLoginStatus(): boolean {
    return localStorage.getItem('token') !== null;
  }

  /* -------------------------------
     USER ID MANAGEMENT
  -------------------------------- */

  saveUserId(userId: string): void {
    localStorage.setItem('userId', userId);
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  /* -------------------------------
     LOGOUT
  -------------------------------- */

  logout(): void {
    this.token = null;
    this.isLoggedIn = false;

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }
}