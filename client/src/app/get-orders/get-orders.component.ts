import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-get-orders',
  templateUrl: './get-orders.component.html',
  styleUrls: ['./get-orders.component.scss']
})
export class GetOrdersComponent implements OnInit {

  orders: any[] = [];
  message: string = '';

  constructor(
    private http: HttpService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.message = "User not logged in";
      return;
    }

    this.http.getOrderByWholesalers(userId).subscribe({
      next: (res) => {
        this.orders = res;
      },
      error: () => {
        this.message = "Failed to load orders.";
      }
    });
  }
}
