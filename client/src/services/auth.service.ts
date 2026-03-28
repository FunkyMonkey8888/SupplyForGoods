import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

<<<<<<< HEAD
=======
  constructor() {}

>>>>>>> 53ec9a5451e84798ae6dac9500784838a5976677
  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

<<<<<<< HEAD
  saveUserId(userId: string) {
    localStorage.setItem('userId', userId);
  }

  setRole(role: string) {
    localStorage.setItem('role', role);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getLoginStatus(): boolean {
    return this.getToken() !== null;
=======
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
>>>>>>> 53ec9a5451e84798ae6dac9500784838a5976677
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
<<<<<<< HEAD
  }
}
=======
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  }
}
>>>>>>> 53ec9a5451e84798ae6dac9500784838a5976677
