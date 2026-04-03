import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
 
  loading = false;
  successMessage = '';
  errorMessage = '';
 
  // ✅ Wishlist/Cart counts for quick feedback
  wishlistCount = 0;
  cartCount = 0;
 
  // small UI toast (separate from order success/error)
  uiMessage = '';
  uiMessageType: 'success' | 'danger' | 'info' = 'info';
 
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService
  ) {}
 
  ngOnInit(): void {
    this.userId = Number(this.auth.getUserId());
    this.buildForm();
    this.refreshCounts();
    this.loadProducts();
  }
 
  private buildForm(): void {
    this.orderForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      status: ['PLACED']
    });
  }
 
  private refreshCounts(): void {
    this.wishlistCount = this.http.getWishlistCount(this.userId);
    this.cartCount = this.http.getCartCount(this.userId);
  }
 
  private showUiMessage(msg: string, type: 'success' | 'danger' | 'info' = 'info'): void {
    this.uiMessage = msg;
    this.uiMessageType = type;
    setTimeout(() => {
      this.uiMessage = '';
    }, 1800);
  }
 
  /* ✅ Load products from ALL wholesalers */
  private loadProducts(): void {
    this.http.getProductsByConsumers().subscribe({
      next: res => this.products = res,
      error: () => {
        this.errorMessage = 'Failed to load products.';
      }
    });
  }
 
  selectProduct(product: any): void {
    this.selectedProduct = product;
    this.successMessage = '';
    this.errorMessage = '';
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
 
  /* ===================== ✅ CART ===================== */
 
  addToCart(product: any): void {
    // if stockQuantity exists and is 0 -> block
    const stock = Number(product?.stockQuantity ?? 0);
    if (!isNaN(stock) && stock === 0) {
      this.showUiMessage('Out of stock — cannot add to cart', 'danger');
      return;
    }
 
    this.http.addToCart(this.userId, product, 1);
    this.refreshCounts();
    this.showUiMessage('Added to cart 🛒', 'success');
  }
 
  /* ===================== EXISTING PLACE ORDER ===================== */
 
  placeOrder(): void {
 
    if (!this.selectedProduct) {
      this.errorMessage = 'Please select a product';
      return;
    }
 
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }
 
    this.loading = true;
 
    this.http.consumerPlaceOrder(
      {
        quantity: this.orderForm.value.quantity,
        status: 'PLACED'
      },
      this.selectedProduct.id,
      this.userId
    ).subscribe({
      next: () => {
        this.successMessage = 'Order placed successfully';
        this.loading = false;
        this.orderForm.reset({ status: 'PLACED' });
        this.selectedProduct = null;
      },
      error: () => {
        this.errorMessage = 'Order placement failed';
        this.loading = false;
      }
    });
  }
}