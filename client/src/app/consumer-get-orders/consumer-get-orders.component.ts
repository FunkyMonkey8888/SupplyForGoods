import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

type OrderStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

@Component({
  selector: 'app-consumer-get-orders',
  templateUrl: './consumer-get-orders.component.html',
  styleUrls: ['./consumer-get-orders.component.scss']
})
export class ConsumerGetOrdersComponent implements OnInit {

  orders: any[] = [];
  userId!: number;

  loading = false;
  message = '';

  statusFilter: OrderStatus = 'ALL';
  statuses: OrderStatus[] = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  selectedOrder: any | null = null;
  detailsLoading = false;

  actionBusy: Record<number, boolean> = {};

  activeOrderId: number | null = null;

  ratings: { [orderId: number]: number } = {};
  comments: { [orderId: number]: string } = {};

  submittedFeedback: {
    [orderId: number]: { rating: number; comment: string }
  } = {};

  constructor(
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.auth.getUserId());

    if (!this.userId) {
      this.message = 'User not logged in.';
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

  loadOrders(): void {
    this.loading = true;
    this.message = '';
    this.selectedOrder = null;

    const status = (this.statusFilter || 'ALL').toUpperCase();

    const call$ =
      status === 'ALL'
        ? this.http.getOrderConsumer(this.userId)
        : this.http.getOrdersByConsumerAndStatus(this.userId, status);

    call$.subscribe({
      next: (res: any[]) => {
        this.orders = res || [];
        this.actionBusy = {};
        for (const o of this.orders) {
          const id = Number(o?.id);
          if (!isNaN(id)) this.actionBusy[id] = false;
        }
        this.loading = false;

        if (!this.orders.length) {
          this.message = status === 'ALL'
            ? 'No orders found.'
            : `No orders found with status ${status}.`;
        }
      },
      error: () => {
        this.message = 'Failed to load orders';
        this.loading = false;
      }
    });
  }

  viewOrder(orderId: number): void {
    this.selectedOrder = null;
    this.detailsLoading = true;
    this.message = '';

    this.http.getOrderByIdForConsumer(orderId).subscribe({
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

  canCancel(status?: string): boolean {
    const s = (status || '').toUpperCase();
    return s !== 'DELIVERED' && s !== 'CANCELLED';
  }

  cancelOrder(orderId: number, status?: string): void {
    if (!this.canCancel(status)) return;

    this.actionBusy[orderId] = true;
    this.message = '';

    this.http.cancelConsumerOrder(orderId).subscribe({
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

  canGiveFeedback(order: any): boolean {
    const s = (order?.status || '').toUpperCase();
    return s === 'DELIVERED' && !this.submittedFeedback[Number(order?.id)];
  }

  openFeedback(orderId: number): void {
    if (this.submittedFeedback[orderId]) return;
    this.activeOrderId = orderId;
    this.ratings[orderId] = this.ratings[orderId] || 0;
    this.comments[orderId] = this.comments[orderId] || '';
  }

  closeFeedback(): void {
    this.activeOrderId = null;
  }

  setRating(orderId: number, rating: number): void {
    this.ratings[orderId] = rating;
  }

  submitFeedback(orderId: number): void {
    const rating = this.ratings[orderId];
    const comment = this.comments[orderId];

    if (!rating) {
      this.message = 'Please select a rating';
      return;
    }

    // Keep your existing backend contract
    const payload = { content: comment };

    this.actionBusy[orderId] = true;
    this.message = '';

    this.http.addConsumerFeedBack(orderId, this.userId, payload).subscribe({
      next: () => {
        this.submittedFeedback[orderId] = { rating, comment };
        this.activeOrderId = null;
        this.actionBusy[orderId] = false;
      },
      error: () => {
        this.actionBusy[orderId] = false;
        this.message = 'Failed to submit feedback';
      }
    });
  }
}