import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

declare var Chart: any;

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {

  role: string | null = null;
  username: string | null = null;
  userId: number | null = null;
  isLoggedIn = false;

  analytics: any = null;

  products: any[] = [];
  consumerOrders: any[] = [];
  wholesalerOrders: any[] = [];
  inventories: any[] = [];

  // ✅ Wishlist/Cart state (consumer)
  consumerPanel: 'orders' | 'wishlist' | 'cart' = 'orders';
  wishlist: any[] = [];
  cart: any[] = [];
  wishlistCount = 0;
  cartCount = 0;

  cartPlacing = false;
  cartMessage = '';
  cartMessageType: 'success' | 'danger' | 'info' = 'info';

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
    this.userId = Number(this.auth.getUserId());
    this.isLoggedIn = !!this.role && !!this.userId;

    if (!this.isLoggedIn) return;

    if (this.role === 'MANUFACTURER') {
      this.loadManufacturerProducts();
      this.loadManufacturerAnalytics();
    }

    if (this.role === 'CONSUMER') {
      this.loadConsumerOrders();
      this.refreshWishlistCart();
    }

    if (this.role === 'WHOLESALER') {
      this.loadWholesalerOrders();
      this.loadWholesalerInventory();
      this.loadWholesalerAnalytics();
    }
  }

  /* ================= ANALYTICS ================= */

  loadWholesalerAnalytics(): void {
    this.http.getWholesalerAnalytics(this.userId!).subscribe({
      next: data => {
        this.analytics = data;
        this.renderWholesalerChart();
      },
      error: () => this.error = 'Failed to load wholesaler analytics'
    });
  }

  loadManufacturerAnalytics(): void {
    this.http.getManufacturerAnalytics(this.userId!).subscribe({
      next: data => {
        this.analytics = data;
        this.renderManufacturerChart();
      },
      error: () => this.error = 'Failed to load manufacturer analytics'
    });
  }

  /* ================= DATA LOADERS ================= */

  loadManufacturerProducts(): void {
    this.http.getProductsByManufacturer(this.userId!).subscribe({
      next: res => this.products = res,
      error: () => this.error = 'Failed to load products'
    });
  }

  loadConsumerOrders(): void {
    this.http.getOrderConsumer(this.userId!).subscribe({
      next: res => this.consumerOrders = res,
      error: () => this.error = 'Failed to load orders'
    });
  }

  loadWholesalerOrders(): void {
    this.http.getOrderByWholesalers(this.userId!).subscribe({
      next: res => this.wholesalerOrders = res,
      error: () => this.error = 'Failed to load wholesaler orders'
    });
  }

  loadWholesalerInventory(): void {
    this.http.getInventoryByWholesalers(this.userId!).subscribe({
      next: res => this.inventories = res,
      error: () => this.error = 'Failed to load inventory'
    });
  }

  /* ================= CONSUMER: WISHLIST + CART ================= */

  showConsumerPanel(panel: 'orders' | 'wishlist' | 'cart'): void {
    this.consumerPanel = panel;
    this.cartMessage = '';
    this.refreshWishlistCart();
  }

  refreshWishlistCart(): void {
    if (!this.userId) return;
    this.wishlist = this.http.getWishlist(this.userId);
    this.cart = this.http.getCart(this.userId);
    this.wishlistCount = this.http.getWishlistCount(this.userId);
    this.cartCount = this.http.getCartCount(this.userId);
  }

  removeWishlistItem(productId: any): void {
    if (!this.userId) return;
    this.wishlist = this.http.removeFromWishlist(this.userId, productId);
    this.refreshWishlistCart();
  }

  moveWishlistToCart(item: any): void {
    if (!this.userId) return;
    const res = this.http.moveWishlistItemToCart(this.userId, item);
    this.wishlist = res.wishlist;
    this.cart = res.cart;
    this.refreshWishlistCart();
    this.cartMessage = 'Moved to cart 🛒';
    this.cartMessageType = 'success';
    setTimeout(() => this.cartMessage = '', 1500);
  }

  removeCartItem(productId: any): void {
    if (!this.userId) return;
    this.cart = this.http.removeFromCart(this.userId, productId);
    this.refreshWishlistCart();
  }

  incQty(item: any): void {
    if (!this.userId) return;
    const q = Number(item.quantity || 1) + 1;
    this.cart = this.http.updateCartQuantity(this.userId, item.productId, q);
    this.refreshWishlistCart();
  }

  decQty(item: any): void {
    if (!this.userId) return;
    const q = Math.max(1, Number(item.quantity || 1) - 1);
    this.cart = this.http.updateCartQuantity(this.userId, item.productId, q);
    this.refreshWishlistCart();
  }

  /* ✅ ✅ FIXED METHOD */
  updateQtyFromInput(item: any, event: Event): void {
    if (!this.userId) return;

    const input = event.target as HTMLInputElement | null;
    const q = Number(input?.value || 1);

    this.cart = this.http.updateCartQuantity(this.userId, item.productId, q);
    this.refreshWishlistCart();
  }

  cartTotal(): number {
    return (this.cart || []).reduce(
      (sum: number, x: any) => sum + (Number(x.price || 0) * Number(x.quantity || 0)),
      0
    );
  }

  placeAllCartOrders(): void {
    if (!this.userId) return;

    if (!this.cart || this.cart.length === 0) {
      this.cartMessage = 'Your cart is empty.';
      this.cartMessageType = 'info';
      return;
    }

    this.cartPlacing = true;
    this.cartMessage = 'Placing orders…';
    this.cartMessageType = 'info';

    const requests = this.cart.map(item =>
      this.http.consumerPlaceOrder(
        { quantity: item.quantity, status: 'PLACED' },
        item.productId,
        this.userId
      ).pipe(
        map(() => ({ productId: item.productId, ok: true })),
        catchError(() => of({ productId: item.productId, ok: false }))
      )
    );

    forkJoin(requests).subscribe(results => {
      const failed = results.filter(r => !r.ok).map(r => Number(r.productId));
      const successCount = results.filter(r => r.ok).length;
      const failedCount = failed.length;

      if (failedCount === 0) {
        this.http.clearCart(this.userId);
        this.cartMessage = `✅ Successfully placed ${successCount} order(s)!`;
        this.cartMessageType = 'success';
      } else {
        const remaining = (this.cart || []).filter(x => failed.includes(Number(x.productId)));
        localStorage.setItem(`cart_${this.userId}`, JSON.stringify(remaining));
        this.cartMessage = `⚠️ Placed ${successCount} order(s), but ${failedCount} failed. Failed items remain in your cart.`;
        this.cartMessageType = 'danger';
      }

      this.cartPlacing = false;
      this.refreshWishlistCart();
      this.loadConsumerOrders();
      setTimeout(() => this.cartMessage = '', 3500);
    });
  }

  /* ================= CHARTS ================= */

  renderWholesalerChart(): void {
    new Chart('wholesalerChart', {
      type: 'pie',
      data: {
        labels: ['Pending', 'Confirmed', 'Cancelled'],
        datasets: [{
          data: [
            this.analytics?.pendingOrders || 0,
            this.analytics?.confirmedOrders || 0,
            this.analytics?.cancelledOrders || 0
          ],
          backgroundColor: ['#fbc02d', '#2e7d32', '#c62828']
        }]
      }
    });
  }

  renderManufacturerChart(): void {
    new Chart('manufacturerChart', {
      type: 'bar',
      data: {
        labels: ['Confirmed', 'Pending', 'Cancelled'],
        datasets: [{
          label: 'Orders',
          data: [
            this.analytics?.confirmedOrders || 0,
            this.analytics?.pendingOrders || 0,
            this.analytics?.cancelledOrders || 0
          ],
          backgroundColor: ['#2e7d32', '#fbc02d', '#c62828']
        }]
      }
    });
  }
}