import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-consumer-place-order',
  templateUrl: './consumer-place-order.component.html',
  styleUrls: ['./consumer-place-order.component.scss']
})
export class ConsumerPlaceOrderComponent implements OnInit {

  orderForm!: FormGroup;

  products: any[] = [];
  selectedProduct: any = null;

  userId!: number;
  role: string | null = null;

  loading = false;
  successMessage = '';
  errorMessage = '';

  wishlistCount = 0;
  cartCount = 0;

  uiMessage = '';
  uiMessageType: 'success' | 'danger' | 'info' = 'info';

  // ✅ per-product quantity store
  productQty: Record<number, number> = {};

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.auth.getUserId());
    this.role = this.auth.getRole();

    this.buildForm();

    if (!this.userId || !this.role) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    if (this.role !== 'CONSUMER') {
      this.errorMessage = 'Only consumers can place orders here.';
      return;
    }

    this.refreshCounts();
    this.loadProducts();
  }

  private buildForm(): void {
    // ✅ quantity removed from flow (per-product qty is used in UI)
    this.orderForm = this.fb.group({
      status: ['PENDING']
    });
  }

  private refreshCounts(): void {
    this.wishlistCount = this.http.getWishlistCount(this.userId);
    this.cartCount = this.http.getCartCount(this.userId);
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private showUiMessage(msg: string, type: 'success' | 'danger' | 'info' = 'info'): void {
    this.uiMessage = msg;
    this.uiMessageType = type;
    setTimeout(() => {
      this.uiMessage = '';
    }, 1800);
  }

  private loadProducts(): void {
    this.http.getProductsByConsumers().subscribe({
      next: res => this.products = res || [],
      error: () => {
        this.errorMessage = 'Failed to load products.';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }

  refreshProducts(): void {
    this.loadProducts();
  }

  selectProduct(product: any): void {
    this.selectedProduct = product;
    this.clearMessages();

    // ✅ ensure qty is initialized for this product
    const id = Number(product?.id);
    if (id && !this.productQty[id]) this.productQty[id] = 1;
  }

  /* ===================== ✅ WISHLIST ===================== */

  isInWishlist(product: any): boolean {
    return this.http.isInWishlist(this.userId, product?.id);
  }

  toggleWishlist(product: any): void {
    this.http.toggleWishlist(this.userId, product);
    this.refreshCounts();
    const nowIn = this.isInWishlist(product);
    this.showUiMessage(nowIn ? 'Added to wishlist ♥' : 'Removed from wishlist', nowIn ? 'success' : 'info');
  }

  /* ===================== ✅ PER-PRODUCT QTY ===================== */

  getProductQty(product: any): number {
    const id = Number(product?.id);
    if (!id) return 1;
    if (!this.productQty[id]) this.productQty[id] = 1;
    return this.productQty[id];
  }

  incProductQty(product: any): void {
    const id = Number(product?.id);
    if (!id) return;
    this.productQty[id] = this.getProductQty(product) + 1;
  }

  decProductQty(product: any): void {
    const id = Number(product?.id);
    if (!id) return;
    this.productQty[id] = Math.max(1, this.getProductQty(product) - 1);
  }

  /* ===================== ✅ CART ===================== */

  // old method kept (adds 1)
  addToCart(product: any): void {
    const stock = Number(product?.stockQuantity ?? 0);
    if (!isNaN(stock) && stock === 0) {
      this.showUiMessage('Out of stock — cannot add to cart', 'danger');
      return;
    }

    this.http.addToCart(this.userId, product, 1);
    this.refreshCounts();
    this.showUiMessage('Added to cart 🛒', 'success');
  }

  // ✅ new method (adds selected qty)
  addToCartWithQty(product: any): void {
    const stock = Number(product?.stockQuantity ?? 0);
    if (!isNaN(stock) && stock === 0) {
      this.showUiMessage('Out of stock — cannot add to cart', 'danger');
      return;
    }

    const qty = this.getProductQty(product);
    this.http.addToCart(this.userId, product, qty);
    this.refreshCounts();
    this.showUiMessage(`Added ${qty} to cart 🛒`, 'success');
  }

  /* ===================== ✅ PLACE ORDER (uses per-product qty + stock verify API) ===================== */

  placeOrder(): void {
    this.clearMessages();

    if (this.role !== 'CONSUMER') {
      this.errorMessage = 'Only consumers can place orders here.';
      return;
    }

    if (!this.selectedProduct) {
      this.errorMessage = 'Please select a product';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    const productId = Number(this.selectedProduct?.id);
    const qty = this.getProductQty(this.selectedProduct);

    if (!qty || qty < 1) {
      this.errorMessage = 'Quantity must be at least 1';
      return;
    }

    this.loading = true;

    // ✅ verify latest stock before placing order
    this.http.getProductByConsumerById(productId).subscribe({
      next: (latest: any) => {
        const latestStock = Number(latest?.stockQuantity ?? 0);

        if (latestStock === 0) {
          this.errorMessage = 'Out of stock.';
          this.loading = false;
          this.selectedProduct = latest;
          return;
        }

        if (qty > latestStock) {
          this.errorMessage = `Insufficient stock. Available: ${latestStock}`;
          this.loading = false;
          this.selectedProduct = latest;
          return;
        }

        this.http.consumerPlaceOrder(
          { quantity: qty, status: 'PENDING' },
          productId,
          this.userId
        ).subscribe({
          next: () => {
            this.successMessage = `Order placed successfully (Qty: ${qty})`;
            this.loading = false;

            this.selectedProduct = null;

            this.refreshCounts();
            this.loadProducts();

            setTimeout(() => (this.successMessage = ''), 2500);
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'Order placement failed';
            this.loading = false;
            setTimeout(() => (this.errorMessage = ''), 3000);
          }
        });
      },
      error: () => {
        this.errorMessage = 'Unable to verify latest stock. Please try again.';
        this.loading = false;
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }

  placeOrderForProduct(product: any): void {
  this.selectProduct(product);
  this.placeOrder();
}
}