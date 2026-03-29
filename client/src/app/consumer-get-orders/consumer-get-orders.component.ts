import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-consumer-get-orders',
  templateUrl: './consumer-get-orders.component.html',
  styleUrls: ['./consumer-get-orders.component.scss'],
  providers: [DatePipe]
})
export class ConsumerGetOrdersComponent implements OnInit {

  orders: any[] = [];
  message = '';

  constructor(
    private http: HttpService,
    private auth: AuthService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const userId = this.auth.getUserId();

    if (!userId) {
      this.message = 'User not logged in.';
      return;
    }

    this.loadOrders(userId);
  }

  private loadOrders(userId: number | string): void {
    this.http.getOrderConsumer(userId).subscribe({
      next: (res) => {
        this.orders = res;
      },
      error: () => {
        this.message = 'Failed to load orders.';
      }
    });
  }

  formatDate(date: any): string | null {
    return this.datePipe.transform(date, 'short');
  }
}