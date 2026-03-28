import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';


@Component({
  selector: 'app-get-orders',
  templateUrl: './get-orders.component.html',
  styleUrls: ['./get-orders.component.scss']
})
export class GetOrdersComponent implements OnInit {

  orderList: any[] = [];
  itemForm!: FormGroup;

  updateId: any = null;

  showError = false;
  errorMessage: any;

  showMessage = false;
  responseMessage: any;

  statusList = [
    'PLACED',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  ];

  constructor(
    private httpService: HttpService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      status: ['', Validators.required]
    });

    this.getOrders();
  }

  /* -----------------------------
     LOAD ORDERS
  ------------------------------ */
  getOrders(): void {
    const userId = localStorage.getItem('userId');

    this.httpService.getOrderByWholesalers(userId).subscribe({
      next: (res: any) => {
        this.orderList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load orders';
      }
    });
  }

  /* -----------------------------
     SELECT ORDER FOR UPDATE
  ------------------------------ */
  processOrder(order: any): void {
    this.updateId = order.id;
    this.itemForm.patchValue({
      status: ''
    });

    this.showMessage = false;
    this.showError = false;
  }

  /* -----------------------------
     UPDATE ORDER STATUS
  ------------------------------ */
  onSubmit(): void {
    if (!this.updateId) {
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.httpService.updateOrderStatus(
      this.updateId,
      this.itemForm.value.status
    ).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Order status updated successfully';
        this.updateId = null;
        this.itemForm.reset();
        this.getOrders();
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to update order status';
      }
    });
  }
}