import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

type Role = 'MANUFACTURER' | 'WHOLESALER' | string;

@Component({
  selector: 'app-get-orders',
  templateUrl: './get-orders.component.html',
  styleUrls: ['./get-orders.component.scss']
})
export class GetOrdersComponent implements OnInit {

  orders: any[] = [];
  message = '';

  role: Role | null = null;
  userId!: number;

  loading = false;

  statusFilter: string = 'ALL';
  statuses: string[] = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  pendingStatus: Record<number, string> = {};
  actionBusy: Record<number, boolean> = {};

  selectedOrder: any | null = null;
  detailsLoading = false;

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

    if (this.role !== 'WHOLESALER' && this.role !== 'MANUFACTURER') {
      this.message = 'Unauthorized: Orders page is only for Wholesalers and Manufacturers.';
      return;
    }

    this.loadOrders();
  }

  refresh(): void {
    this.loadOrders();
  }

  onFilterChange(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading = true;
    this.message = '';
    this.selectedOrder = null;

    const status = (this.statusFilter || 'ALL').toUpperCase();

    if (this.role === 'WHOLESALER') {
      const call$ =
        status === 'ALL'
          ? this.http.getConsumerOrdersForWholesaler(this.userId)
          : this.http.getConsumerOrdersForWholesalerByStatus(this.userId, status);

      call$.subscribe({
        next: (res: any[]) => {
          this.orders = res || [];
          this.initRowState();
          this.loading = false;
          if (!this.orders.length) this.message = status === 'ALL' ? 'No consumer orders found.' : `No orders found with status ${status}.`;
        },
        error: () => {
          this.message = 'Failed to load consumer orders.';
          this.loading = false;
        }
      });
      return;
    }

    if (this.role === 'MANUFACTURER') {
      const call$ =
        status === 'ALL'
          ? this.http.getOrdersByManufacturer(this.userId)
          : this.http.getOrdersByManufacturerAndStatus(this.userId, status);

      call$.subscribe({
        next: (res: any[]) => {
          this.orders = res || [];
          this.initRowState();
          this.loading = false;
          if (!this.orders.length) this.message = status === 'ALL' ? 'No manufacturer orders found.' : `No orders found with status ${status}.`;
        },
        error: () => {
          this.message = 'Failed to load manufacturer orders.';
          this.loading = false;
        }
      });
    }
  }

  private initRowState(): void {
    this.pendingStatus = {};
    this.actionBusy = {};
    for (const o of this.orders) {
      const id = Number(o?.id);
      if (!isNaN(id)) {
        this.pendingStatus[id] = (o?.status || 'PENDING').toUpperCase();
        this.actionBusy[id] = false;
      }
    }
  }

  updateStatus(orderId: number): void {
    if (this.role !== 'MANUFACTURER' && this.role !== 'WHOLESALER') return;

    const status = (this.pendingStatus[orderId] || '').toUpperCase();
    if (!status || status === 'ALL') return;

    this.actionBusy[orderId] = true;
    this.message = '';

    const apiCall =
      this.role === 'MANUFACTURER'
        ? this.http.updateOrderStatusByManufacturer(orderId, status)
        : this.http.updateOrderStatus(orderId, status);

    apiCall.subscribe({
      next: () => {
        this.actionBusy[orderId] = false;
        this.loadOrders();
      },
      error: (err) => {
        this.actionBusy[orderId] = false;
        this.message = err?.error?.message || 'Failed to update order status.';
      }
    });
  }

  canCancel(status?: string): boolean {
    const s = (status || '').toUpperCase();
    return s !== 'DELIVERED' && s !== 'CANCELLED';
  }

  cancelOrder(orderId: number, status?: string): void {
    if (!this.canCancel(status)) return;

    this.actionBusy[orderId] = true;
    this.message = '';

    const apiCall =
      this.role === 'MANUFACTURER'
        ? this.http.cancelManufacturerOrder(orderId)
        : this.http.cancelWholesalerOrder(orderId);

    apiCall.subscribe({
      next: () => {
        this.actionBusy[orderId] = false;
        this.loadOrders();
      },
      error: (err) => {
        this.actionBusy[orderId] = false;
        this.message = err?.error?.message || 'Failed to cancel order.';
      }
    });
  }

  viewOrder(orderId: number): void {
    this.selectedOrder = null;
    this.detailsLoading = true;
    this.message = '';

    const apiCall =
      this.role === 'MANUFACTURER'
        ? this.http.getOrderByIdForManufacturer(orderId)
        : this.http.getOrderByIdForWholesaler(orderId);

    apiCall.subscribe({
      next: (res: any) => {
        this.selectedOrder = res;
        this.detailsLoading = false;
      },
      error: () => {
        this.detailsLoading = false;
        this.message = 'Failed to load order details.';
      }
    });
  }

  closeDetails(): void {
    this.selectedOrder = null;
  }

  badgeClass(status?: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING') return 'badge pending';
    if (s === 'CONFIRMED') return 'badge confirmed';
    if (s === 'SHIPPED') return 'badge shipped';
    if (s === 'DELIVERED') return 'badge delivered';
    if (s === 'CANCELLED') return 'badge cancelled';
    return 'badge';
  }

  productName(order: any): string {
    return order?.product?.name || order?.productName || '-';
  }

  qty(order: any): any {
    return order?.quantity ?? '-';
  }

  customer(order: any): string {
    return order?.user?.username || order?.customerName || '-';
  }
}