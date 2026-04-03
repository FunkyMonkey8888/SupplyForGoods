import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
declare var Chart: any;

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {

  role: string | null = null;
  username: string | null = null;
  userId: number | null = null;
  isLoggedIn = false;

  analytics: any = null;

  products: any[] = [];
  consumerOrders: any[] = [];
  wholesalerOrders: any[] = [];
  inventories: any[] = [];

  // ✅ Wishlist/Cart state (consumer)
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

  constructor(
    private auth: AuthService,
    private http: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    this.username = this.auth.getUsername();
    this.userId = Number(this.auth.getUserId());
    this.isLoggedIn = !!this.role && !!this.userId;

    this.loadNotifications();
this.notifTimer = setInterval(() => this.loadNotifications(), 15000); // every 15 sec


    this.loadNotifications();
this.notifTimer = setInterval(() => this.loadNotifications(), 15000); // every 15 sec


    if (!this.isLoggedIn) return;

    if (this.role === 'MANUFACTURER') {
      this.loadManufacturerProducts();
      this.loadManufacturerAnalytics(); // ✅ merges basic + advanced // ✅ merges basic + advanced
    }

    if (this.role === 'CONSUMER') {
      this.loadConsumerOrders();
      this.refreshWishlistCart();
    }

    if (this.role === 'WHOLESALER') {
      this.loadWholesalerOrders();
      this.loadWholesalerInventory();
      this.loadWholesalerAnalytics();   // ✅ merges basic + advanced
    }
  }

  /* ================= DATA LOADERS ================= */

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

  /* ================= ANALYTICS (MERGED) ================= */

  loadWholesalerAnalytics(): void {
    const id = this.userId!;

    // ✅ Basic analytics (pending/confirmed/totalStock/lowStock)
    this.http.getWholesalerAnalytics(id).subscribe({
      next: basic => {
        this.analytics = { ...(this.analytics || {}), ...basic };
        this.renderWholesalerChart();
      },
      error: () => this.error = 'Failed to load wholesaler basic analytics'
    });

    // ✅ Advanced analytics (cancellationRate/uniqueConsumers/avgOrderQuantity/topProducts)
    this.http.getWholesalerAdvancedAnalytics(id).subscribe({
      next: adv => {
        this.analytics = { ...(this.analytics || {}), ...adv };
        // Optional: redraw chart if you want, not required
        // this.renderWholesalerChart();
      },
      error: () => this.error = 'Failed to load wholesaler advanced analytics'
    });
  }

  loadManufacturerAnalytics(): void {
    const id = this.userId!;

    // ✅ Basic analytics (total/confirmed/pending/cancelled)
    this.http.getManufacturerAnalytics(id).subscribe({
      next: basic => {
        this.analytics = { ...(this.analytics || {}), ...basic };
        this.renderManufacturerChart();
      },
      error: () => this.error = 'Failed to load manufacturer basic analytics'
    });

    // ✅ Advanced analytics (cancellationRate/uniqueWholesalers/avgOrderQuantity/topProducts)
    this.http.getManufacturerAdvancedAnalytics(id).subscribe({
      next: adv => {
        this.analytics = { ...(this.analytics || {}), ...adv };
        // Optional: redraw chart if you want, not required
        // this.renderManufacturerChart();
      },
      error: () => this.error = 'Failed to load manufacturer advanced analytics'
    });
  }

  /* ================= CONSUMER: WISHLIST + CART ================= */

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

  /* ✅ ✅ FIXED METHOD */
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

  /* ================= CHARTS ================= */

  renderWholesalerChart(): void {
    if (!this.analytics) return;

    if (this.wholesalerChartInstance) {
      this.wholesalerChartInstance.destroy();
    }

    this.wholesalerChartInstance = new Chart('wholesalerChart', {
      type: 'pie',
      data: {
        labels: ['Pending', 'Confirmed', 'Cancelled'],
        datasets: [{
          data: [
            this.analytics.pendingOrders ?? 0,
            this.analytics.confirmedOrders ?? 0,
            this.analytics.cancelledOrders ?? 0
          ],
          backgroundColor: ['#fbc02d', '#2e7d32', '#c62828']
        }]
      },
      options: { responsive: true }
    });
  }

  renderManufacturerChart(): void {
    if (!this.analytics) return;

    if (this.manufacturerChartInstance) {
      this.manufacturerChartInstance.destroy();
    }

    this.manufacturerChartInstance = new Chart('manufacturerChart', {
      type: 'bar',
      data: {
        labels: ['Confirmed', 'Pending', 'Cancelled'],
        datasets: [{
          label: 'Orders',
          data: [
            this.analytics.confirmedOrders ?? 0,
            this.analytics.pendingOrders ?? 0,
            this.analytics.cancelledOrders ?? 0
          ],
          backgroundColor: ['#2e7d32', '#fbc02d', '#c62828']
        }]
      },
      options: { responsive: true }
    });
  }

  loadNotifications(): void {
  if (!this.userId) return;

  this.http.getUnreadNotifications(this.userId).subscribe({
    next: (res) => this.notifications = res,
    error: () => { /* silently ignore for UX */ }
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
}
}