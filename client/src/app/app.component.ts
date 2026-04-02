import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // ✅ Auth state
  IsLoggin = false;
  roleName: string | null = null;

  // ✅ UI state for navbar
  showMenu = false;
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.refreshAuthState();
        this.showMenu = false;
        this.isMenuOpen = false;
      }
    });

    this.refreshAuthState();
  }

  private refreshAuthState(): void {
    this.IsLoggin = this.authService.isLoggedIn();
    this.roleName = this.authService.getRole();
  }

  toggleMenu(event: Event): void {
    event.preventDefault();
    this.showMenu = !this.showMenu;
  }

  logout(): void {
    this.showMenu = false;
    this.isMenuOpen = false;
    this.authService.logout();
  }
}