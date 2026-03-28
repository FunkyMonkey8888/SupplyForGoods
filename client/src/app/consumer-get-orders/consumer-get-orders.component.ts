import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';


@Component({
  selector: 'app-consumer-get-orders',
  templateUrl: './consumer-get-orders.component.html',
  styleUrls: ['./consumer-get-orders.component.scss']
})
export class ConsumerGetOrdersComponent implements OnInit {

  orderList: any[] = [];

  itemForm!: FormGroup;
  updateId: any = null;

  showError = false;
  errorMessage: any;

  showMessage = false;
  responseMessage: any;

  constructor(
    private httpService: HttpService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      content: ['', Validators.required]
    });

    this.getOrders();
  }

  /* -----------------------------
     LOAD CONSUMER ORDERS
  ------------------------------ */
  getOrders(): void {
    const userId = localStorage.getItem('userId');

    this.httpService.getOrderConsumer(userId).subscribe({
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
     SELECT ORDER FOR FEEDBACK
  ------------------------------ */
  addFeedback(order: any): void {
    this.updateId = order.id;
    this.itemForm.reset();

    this.showError = false;
    this.showMessage = false;
  }

  /* -----------------------------
     SUBMIT FEEDBACK
  ------------------------------ */
  onSubmit(): void {
    if (!this.updateId) {
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const userId = localStorage.getItem('userId');

    const payload = {
      content: this.itemForm.value.content,
      timestamp: new Date()
    };

    this.httpService.addConsumerFeedBack(
      this.updateId,
      userId,
      payload
    ).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Feedback submitted successfully';
        this.updateId = null;
        this.itemForm.reset();
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to submit feedback';
      }
    });
  }
}