
import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-get-orders',
  templateUrl: './get-orders.component.html',
  styleUrls: ['./get-orders.component.scss']
})
export class GetOrdersComponent implements OnInit {

  orders: any[] = [];
  message = '';

  role: string | null = null;
  userId!: number;

  loading = false;

  constructor(
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    this.userId = Number(this.auth.getUserId());

    if (!this.role || !this.userId) {
      this.message = 'User not logged in.';
      return;
    }

    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading = true;
    this.message = '';

    if (this.role === 'CONSUMER') {
      this.message = 'Consumers do not manage orders here.';
      this.loading = false;
      return;
    }

    if (this.role === 'WHOLESALER') {
      this.http.getConsumerOrdersForWholesaler(this.userId).subscribe({
        next: res => {
          this.orders = res;
          this.loading = false;
        },
        error: () => {
          this.message = 'Failed to load consumer orders.';
          this.loading = false;
        }
      });
      return;
    }

    if (this.role === 'MANUFACTURER') {
      this.http.getOrdersByManufacturer(this.userId).subscribe({
        next: res => {
          this.orders = res;
          this.loading = false;
        },
        error: () => {
          this.message = 'Failed to load manufacturer orders.';
          this.loading = false;
        }
      });
    }
  }

  updateStatus(orderId: number, status: string): void {
  if (this.role !== 'MANUFACTURER' && this.role !== 'WHOLESALER') return;

  const apiCall =
    this.role === 'MANUFACTURER'
      ? this.http.updateOrderStatusByManufacturer(orderId, status)
      : this.http.updateOrderStatus(orderId, status);

  apiCall.subscribe({
    next: () => this.loadOrders(),
    error: (err) => {
      this.message = err?.error?.message || 'Insufficient inventory stock';
    }
  });
}
}