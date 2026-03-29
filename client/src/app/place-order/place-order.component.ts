import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.scss']
})
export class PlaceOrderComponent implements OnInit {

  orderForm!: FormGroup;

  inventories: any[] = [];          // ✅ inventory is the source of truth
  selectedInventory: any = null;    // ✅ selected inventory, not product

  userId!: number;

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.auth.getUserId());
    this.buildForm();
    this.loadInventories();
  }

  private buildForm(): void {
    this.orderForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      status: ['PENDING']
    });
  }

  /* ✅ LOAD INVENTORY (NOT PRODUCTS) */
  private loadInventories(): void {
    this.http.getInventoryByWholesalers(this.userId).subscribe({
      next: inventories => {
        this.inventories = inventories;

        if (this.inventories.length === 0) {
          this.errorMessage =
            'You must add inventory before placing any orders.';
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load inventory';
      }
    });
  }

  /* ✅ SELECT INVENTORY */
  selectInventory(inventory: any): void {
    this.selectedInventory = inventory;
    this.successMessage = '';
    this.errorMessage = '';
  }

  /* ✅ PLACE ORDER WITH STOCK CHECK */
  placeOrder(): void {

    if (!this.selectedInventory) {
      this.errorMessage = 'Please select an inventory item';
      return;
    }

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const qty = this.orderForm.value.quantity;
    const availableStock = this.selectedInventory.stockQuantity;

    // ✅ CRITICAL VALIDATION
    if (qty > availableStock) {
      this.errorMessage =
        `Insufficient stock. Available: ${availableStock}`;
      return;
    }

    this.loading = true;

    this.http.placeOrder(
      {
        wholesalerId : this.userId,
        quantity: qty,
        status: 'PENDING'
      },
      this.selectedInventory.product.id, // ✅ correct productId
      this.userId
    ).subscribe({
      next: () => {
        this.successMessage = 'Order placed successfully';
        this.loading = false;
        this.orderForm.reset({ status: 'PENDING' });
        this.selectedInventory = null;
      },
      error: () => {
        this.errorMessage = 'Order placement failed';
        this.loading = false;
      }
    });
  }
}

// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { HttpService } from '../../services/http.service';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-place-order',
//   templateUrl: './place-order.component.html',
//   styleUrls: ['./place-order.component.scss']
// })
// export class PlaceOrderComponent implements OnInit {

//   orderForm!: FormGroup;

//   products: any[] = [];
//   inventories: any[] = [];
//   selectedProduct: any = null;

//   userId!: number | string;

//   loading = false;
//   successMessage = '';
//   errorMessage = '';

//   constructor(
//     private fb: FormBuilder,
//     private http: HttpService,
//     private auth: AuthService
//   ) {}

//   ngOnInit(): void {
//     this.userId = this.auth.getUserId()!;
//     this.buildForm();
//     this.loadInventoryAndProducts();
//   }

//   private buildForm(): void {
//     this.orderForm = this.fb.group({
//       quantity: ['', [Validators.required, Validators.min(1)]],
//       status: ['PENDING']
//     });
//   }

//   /* =====================================================
//      ✅ LOAD INVENTORY FIRST, THEN FILTER PRODUCTS
//      ===================================================== */
//   private loadInventoryAndProducts(): void {

//     this.http.getInventoryByWholesalers(this.userId).subscribe({
//       next: inventories => {
//         this.inventories = inventories;

//         if (this.inventories.length === 0) {
//           this.errorMessage =
//             'You must add inventory before placing any orders.';
//           return;
//         }

//         const productIdsWithInventory = inventories.map((i: { product: { id: any; }; }) => i.product.id);

//         this.http.getProductsByWholesaler().subscribe({
//           next: products => {
//             this.products = products.filter((p: { id: any; }) =>
//               productIdsWithInventory.includes(p.id)
//             );
//           },
//           error: () => {
//             this.errorMessage = 'Failed to load products';
//           }
//         });
//       },
//       error: () => {
//         this.errorMessage = 'Failed to load inventory';
//       }
//     });
//   }

//   selectProduct(product: any): void {
//     this.selectedProduct = product;
//     this.successMessage = '';
//     this.errorMessage = '';
//   }

//   placeOrder(): void {

//     if (!this.selectedProduct) {
//       this.errorMessage = 'Please select a product';
//       return;
//     }

//     if (this.orderForm.invalid) {
//       this.orderForm.markAllAsTouched();
//       return;
//     }

//     this.loading = true;

//     this.http.placeOrder(
//       this.orderForm.value,
//       this.selectedProduct.id,
//       this.userId
//     ).subscribe({
//       next: () => {
//         this.successMessage = 'Order placed successfully';
//         this.loading = false;
//         this.orderForm.reset({ status: 'PENDING' });
//         this.selectedProduct = null;
//       },
//       error: () => {
//         this.errorMessage = 'Order placement failed';
//         this.loading = false;
//         setTimeout(() => {
//           this.errorMessage = ''
//         }, 3000);
//       }
//     });
//   }
// }