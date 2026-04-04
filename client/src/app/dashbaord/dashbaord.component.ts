import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { Router, NavigationEnd } from '@angular/router';
import { catchError, forkJoin, map, of, Subscription, filter } from 'rxjs';

declare var Chart: any;

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit, OnDestroy {
  role: string | null = null;
  username: string | null = null;
  userId: number | null = null;
  isLoggedIn = false;

  isMainDashboard = false;

  analytics: any = null;

  products: any[] = [];
  consumerOrders: any[] = [];
  wholesalerOrders: any[] = [];
  inventories: any[] = [];

  consumerPanel: 'orders' | 'wishlist' | 'cart' = 'orders';
  wishlist: any[] = [];
  cart: any[] = [];
  wishlistCount = 0;
  cartCount = 0;

  cartPlacing = false;
  cartMessage = '';
  cartMessageType: 'success' | 'danger' | 'info' = 'info';

  loading = false;
  error = '';

  private wholesalerChartInstance: any = null;
  private manufacturerChartInstance: any = null;

  notifications: any[] = [];
  showNotifications = false;
  private notifTimer: any = null;

  private routeSub?: Subscription;

  constructor(
    private auth: AuthService,
    private http: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setMainDashboardFlag(this.router.url);

    this.routeSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.setMainDashboardFlag(e.urlAfterRedirects));

    this.role = this.auth.getRole();
    this.username = this.auth.getUsername();
    this.userId = Number(this.auth.getUserId());
    this.isLoggedIn = !!this.role && !!this.userId;

    this.loadNotifications();
    this.notifTimer = setInterval(() => this.loadNotifications(), 15000);

    if (!this.isLoggedIn) return;

    if (this.role === 'MANUFACTURER') {
      this.loadManufacturerProducts();
      this.loadManufacturerAnalytics();
    }

    if (this.role === 'CONSUMER') {
      this.loadConsumerOrders();
      this.refreshWishlistCart();
    }

    if (this.role === 'WHOLESALER') {
      this.loadWholesalerOrders();
      this.loadWholesalerInventory();
      this.loadWholesalerAnalytics();
    }
  }

  private setMainDashboardFlag(url: string): void {
    const clean = url.split('?')[0].split('#')[0];
    const mainRoutes = ['/dashboard', '/dashbaord'];
    this.isMainDashboard = mainRoutes.includes(clean);
  }

  loadManufacturerProducts(): void {
    this.http.getProductsByManufacturer(this.userId!).subscribe({
      next: res => this.products = res,
      error: () => this.error = 'Failed to load products'
    });
  }

  loadConsumerOrders(): void {
    this.http.getOrderConsumer(this.userId!).subscribe({
      next: res => this.consumerOrders = res,
      error: () => this.error = 'Failed to load orders'
    });
  }

  loadWholesalerOrders(): void {
    this.http.getOrderByWholesalers(this.userId!).subscribe({
      next: res => this.wholesalerOrders = res,
      error: () => this.error = 'Failed to load wholesaler orders'
    });
  }

  loadWholesalerInventory(): void {
    this.http.getInventoryByWholesalers(this.userId!).subscribe({
      next: res => this.inventories = res,
      error: () => this.error = 'Failed to load inventory'
    });
  }

  loadWholesalerAnalytics(): void {
    const id = this.userId!;

    this.http.getWholesalerAnalytics(id).subscribe({
      next: basic => {
        this.analytics = { ...(this.analytics || {}), ...basic };
        setTimeout(() => this.renderWholesalerChart(), 0);
      },
      error: () => this.error = 'Failed to load wholesaler basic analytics'
    });

    this.http.getWholesalerAdvancedAnalytics(id).subscribe({
      next: adv => {
        this.analytics = { ...(this.analytics || {}), ...adv };
      },
      error: () => this.error = 'Failed to load wholesaler advanced analytics'
    });
  }

  loadManufacturerAnalytics(): void {
    const id = this.userId!;

    this.http.getManufacturerAnalytics(id).subscribe({
      next: basic => {
        this.analytics = { ...(this.analytics || {}), ...basic };
        setTimeout(() => this.renderManufacturerChart(), 0);
      },
      error: () => this.error = 'Failed to load manufacturer basic analytics'
    });

    this.http.getManufacturerAdvancedAnalytics(id).subscribe({
      next: adv => {
        this.analytics = { ...(this.analytics || {}), ...adv };
      },
      error: () => this.error = 'Failed to load manufacturer advanced analytics'
    });
  }

  showConsumerPanel(panel: 'orders' | 'wishlist' | 'cart'): void {
    this.consumerPanel = panel;
    this.cartMessage = '';
    this.refreshWishlistCart();
  }

  refreshWishlistCart(): void {
    if (!this.userId) return;
    this.wishlist = this.http.getWishlist(this.userId);
    this.cart = this.http.getCart(this.userId);
    this.wishlistCount = this.http.getWishlistCount(this.userId);
    this.cartCount = this.http.getCartCount(this.userId);
  }

  removeWishlistItem(productId: any): void {
    if (!this.userId) return;
    this.wishlist = this.http.removeFromWishlist(this.userId, productId);
    this.refreshWishlistCart();
  }

  moveWishlistToCart(item: any): void {
    if (!this.userId) return;
    const res = this.http.moveWishlistItemToCart(this.userId, item);
    this.wishlist = res.wishlist;
    this.cart = res.cart;
    this.refreshWishlistCart();
    this.cartMessage = 'Moved to cart 🛒';
    this.cartMessageType = 'success';
    setTimeout(() => this.cartMessage = '', 1500);
  }

  removeCartItem(productId: any): void {
    if (!this.userId) return;
    this.cart = this.http.removeFromCart(this.userId, productId);
    this.refreshWishlistCart();
  }

  incQty(item: any): void {
    if (!this.userId) return;
    const q = Number(item.quantity || 1) + 1;
    this.cart = this.http.updateCartQuantity(this.userId, item.productId, q);
    this.refreshWishlistCart();
  }

  decQty(item: any): void {
    if (!this.userId) return;
    const q = Math.max(1, Number(item.quantity || 1) - 1);
    this.cart = this.http.updateCartQuantity(this.userId, item.productId, q);
    this.refreshWishlistCart();
  }

  updateQtyFromInput(item: any, event: Event): void {
    if (!this.userId) return;
    const input = event.target as HTMLInputElement | null;
    const q = Number(input?.value || 1);
    this.cart = this.http.updateCartQuantity(this.userId, item.productId, q);
    this.refreshWishlistCart();
  }

  cartTotal(): number {
    return (this.cart || []).reduce(
      (sum: number, x: any) => sum + (Number(x.price || 0) * Number(x.quantity || 0)),
      0
    );
  }

  placeAllCartOrders(): void {
    if (!this.userId) return;

    if (!this.cart || this.cart.length === 0) {
      this.cartMessage = 'Your cart is empty.';
      this.cartMessageType = 'info';
      return;
    }

    this.cartPlacing = true;
    this.cartMessage = 'Placing orders…';
    this.cartMessageType = 'info';

    const requests = this.cart.map(item =>
      this.http.consumerPlaceOrder(
        { quantity: item.quantity, status: 'PLACED' },
        item.productId,
        this.userId
      ).pipe(
        map(() => ({ productId: item.productId, ok: true })),
        catchError(() => of({ productId: item.productId, ok: false }))
      )
    );

    forkJoin(requests).subscribe(results => {
      const failed = results.filter(r => !r.ok).map(r => Number(r.productId));
      const successCount = results.filter(r => r.ok).length;
      const failedCount = failed.length;

      if (failedCount === 0) {
        this.http.clearCart(this.userId);
        this.cartMessage = `✅ Successfully placed ${successCount} order(s)!`;
        this.cartMessageType = 'success';
      } else {
        const remaining = (this.cart || []).filter(x => failed.includes(Number(x.productId)));
        localStorage.setItem(`cart_${this.userId}`, JSON.stringify(remaining));
        this.cartMessage = `⚠️ Placed ${successCount} order(s), but ${failedCount} failed. Failed items remain in your cart.`;
        this.cartMessageType = 'danger';
      }

      this.cartPlacing = false;
      this.refreshWishlistCart();
      this.loadConsumerOrders();
      setTimeout(() => this.cartMessage = '', 3500);
    });
  }

  renderWholesalerChart(): void {
    if (!this.analytics) return;

    const canvas = document.getElementById('wholesalerChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.wholesalerChartInstance) this.wholesalerChartInstance.destroy();

    this.wholesalerChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Confirmed', 'Cancelled'],
        datasets: [{
          data: [
            Number(this.analytics.pendingOrders ?? 0),
            Number(this.analytics.confirmedOrders ?? 0),
            Number(this.analytics.cancelledOrders ?? 0)
          ],
          backgroundColor: ['#FBBF24', '#22C55E', '#EF4444'],
          borderColor: 'rgba(255,255,255,0.14)',
          borderWidth: 2,
          spacing: 4,
          borderRadius: 10,
          cutout: '68%'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  renderManufacturerChart(): void {
    if (!this.analytics) return;

    const canvas = document.getElementById('manufacturerChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.manufacturerChartInstance) this.manufacturerChartInstance.destroy();

    this.manufacturerChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Confirmed', 'Pending', 'Cancelled'],
        datasets: [{
          label: 'Orders',
          data: [
            Number(this.analytics.confirmedOrders ?? 0),
            Number(this.analytics.pendingOrders ?? 0),
            Number(this.analytics.cancelledOrders ?? 0)
          ],
          backgroundColor: ['#22C55E', '#FBBF24', '#EF4444'],
          borderRadius: 14,
          barThickness: 44,
          maxBarThickness: 54
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  loadNotifications(): void {
    if (!this.userId) return;

    this.http.getUnreadNotifications(this.userId).subscribe({
      next: res => this.notifications = res,
      error: () => {}
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markRead(nId: number): void {
    if (!this.userId) return;

    this.http.markNotificationRead(nId, this.userId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== nId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.notifTimer) clearInterval(this.notifTimer);
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.wholesalerChartInstance) this.wholesalerChartInstance.destroy();
    if (this.manufacturerChartInstance) this.manufacturerChartInstance.destroy();
  }
}