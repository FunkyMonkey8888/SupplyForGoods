import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {}

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  SetRole(role: string) {
    localStorage.setItem('role', role);
  }

  get getRole(): string | null {
    return localStorage.getItem('role');
  }

  saveUserId(id: string) {
    localStorage.setItem('userId', id);
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  saveUsername(username: string) {
    localStorage.setItem('username', username);
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  get getLoginStatus(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  }
}