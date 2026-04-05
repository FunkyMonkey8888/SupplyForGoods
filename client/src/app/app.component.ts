import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  // ✅ Auth state
  IsLoggin = false;
  role: string | null = null;

  // ✅ UI state for navbar
  showMenu = false;       // user dropdown (Logout)
  isMenuOpen = false;     // mobile navbar toggle

  // ✅ Notifications state
  userId: number | null = null;
  notifications: any[] = [];
  showNotifications = false;

  // ✅ Public landing visibility
  isPublicHome = true;

  private notifTimer: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpService
  ) {}

  ngOnInit(): void {
    // ✅ Single clean router subscription
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        // ✅ Works even when hosted under /project/.../proxy/... paths
        const raw = e.urlAfterRedirects || e.url || this.router.url;
        const path = raw.split('?')[0].split('#')[0];

        // ✅ HOME = not login and not registration
        // (keeps landing on "/" and hides landing on "/login" and "/registration")
        this.isPublicHome =
          !path.includes('/login') &&
          !path.includes('/registration');

        this.refreshAuthState();

        // close dropdowns on navigation
        this.showMenu = false;
        this.isMenuOpen = false;
        this.showNotifications = false;
      });

    // initial state
    const initial = this.router.url.split('?')[0].split('#')[0];
    this.isPublicHome =
      !initial.includes('/login') &&
      !initial.includes('/registration');

    this.refreshAuthState();
  }

  private refreshAuthState(): void {
    const wasLoggedIn = this.IsLoggin;

    this.IsLoggin = this.authService.isLoggedIn();
    this.role = this.authService.getRole();

    const rawUserId = this.authService.getUserId();
    this.userId = rawUserId != null ? Number(rawUserId) : null;

    // ✅ Start polling when user logs in
    if (!wasLoggedIn && this.IsLoggin) {
      this.startNotificationPolling();
    }

    // ✅ Stop polling when user logs out
    if (wasLoggedIn && !this.IsLoggin) {
      this.stopNotificationPolling();
      this.notifications = [];
      this.showNotifications = false;
    }
  }

  // ✅ Toggle user dropdown (Logout)
  toggleMenu(event: Event): void {
    event.preventDefault();
    this.showMenu = !this.showMenu;
  }

  // ✅ Logout
  logout(): void {
    this.showMenu = false;
    this.isMenuOpen = false;
    this.showNotifications = false;

    this.stopNotificationPolling();
    this.authService.logout();
  }

  /* ================= NOTIFICATIONS ================= */

  private startNotificationPolling(): void {
    this.stopNotificationPolling(); // ensure no duplicates

    this.loadNotifications(); // load immediately
    this.notifTimer = setInterval(() => {
      this.loadNotifications();
    }, 15000); // every 15 seconds
  }

  private stopNotificationPolling(): void {
    if (this.notifTimer) {
      clearInterval(this.notifTimer);
      this.notifTimer = null;
    }
  }

  loadNotifications(): void {
    if (!this.userId) return;

    this.http.getUnreadNotifications(this.userId).subscribe({
      next: (res) => {
        this.notifications = res || [];
      },
      error: () => {
        // silent
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;

    // ✅ refresh when opening
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  markRead(nId: number): void {
    if (!this.userId) return;

    this.http.markNotificationRead(nId, this.userId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== nId);
      },
      error: () => {
        // silent
      }
    });
  }

  ngOnDestroy(): void {
    this.stopNotificationPolling();
  }
}