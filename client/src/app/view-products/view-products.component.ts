import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-view-products',
  templateUrl: './view-products.component.html',
  styleUrls: ['./view-products.component.scss']
})
export class ViewProductsComponent implements OnInit {

  products: any[] = [];
  loading = false;
  message = '';

  constructor(
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    const manufacturerId = this.auth.getUserId();
    if (!manufacturerId) {
      this.message = 'Invalid user session.';
      return;
    }

    this.loading = true;

    this.http.getProductsByManufacturer(manufacturerId).subscribe({
      next: res => {
        this.products = res;
        this.loading = false;

        if (this.products.length === 0) {
          this.message = 'No products found.';
        }
      },
      error: () => {
        this.loading = false;
        this.message = 'Failed to load products.';
      }
    });
  }
}
