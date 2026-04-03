import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class DashbaordComponent implements OnInit, OnDestroy {

  role: string | null = null;
  username: string | null = null;
  userId: number | null = null;
  isLoggedIn = false;

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

    if (this.isLoggedIn) {
      this.loadNotifications();
      this.notifTimer = setInterval(() => this.loadNotifications(), 15000);
    }

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

  loadManufacturerProducts(): void {
    this.http.getProductsByManufacturer(this.userId!).subscribe({
      next: res => this.products = res || [],
      error: () => this.error = 'Failed to load products'
    });
  }

  loadConsumerOrders(): void {
    this.http.getOrderConsumer(this.userId!).subscribe({
      next: res => this.consumerOrders = res || [],
      error: () => this.error = 'Failed to load orders'
    });
  }

  loadWholesalerOrders(): void {
    this.http.getOrderByWholesalers(this.userId!).subscribe({
      next: res => this.wholesalerOrders = res || [],
      error: () => this.error = 'Failed to load wholesaler orders'
    });
  }

  loadWholesalerInventory(): void {
    this.http.getInventoryByWholesalers(this.userId!).subscribe({
      next: res => this.inventories = res || [],
      error: () => this.error = 'Failed to load inventory'
    });
  }

  loadWholesalerAnalytics(): void {
    const id = this.userId!;

    this.http.getWholesalerAnalytics(id).subscribe({
      next: basic => {
        this.analytics = { ...(this.analytics || {}), ...(basic || {}) };
        setTimeout(() => this.renderWholesalerChart(), 0);
        this.renderWholesalerChart();
      },
      error: () => this.error = 'Failed to load wholesaler basic analytics'
    });

    this.http.getWholesalerAdvancedAnalytics(id).subscribe({
      next: adv => {
        this.analytics = { ...(this.analytics || {}), ...(adv || {}) };
        setTimeout(() => this.renderWholesalerChart(), 0);
      },
      error: () => this.error = 'Failed to load wholesaler advanced analytics'
    });
  }

  loadManufacturerAnalytics(): void {
    const id = this.userId!;

    this.http.getManufacturerAnalytics(id).subscribe({
      next: basic => {
        this.analytics = { ...(this.analytics || {}), ...(basic || {}) };
        setTimeout(() => this.renderManufacturerChart(), 0);
        this.renderManufacturerChart();
      },
      error: () => this.error = 'Failed to load manufacturer basic analytics'
    });

    this.http.getManufacturerAdvancedAnalytics(id).subscribe({
      next: adv => {
        this.analytics = { ...(this.analytics || {}), ...(adv || {}) };
        setTimeout(() => this.renderManufacturerChart(), 0);
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
    this.wishlist = this.http.getWishlist(this.userId) || [];
    this.cart = this.http.getCart(this.userId) || [];
    this.wishlistCount = this.http.getWishlistCount(this.userId) || 0;
    this.cartCount = this.http.getCartCount(this.userId) || 0;
  }

  removeWishlistItem(productId: any): void {
    if (!this.userId) return;
    this.wishlist = this.http.removeFromWishlist(this.userId, productId) || [];
    this.refreshWishlistCart();
  }

  moveWishlistToCart(item: any): void {
    if (!this.userId) return;
    const res = this.http.moveWishlistItemToCart(this.userId, item);
    this.wishlist = res?.wishlist || [];
    this.cart = res?.cart || [];
    this.refreshWishlistCart();
    this.cartMessage = 'Moved to cart 🛒';
    this.cartMessageType = 'success';
    setTimeout(() => this.cartMessage = '', 1500);
  }

  removeCartItem(productId: any): void {
    if (!this.userId) return;
    this.cart = this.http.removeFromCart(this.userId, productId) || [];
    this.refreshWishlistCart();
  }

  incQty(item: any): void {
    if (!this.userId) return;
    const q = Number(item.quantity || 1) + 1;
    this.cart = this.http.updateCartQuantity(this.userId, item.productId, q) || [];
    this.refreshWishlistCart();
  }

  decQty(item: any): void {
    if (!this.userId) return;
    const q = Math.max(1, Number(item.quantity || 1) - 1);
    this.cart = this.http.updateCartQuantity(this.userId, item.productId, q) || [];
    this.refreshWishlistCart();
  }

  updateQtyFromInput(item: any, event: Event): void {
    if (!this.userId) return;
    const input = event.target as HTMLInputElement | null;
    const q = Math.max(1, Number(input?.value || 1));
    this.cart = this.http.updateCartQuantity(this.userId, item.productId, q) || [];
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

  private getCssVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

private makeBarGradient(ctx: CanvasRenderingContext2D, height: number) {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, 'rgba(99,102,241,0.95)');
  g.addColorStop(1, 'rgba(59,130,246,0.55)');
  return g;
}

  renderWholesalerChart(): void {
  if (!this.analytics) return;

  if (this.wholesalerChartInstance) this.wholesalerChartInstance.destroy();

  const el = document.getElementById('wholesalerChart') as HTMLCanvasElement | null;
  if (!el) return;

  const pending = Number(this.analytics.pendingOrders ?? 0);
  const confirmed = Number(this.analytics.confirmedOrders ?? 0);
  const cancelled = Number(this.analytics.cancelledOrders ?? 0);
  const total = pending + confirmed + cancelled;

  const centerTextPlugin = {
    id: 'centerTextPlugin',
    afterDraw: (chart: any) => {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta?.data?.length) return;

      const x = meta.data[0].x;
      const y = meta.data[0].y;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = '800 18px Poppins, sans-serif';
      ctx.fillText(String(total), x, y - 6);

      ctx.fillStyle = 'rgba(229,231,235,0.70)';
      ctx.font = '700 12px Poppins, sans-serif';
      ctx.fillText('Total Orders', x, y + 14);
      ctx.restore();
    }
  };

  this.wholesalerChartInstance = new Chart(el, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'Confirmed', 'Cancelled'],
      datasets: [{
        data: [pending, confirmed, cancelled],
        backgroundColor: [
          'rgba(245,158,11,0.95)',  // amber
          'rgba(34,197,94,0.95)',   // green
          'rgba(239,68,68,0.95)'    // red
        ],
        borderColor: 'rgba(255,255,255,0.18)',
        borderWidth: 2,
        hoverBorderColor: 'rgba(255,255,255,0.45)',
        hoverBorderWidth: 2,
        spacing: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      animation: { duration: 800 },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'rgba(229,231,235,0.85)',
            font: { family: 'Poppins', size: 12, weight: '700' },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 18
          }
        },
        tooltip: {
          backgroundColor: 'rgba(10, 14, 30, 0.92)',
          titleColor: 'rgba(255,255,255,0.95)',
          bodyColor: 'rgba(229,231,235,0.85)',
          borderColor: 'rgba(255,255,255,0.14)',
          borderWidth: 1,
          padding: 12,
          displayColors: true
        }
      }
    },
    plugins: [centerTextPlugin]
  });
}


  renderManufacturerChart(): void {
  if (!this.analytics) return;

  if (this.manufacturerChartInstance) this.manufacturerChartInstance.destroy();

  const el = document.getElementById('manufacturerChart') as HTMLCanvasElement | null;
  if (!el) return;

  const ctx = el.getContext('2d');
  if (!ctx) return;

  const confirmed = Number(this.analytics.confirmedOrders ?? 0);
  const pending = Number(this.analytics.pendingOrders ?? 0);
  const cancelled = Number(this.analytics.cancelledOrders ?? 0);

  const gradient = this.makeBarGradient(ctx, el.height || 220);

  this.manufacturerChartInstance = new Chart(el, {
    type: 'bar',
    data: {
      labels: ['Confirmed', 'Pending', 'Cancelled'],
      datasets: [{
        label: 'Orders',
        data: [confirmed, pending, cancelled],
        backgroundColor: [
          'rgba(34,197,94,0.90)',     // green
          gradient as any,            // blue gradient
          'rgba(239,68,68,0.90)'      // red
        ],
        borderColor: 'rgba(255,255,255,0.18)',
        borderWidth: 1,
        borderRadius: 14,
        borderSkipped: false,
        maxBarThickness: 60
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      scales: {
        x: {
          ticks: {
            color: 'rgba(229,231,235,0.78)',
            font: { family: 'Poppins', size: 12, weight: '700' }
          },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: 'rgba(229,231,235,0.65)',
            font: { family: 'Poppins', size: 11, weight: '700' }
          },
          grid: { color: 'rgba(255,255,255,0.06)' }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: 'rgba(229,231,235,0.85)',
            font: { family: 'Poppins', size: 12, weight: '700' },
            usePointStyle: true,
            pointStyle: 'rectRounded'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(10, 14, 30, 0.92)',
          titleColor: 'rgba(255,255,255,0.95)',
          bodyColor: 'rgba(229,231,235,0.85)',
          borderColor: 'rgba(255,255,255,0.14)',
          borderWidth: 1,
          padding: 12
        }
      }
    }
  });
}

  loadNotifications(): void {
    if (!this.userId) return;

    this.http.getUnreadNotifications(this.userId).subscribe({
      next: (res) => this.notifications = res || [],
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
        this.notifications = (this.notifications || []).filter(n => n.id !== nId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.notifTimer) clearInterval(this.notifTimer);
    if (this.wholesalerChartInstance) this.wholesalerChartInstance.destroy();
    if (this.manufacturerChartInstance) this.manufacturerChartInstance.destroy();
  }
}