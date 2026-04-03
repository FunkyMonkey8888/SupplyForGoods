import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';

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

  loading = false;
  error = '';

  private wholesalerChartInstance: any = null;
  private manufacturerChartInstance: any = null;

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

    if (!this.isLoggedIn) return;

    if (this.role === 'MANUFACTURER') {
      this.loadManufacturerProducts();
      this.loadManufacturerAnalytics(); // ✅ merges basic + advanced
    }

    if (this.role === 'CONSUMER') {
      this.loadConsumerOrders();
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
}