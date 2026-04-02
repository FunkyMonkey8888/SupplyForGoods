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
      this.loadManufacturerAnalytics();
    }

    if (this.role === 'CONSUMER') {
      this.loadConsumerOrders();
    }

    if (this.role === 'WHOLESALER') {
      this.loadWholesalerOrders();
      this.loadWholesalerInventory();
      this.loadWholesalerAnalytics();
    }
  }

  /* ================= ANALYTICS ================= */

  loadWholesalerAnalytics(): void {
    this.http.getWholesalerAnalytics(this.userId!).subscribe({
      next: (data) => {
        this.analytics = data;
        this.renderWholesalerChart();
      },
      error: () => this.error = 'Failed to load wholesaler analytics'
    });
  }

  loadManufacturerAnalytics(): void {
    this.http.getManufacturerAnalytics(this.userId!).subscribe({
      next: (data) => {
        this.analytics = data;
        this.renderManufacturerChart();
      },
      error: () => this.error = 'Failed to load manufacturer analytics'
    });
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

  /* ================= CHARTS ================= */

  renderWholesalerChart(): void {
    new Chart('wholesalerChart', {
      type: 'pie',
      data: {
        labels: ['Pending', 'Confirmed', 'Cancelled'],
        datasets: [{
          data: [
            this.analytics.pendingOrders,
            this.analytics.confirmedOrders,
            this.analytics.cancelledOrders
          ],
          backgroundColor: ['#fbc02d', '#2e7d32', '#c62828']
        }]
      }
    });
  }

  renderManufacturerChart(): void {
    new Chart('manufacturerChart', {
      type: 'bar',
      data: {
        labels: ['Confirmed', 'Pending', 'Cancelled'],
        datasets: [{
          label: 'Orders',
          data: [
            this.analytics.confirmedOrders,
            this.analytics.pendingOrders,
            this.analytics.cancelledOrders
          ],
          backgroundColor: ['#2e7d32', '#fbc02d', '#c62828']
        }]
      }
    });
  }
}