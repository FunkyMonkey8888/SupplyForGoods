import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-get-orders',
  templateUrl: './get-orders.component.html',
  styleUrls: ['./get-orders.component.css']
})
export class GetOrdersComponent implements OnInit {

  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  orderList: any[] = [];
  showMessage: boolean = false;
  responseMessage: any;
  updateId: any;

  constructor(
    private httpService: HttpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders() {
    const userId = this.authService.getUserId();
    this.httpService.getOrderByWholesalers(userId).subscribe({
      next: (res) => {
        this.orderList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load orders';
      }
    });
  }

  processOrder(order: any) {
    this.updateId = order.id;
    this.formModel.status = null;
    this.showMessage = false;
    this.showError = false;
  }

  onSubmit() {
    if (!this.updateId || !this.formModel.status) {
      return;
    }

    this.httpService.updateOrderStatus(
      this.updateId,
      this.formModel.status
    ).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Order status updated successfully';
        this.updateId = null;
        this.formModel.status = null;
        this.getOrders();
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Invalid order status update';
      }
    });
  }

  getAllowedStatus(currentStatus: string): string[] {
    switch (currentStatus) {
      case 'PENDING':
        return ['CONFIRMED', 'SHIPPED', 'CANCELLED'];
      case 'CONFIRMED':
        return ['SHIPPED', 'CANCELLED'];
      case 'SHIPPED':
        return ['DELIVERED'];
      default:
        return [];
    }
  }
}