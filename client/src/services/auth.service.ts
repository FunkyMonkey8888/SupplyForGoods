import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  /* ---------- SAVE METHODS ---------- */

  saveLoginData(token: string, role: string, userId: string, username: string): void {
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

  /* ---------- LOGOUT ---------- */

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']); // ✅ redirect properly
  }
}


// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   constructor() {}

//   saveToken(token: string) {
//     localStorage.setItem('token', token);
//   }

//   getToken(): string | null {
//     return localStorage.getItem('token');
//   }

//   SetRole(role: string) {
//     localStorage.setItem('role', role);
//   }

//   get getRole(): string | null {
//     return localStorage.getItem('role');
//   }

//   saveUserId(id: string) {
//     localStorage.setItem('userId', id);
//   }

//   getUserId(): string | null {
//     return localStorage.getItem('userId');
//   }

//   saveUsername(username: string) {
//     localStorage.setItem('username', username);
//   }

//   getUsername(): string | null {
//     return localStorage.getItem('username');
//   }

//   get getLoginStatus(): boolean {
//     return !!localStorage.getItem('token');
//   }

//   logout() {
//     localStorage.removeItem('token');
//     localStorage.removeItem('role');
//     localStorage.removeItem('userId');
//     localStorage.removeItem('username');
//   }
// }