import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-consumer-get-orders',
  templateUrl: './consumer-get-orders.component.html',
  styleUrls: ['./consumer-get-orders.component.css']
})
export class ConsumerGetOrdersComponent implements OnInit {

  formModel: any = {};
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
    this.httpService.getOrderConsumer(userId).subscribe({
      next: (res) => {
        this.orderList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load orders';
      }
    });
  }

  addFeedback(order: any) {
    this.updateId = order.id;
    this.formModel = {};
    this.showMessage = false;
    this.showError = false;
  }

  onSubmit() {
    if (!this.updateId || !this.formModel.content) {
      return;
    }

    const userId = this.authService.getUserId();

    const payload = {
      content: this.formModel.content,
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
        this.formModel = {};
        this.getOrders();
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Feedback submission failed';
      }
    });
  }
}