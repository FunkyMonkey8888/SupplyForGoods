import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';

declare var Chart: any;

type StatMode = 'OVERVIEW' | 'OPERATIONS' | 'ENGAGEMENT';
type ChartView = 'DONUT' | 'BAR' | 'LINE';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
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

  statMode: StatMode = 'OVERVIEW';
  chartView: ChartView = 'DONUT';

  statModes: { key: StatMode; label: string }[] = [];
  chartViews: { key: ChartView; label: string }[] = [];

  kpis: { title: string; value: any; tone: 'purple' | 'blue' | 'orange' | 'pink' }[] = [];

  private chartRaf: number | null = null;

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

    this.statModes = this.buildStatModes();
    this.chartViews = this.buildChartViews();

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

    this.updateKpis();
  }

  private buildStatModes(): { key: StatMode; label: string }[] {
    if (this.role === 'CONSUMER') {
      return [
        { key: 'OVERVIEW', label: 'Shopping' },
        { key: 'OPERATIONS', label: 'Orders' },
        { key: 'ENGAGEMENT', label: 'Engagement' }
      ];
    }
    return [
      { key: 'OVERVIEW', label: 'Overview' },
      { key: 'OPERATIONS', label: 'Operations' },
      { key: 'ENGAGEMENT', label: 'Engagement' }
    ];
  }

  private buildChartViews(): { key: ChartView; label: string }[] {
    if (this.role === 'CONSUMER') return [];
    return [
      { key: 'DONUT', label: 'Donut' },
      { key: 'BAR', label: 'Bar' },
      { key: 'LINE', label: 'Line' }
    ];
  }

  setStatMode(mode: StatMode): void {
    this.statMode = mode;
    this.updateKpis();
  }

  setChartView(view: ChartView): void {
    this.chartView = view;
    this.scheduleRenderCharts();
  }

  private updateKpis(): void {
    const role = this.role || '';
    const a = this.analytics || {};
    const confirmed = Number(a.confirmedOrders ?? 0);
    const pending = Number(a.pendingOrders ?? 0);
    const cancelled = Number(a.cancelledOrders ?? 0);

    if (role === 'CONSUMER') {
      const orders = this.consumerOrders.length || 0;
      const wish = this.wishlistCount || 0;
      const cart = this.cartCount || 0;
      const total = this.cartTotal();

      if (this.statMode === 'OVERVIEW') {
        this.kpis = [
          { title: 'My Orders', value: orders, tone: 'pink' },
          { title: 'Wishlist', value: wish, tone: 'purple' },
          { title: 'Cart Items', value: cart, tone: 'blue' },
          { title: 'Cart Total', value: total, tone: 'orange' }
        ];
        return;
      }

      if (this.statMode === 'OPERATIONS') {
        this.kpis = [
          { title: 'Orders', value: orders, tone: 'blue' },
          { title: 'Wishlist Items', value: wish, tone: 'purple' },
          { title: 'Cart Items', value: cart, tone: 'pink' },
          { title: 'Checkout Ready', value: cart > 0 ? 'YES' : 'NO', tone: 'orange' }
        ];
        return;
      }

      this.kpis = [
        { title: 'Active Items', value: wish + cart, tone: 'purple' },
        { title: 'Engagement', value: wish > 0 ? 'High' : 'Low', tone: 'blue' },
        { title: 'Cart Intent', value: cart > 0 ? 'Strong' : 'None', tone: 'orange' },
        { title: 'Total Items', value: orders + wish + cart, tone: 'pink' }
      ];
      return;
    }

    if (role === 'MANUFACTURER') {
      const prod = this.products.length || 0;

      if (this.statMode === 'OVERVIEW') {
        this.kpis = [
          { title: 'Confirmed Orders', value: confirmed, tone: 'purple' },
          { title: 'Pending Orders', value: pending, tone: 'blue' },
          { title: 'Cancelled Orders', value: cancelled, tone: 'orange' },
          { title: 'Products', value: prod, tone: 'pink' }
        ];
        return;
      }

      if (this.statMode === 'OPERATIONS') {
        const total = confirmed + pending + cancelled;
        const rate = total ? Math.round((cancelled / total) * 100) + '%' : '0%';
        this.kpis = [
          { title: 'Products', value: prod, tone: 'pink' },
          { title: 'Orders Total', value: total, tone: 'blue' },
          { title: 'Cancellation Rate', value: rate, tone: 'orange' },
          { title: 'Confirmed', value: confirmed, tone: 'purple' }
        ];
        return;
      }

      this.kpis = [
        { title: 'Unique Wholesalers', value: this.analytics?.uniqueWholesalers ?? '-', tone: 'purple' },
        { title: 'Avg Order Qty', value: this.analytics?.avgOrderQuantity ?? '-', tone: 'blue' },
        { title: 'Cancellation Rate', value: (this.analytics?.cancellationRate != null) ? (this.analytics.cancellationRate + '%') : '-', tone: 'orange' },
        { title: 'Top Products', value: (this.analytics?.topProducts?.length ?? 0), tone: 'pink' }
      ];
      return;
    }

    if (role === 'WHOLESALER') {
      const inv = this.inventories.length || 0;
      const myOrders = this.wholesalerOrders.length || 0;

      if (this.statMode === 'OVERVIEW') {
        this.kpis = [
          { title: 'Confirmed Orders', value: confirmed, tone: 'purple' },
          { title: 'Pending Orders', value: pending, tone: 'blue' },
          { title: 'Cancelled Orders', value: cancelled, tone: 'orange' },
          { title: 'Inventory Items', value: inv, tone: 'pink' }
        ];
        return;
      }

      if (this.statMode === 'OPERATIONS') {
        this.kpis = [
          { title: 'My Orders', value: myOrders, tone: 'blue' },
          { title: 'Inventory Items', value: inv, tone: 'pink' },
          { title: 'Low Stock', value: this.analytics?.lowStockCount ?? '-', tone: 'orange' },
          { title: 'Total Stock', value: this.analytics?.totalStock ?? '-', tone: 'purple' }
        ];
        return;
      }

      this.kpis = [
        { title: 'Unique Consumers', value: this.analytics?.uniqueConsumers ?? '-', tone: 'purple' },
        { title: 'Avg Order Qty', value: this.analytics?.avgOrderQuantity ?? '-', tone: 'blue' },
        { title: 'Cancellation Rate', value: (this.analytics?.cancellationRate != null) ? (this.analytics.cancellationRate + '%') : '-', tone: 'orange' },
        { title: 'Top Products', value: (this.analytics?.topProducts?.length ?? 0), tone: 'pink' }
      ];
      return;
    }

    this.kpis = [];
  }

  trackByKpi(_: number, k: any): any {
    return k.title;
  }

  private scheduleRenderCharts(): void {
    if (this.chartRaf != null) cancelAnimationFrame(this.chartRaf);
    this.chartRaf = requestAnimationFrame(() => {
      this.chartRaf = null;
      this.renderCharts();
    });
  }

  private renderCharts(): void {
    if (!this.analytics) return;
    if (this.role === 'WHOLESALER') this.renderWholesalerChart();
    if (this.role === 'MANUFACTURER') this.renderManufacturerChart();
  }

  loadManufacturerProducts(): void {
    this.http.getProductsByManufacturer(this.userId!).subscribe({
      next: res => {
        this.products = res;
        this.updateKpis();
      },
      error: () => this.error = 'Failed to load products'
    });
  }

  loadConsumerOrders(): void {
    this.http.getOrderConsumer(this.userId!).subscribe({
      next: res => {
        this.consumerOrders = res;
        this.updateKpis();
      },
      error: () => this.error = 'Failed to load orders'
    });
  }

  loadWholesalerOrders(): void {
    this.http.getOrderByWholesalers(this.userId!).subscribe({
      next: res => {
        this.wholesalerOrders = res;
        this.updateKpis();
      },
      error: () => this.error = 'Failed to load wholesaler orders'
    });
  }

  loadWholesalerInventory(): void {
    this.http.getInventoryByWholesalers(this.userId!).subscribe({
      next: res => {
        this.inventories = res;
        this.updateKpis();
      },
      error: () => this.error = 'Failed to load inventory'
    });
  }

  loadWholesalerAnalytics(): void {
    const id = this.userId!;
    this.http.getWholesalerAnalytics(id).subscribe({
      next: basic => {
        this.analytics = { ...(this.analytics || {}), ...basic };
        this.updateKpis();
        this.scheduleRenderCharts();
      },
      error: () => this.error = 'Failed to load wholesaler basic analytics'
    });

    this.http.getWholesalerAdvancedAnalytics(id).subscribe({
      next: adv => {
        this.analytics = { ...(this.analytics || {}), ...adv };
        this.updateKpis();
      },
      error: () => this.error = 'Failed to load wholesaler advanced analytics'
    });
  }

  loadManufacturerAnalytics(): void {
    const id = this.userId!;
    this.http.getManufacturerAnalytics(id).subscribe({
      next: basic => {
        this.analytics = { ...(this.analytics || {}), ...basic };
        this.updateKpis();
        this.scheduleRenderCharts();
      },
      error: () => this.error = 'Failed to load manufacturer basic analytics'
    });

    this.http.getManufacturerAdvancedAnalytics(id).subscribe({
      next: adv => {
        this.analytics = { ...(this.analytics || {}), ...adv };
        this.updateKpis();
      },
      error: () => this.error = 'Failed to load manufacturer advanced analytics'
    });
  }

  refreshWishlistCart(): void {
    if (!this.userId) return;
    this.wishlist = this.http.getWishlist(this.userId);
    this.cart = this.http.getCart(this.userId);
    this.wishlistCount = this.http.getWishlistCount(this.userId);
    this.cartCount = this.http.getCartCount(this.userId);
    this.updateKpis();
  }

  cartTotal(): number {
    return (this.cart || []).reduce(
      (sum: number, x: any) => sum + (Number(x.price || 0) * Number(x.quantity || 0)),
      0
    );
  }

  renderWholesalerChart(): void {
    const canvas = document.getElementById('wholesalerChart') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (this.wholesalerChartInstance) this.wholesalerChartInstance.destroy();

    const confirmed = Number(this.analytics?.confirmedOrders ?? 0);
    const pending = Number(this.analytics?.pendingOrders ?? 0);
    const cancelled = Number(this.analytics?.cancelledOrders ?? 0);

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 350 }
    };

    if (this.chartView === 'DONUT') {
      this.wholesalerChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Confirmed', 'Pending', 'Cancelled'],
          datasets: [{
            data: [confirmed, pending, cancelled],
            backgroundColor: ['#7C3AED', '#3B82F6', '#F59E0B'],
            borderColor: 'rgba(255,255,255,0.14)',
            borderWidth: 2,
            spacing: 4,
            borderRadius: 12,
            cutout: '70%'
          }]
        },
        options: { ...baseOptions, plugins: { legend: { position: 'bottom' } } }
      });
      return;
    }

    if (this.chartView === 'BAR') {
      this.wholesalerChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Confirmed', 'Pending', 'Cancelled'],
          datasets: [{
            label: 'Orders',
            data: [confirmed, pending, cancelled],
            backgroundColor: ['rgba(124,58,237,0.75)', 'rgba(59,130,246,0.75)', 'rgba(245,158,11,0.75)'],
            borderRadius: 14,
            barThickness: 46
          }]
        },
        options: { ...baseOptions, plugins: { legend: { display: false } } }
      });
      return;
    }

    this.wholesalerChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Confirmed', 'Pending', 'Cancelled'],
        datasets: [{
          label: 'Orders',
          data: [confirmed, pending, cancelled],
          borderColor: 'rgba(99,102,241,0.95)',
          backgroundColor: 'rgba(99,102,241,0.18)',
          tension: 0.35,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: ['#7C3AED', '#3B82F6', '#F59E0B']
        }]
      },
      options: { ...baseOptions, plugins: { legend: { display: false } } }
    });
  }

  renderManufacturerChart(): void {
    const canvas = document.getElementById('manufacturerChart') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (this.manufacturerChartInstance) this.manufacturerChartInstance.destroy();

    const confirmed = Number(this.analytics?.confirmedOrders ?? 0);
    const pending = Number(this.analytics?.pendingOrders ?? 0);
    const cancelled = Number(this.analytics?.cancelledOrders ?? 0);

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 350 }
    };

    if (this.chartView === 'DONUT') {
      this.manufacturerChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Confirmed', 'Pending', 'Cancelled'],
          datasets: [{
            data: [confirmed, pending, cancelled],
            backgroundColor: ['#22C55E', '#FBBF24', '#EF4444'],
            borderColor: 'rgba(255,255,255,0.14)',
            borderWidth: 2,
            spacing: 4,
            borderRadius: 12,
            cutout: '70%'
          }]
        },
        options: { ...baseOptions, plugins: { legend: { position: 'bottom' } } }
      });
      return;
    }

    if (this.chartView === 'BAR') {
      this.manufacturerChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Confirmed', 'Pending', 'Cancelled'],
          datasets: [{
            label: 'Orders',
            data: [confirmed, pending, cancelled],
            backgroundColor: ['rgba(34,197,94,0.75)', 'rgba(251,191,36,0.75)', 'rgba(239,68,68,0.75)'],
            borderRadius: 14,
            barThickness: 46
          }]
        },
        options: { ...baseOptions, plugins: { legend: { display: false } } }
      });
      return;
    }

    this.manufacturerChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Confirmed', 'Pending', 'Cancelled'],
        datasets: [{
          label: 'Orders',
          data: [confirmed, pending, cancelled],
          borderColor: 'rgba(59,130,246,0.95)',
          backgroundColor: 'rgba(59,130,246,0.16)',
          tension: 0.35,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: ['#22C55E', '#FBBF24', '#EF4444']
        }]
      },
      options: { ...baseOptions, plugins: { legend: { display: false } } }
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
    if (this.chartRaf != null) cancelAnimationFrame(this.chartRaf);
    if (this.wholesalerChartInstance) this.wholesalerChartInstance.destroy();
    if (this.manufacturerChartInstance) this.manufacturerChartInstance.destroy();
  }
}