import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-consumer-get-orders',
  templateUrl: './consumer-get-orders.component.html',
  styleUrls: ['./consumer-get-orders.component.scss']
})
export class ConsumerGetOrdersComponent implements OnInit {

  orders: any[] = [];
  userId!: number;

  activeOrderId: number | null = null;

  ratings: { [orderId: number]: number } = {};
  comments: { [orderId: number]: string } = {};

  /** ✅ Track submitted feedback locally */
  submittedFeedback: {
    [orderId: number]: { rating: number; comment: string }
  } = {};

  constructor(
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.auth.getUserId());
    this.loadOrders();
  }

  loadOrders(): void {
    this.http.getOrderConsumer(this.userId).subscribe({
      next: res => this.orders = res,
      error: () => alert('Failed to load orders')
    });
  }

  openFeedback(orderId: number): void {
    if (this.submittedFeedback[orderId]) return;

    this.activeOrderId = orderId;
    this.ratings[orderId] = this.ratings[orderId] || 0;
    this.comments[orderId] = this.comments[orderId] || '';
  }

  setRating(orderId: number, rating: number): void {
    this.ratings[orderId] = rating;
  }

  submitFeedback(orderId: number): void {
    const rating = this.ratings[orderId];
    const comment = this.comments[orderId];

    if (!rating) {
      alert('Please select a rating');
      return;
    }

    const payload = { rating, comment };

    this.http.addConsumerFeedBack(orderId, this.userId, payload).subscribe({
      next: () => {
        /** ✅ Save feedback locally for viewing */
        this.submittedFeedback[orderId] = { rating, comment };

        this.activeOrderId = null;
      },
      error: () => alert('Failed to submit feedback')
    });
  }
}
