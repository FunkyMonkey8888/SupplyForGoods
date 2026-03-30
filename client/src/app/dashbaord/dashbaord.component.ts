import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {

  role: string | null = null;
  username: string | null = null;
  userId: number | string | null = null;
  isLoggedIn:boolean = false;

  products: any[] = [];
  consumerOrders: any[] = [];
  wholesalerOrders: any[] = [];
  inventories: any[] = [];

  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private http: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    this.username = this.auth.getUsername();
    this.userId = this.auth.getUserId();
    this.isLoggedIn = !!this.role && !!this.userId;

    if (!this.role || !this.userId) return;

    if (this.role === 'MANUFACTURER') {
      this.loadManufacturerProducts();
    }

    if (this.role === 'CONSUMER') {
      this.loadConsumerOrders();
    }

    if (this.role === 'WHOLESALER') {
      this.loadWholesalerOrders();
      this.loadWholesalerInventory();
    }
  }

  loadManufacturerProducts(): void {
    this.http.getProductsByManufacturer(this.userId!).subscribe({
      next: res => (this.products = res),
      error: () => (this.error = 'Failed to load products')
    });
  }

  loadConsumerOrders(): void {
    this.http.getOrderConsumer(this.userId!).subscribe(res => {
      this.consumerOrders = res;
    });
  }

  loadWholesalerOrders(): void {
    this.http.getOrderByWholesalers(this.userId!).subscribe(res => {
      this.wholesalerOrders = res;
    });
  }

  loadWholesalerInventory(): void {
    this.http.getInventoryByWholesalers(this.userId!).subscribe(res => {
      this.inventories = res;
    });
  }
}





// export class DashbaordComponent implements OnInit {

//   role: string | null = null;
//   username: string | null = null;
//   userId: number | string | null = null;

//   // Manufacturer
//   products: any[] = [];

//   // Consumer
//   consumerOrders: any[] = [];
//   filteredConsumerOrders: any[] = [];
//   orderSearchText = '';

//   // Wholesaler
//   wholesalerOrders: any[] = [];
//   filteredWholesalerOrders: any[] = [];
//   inventories: any[] = [];

//   loading = false;
//   error = '';

//   constructor(
//     private auth: AuthService,
//     private http: HttpService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.role = this.auth.getRole();
//     this.username = this.auth.getUsername();
//     this.userId = this.auth.getUserId();

//     if (!this.role || !this.userId) return;

//     if (this.role === 'MANUFACTURER') {
//       this.loadManufacturerProducts();
//     }

//     if (this.role === 'CONSUMER') {
//       this.loadConsumerOrders();
//     }

//     if (this.role === 'WHOLESALER') {
//       this.loadWholesalerOrders();
//       this.loadWholesalerInventory();
//     }
//   }

//   /* ================= MANUFACTURER ================= */

//   loadManufacturerProducts(): void {
//     this.loading = true;
//     this.http.getProductsByManufacturer(this.userId!).subscribe({
//       next: res => {
//         this.products = res;
//         this.loading = false;
//       },
//       error: () => {
//         this.error = 'Failed to load products';
//         this.loading = false;
//       }
//     });
//   }

//   editProduct(product: any): void {
//     this.router.navigate(['/update-product', product.id]);
//   }

//   deleteProduct(productId: number): void {
//     if (!confirm('Are you sure you want to delete this product?')) return;

//     this.http.deleteProductByManufacturer(
//       productId
//     ).subscribe(() => {
//       this.products = this.products.filter(p => p.id !== productId);
//     });
//   }

//   /* ================= CONSUMER ================= */

//   loadConsumerOrders(): void {
//     this.http.getOrderConsumer(this.userId!).subscribe(res => {
//       this.consumerOrders = res;
//       this.filteredConsumerOrders = res;
//     });
//   }

//   filterConsumerOrders(): void {
//     const text = this.orderSearchText.toLowerCase();
//     this.filteredConsumerOrders = this.consumerOrders.filter(o =>
//       o.product?.name.toLowerCase().includes(text) ||
//       o.status.toLowerCase().includes(text)
//     );
//   }

//   /* ================= WHOLESALER ================= */

//   loadWholesalerOrders(): void {
//     this.http.getOrderByWholesalers(this.userId!).subscribe(res => {
//       this.wholesalerOrders = res;
//       this.filteredWholesalerOrders = res;
//     });
//   }

//   filterWholesalerOrders(): void {
//     const text = this.orderSearchText.toLowerCase();
//     this.filteredWholesalerOrders = this.wholesalerOrders.filter(o =>
//       o.product?.name.toLowerCase().includes(text) ||
//       o.status.toLowerCase().includes(text)
//     );
//   }

//   loadWholesalerInventory(): void {
//     this.http.getInventoryByWholesalers(this.userId!).subscribe(res => {
//       this.inventories = res;
//     });
//   }
// }