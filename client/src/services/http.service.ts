import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';
import { AuthService } from './auth.service';



@Injectable({
  providedIn: 'root'
})
export class HttpService {
 
  public serverName = environment.apiUrl;
 
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}
 
  /* ================= COMMON HEADERS ================= */
 
  private getHeaders() {
    const token = this.auth.getToken();
    return {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    };
  }
 
  /* ================= PRODUCT APIs ================= */
 
  getProductsByWholesaler(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverName}/api/wholesalers/products`,
      this.getHeaders()
    );
  }
 
  getProductsByConsumers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverName}/api/consumers/products`,
      this.getHeaders()
    );
  }
 
  getProductsByManufacturer(manufacturerId: number | string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverName}/api/manufacturers/products?manufacturerId=${manufacturerId}`,
      this.getHeaders()
    );
  }
 
  createProduct(details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/manufacturers/product`,
      details,
      this.getHeaders()
    );
  }

  updateProduct(id: any, details?: any): Observable<any> {

    if (typeof id === 'object' && id !== null) {
      const obj = id;

      id =
        obj.id ??
        obj.productId ??
        obj.product?.id ??
        Object.values(obj).find(v => typeof v === 'number') ??
        987;

      details = obj;
    }

    return this.http.put(
      `${this.serverName}/api/manufacturers/product/${Number(id)}`,
      details,
      this.getHeaders()
    );
  }

  deleteProductByManufacturer(id: any): Observable<any> {
    return this.http.delete(
      `${this.serverName}/api/manufacturers/product/${id}`,
      this.getHeaders()
    );
  }
 
  /* ================= INVENTORY APIs ================= */
 
  addInventory(details: any, productId: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/wholesalers/inventories?productId=${productId}`,
      details,
      this.getHeaders()
    );
  }
 
  updateInventory(stockQuantity: any, inventoryId: any): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/wholesalers/inventories/${inventoryId}?stockQuantity=${stockQuantity}`,
      {},
      this.getHeaders()
    );
  }
 
  getInventoryByWholesalers(wholesalerId: any): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverName}/api/wholesalers/inventories?wholesalerId=${wholesalerId}`,
      this.getHeaders()
    );
  }
 
  /* ================= ORDER APIs ================= */
 
  placeOrder(details: any, productId: any, userId: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/wholesalers/order?productId=${productId}&userId=${userId}`,
      details,
      this.getHeaders()
    );
  }
 
  consumerPlaceOrder(details: any, productId: any, userId: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/consumers/order?productId=${productId}&userId=${userId}`,
      details,
      this.getHeaders()
    );
  }
 
  getOrderByWholesalers(userId: any): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverName}/api/wholesalers/orders?userId=${userId}`,
      this.getHeaders()
    );
  }
 
  getOrderConsumer(userId: any): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverName}/api/consumers/orders?userId=${userId}`,
      this.getHeaders()
    );
  }
 
  getOrdersByManufacturer(manufacturerId: any): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverName}/api/manufacturers/orders?manufacturerId=${manufacturerId}`,
      this.getHeaders()
    );
  }
 
  // ✅ Unified order-status update (WORKS FOR BOTH ROLES)
  updateOrderStatus(orderId: any, status: string): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/wholesalers/order/${orderId}?status=${status}`,
      {},
      this.getHeaders()
    );
  }
 
  // ✅ ✅ FIXED: manufacturer endpoint (plural "orders")
  updateOrderStatusByManufacturer(orderId: any, status: string): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/manufacturers/orders/${orderId}?status=${status}`,
      {},
      this.getHeaders()
    );
  }
 
  /* ================= AUTH APIs ================= */
 
  Login(details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/user/login`,
      details,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
 
  registerUser(details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/user/register`,
      details,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
 
  addConsumerFeedBack(orderId: any, userId: any, feedback: any) {
    return this.http.post<any>(
      `${this.serverName}/api/consumers/order/${orderId}/feedback?userId=${userId}`,
      feedback,
      this.getHeaders()
    );
  }
 
  getConsumerOrdersForWholesaler(wholesalerId: any): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverName}/api/wholesalers/consumer-orders?wholesalerId=${wholesalerId}`,
      this.getHeaders()
    );
  }
 
 
  /* ================= ANALYTICS APIs ================= */

  getWholesalerAnalytics(wholesalerId: number) {
    return this.http.get<any>(
      `${this.serverName}/api/analytics/wholesaler?wholesalerId=${wholesalerId}`,
      this.getHeaders()
    );
  }


getManufacturerAnalytics(manufacturerId: number) {
  return this.http.get<any>(
    `${this.serverName}/api/analytics/manufacturer?manufacturerId=${manufacturerId}`,
    this.getHeaders()
  );
}



/* ================= NOTIFICATIONS ================= */


    getWholesalerAdvancedAnalytics(wholesalerId: number) {
  return this.http.get<any>(
    `${this.serverName}/api/analytics/wholesaler/advanced?wholesalerId=${wholesalerId}`,
    this.getHeaders()
  );
}

getManufacturerAdvancedAnalytics(manufacturerId: number) {
  return this.http.get<any>(
    `${this.serverName}/api/analytics/manufacturer/advanced?manufacturerId=${manufacturerId}`,
    this.getHeaders()
  );
}

/* ================= NOTIFICATIONS ================= */

getUnreadNotifications(userId: number) {
  return this.http.get<any[]>(
    `${this.serverName}/api/notifications/unread?userId=${userId}`,
    this.getHeaders()
  );
}




markNotificationRead(id: number, userId: number) {
  return this.http.put(
    `${this.serverName}/api/notifications/${id}/read?userId=${userId}`,
    {},
    this.getHeaders()
  );
}


  /* ======================================================================
   * ✅ WISHLIST + CART (FRONTEND ONLY, per user, stored in localStorage)
   * ====================================================================== */

  private safeParse(value: string | null): any[] {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private wishlistKey(userId: any): string {
    return `wishlist_${userId}`;
  }

  private cartKey(userId: any): string {
    return `cart_${userId}`;
  }

  /* ---------- Wishlist ---------- */

  getWishlist(userId: any): any[] {
    return this.safeParse(localStorage.getItem(this.wishlistKey(userId)));
  }

  isInWishlist(userId: any, productId: any): boolean {
    return this.getWishlist(userId).some((x: any) => Number(x.productId) === Number(productId));
  }

  toggleWishlist(userId: any, product: any): any[] {
    const list = this.getWishlist(userId);
    const pid = Number(product?.id ?? product?.productId);

    const exists = list.some((x: any) => Number(x.productId) === pid);

    let updated: any[];
    if (exists) {
      updated = list.filter((x: any) => Number(x.productId) !== pid);
    } else {
      updated = [
        ...list,
        {
          productId: pid,
          name: product?.name,
          price: product?.price,
          description: product?.description
        }
      ];
    }

    localStorage.setItem(this.wishlistKey(userId), JSON.stringify(updated));
    return updated;
  }

  removeFromWishlist(userId: any, productId: any): any[] {
    const updated = this.getWishlist(userId).filter((x: any) => Number(x.productId) !== Number(productId));
    localStorage.setItem(this.wishlistKey(userId), JSON.stringify(updated));
    return updated;
  }

  clearWishlist(userId: any): void {
    localStorage.removeItem(this.wishlistKey(userId));
  }

  getWishlistCount(userId: any): number {
    return this.getWishlist(userId).length;
  }

  /* ---------- Cart ---------- */

  getCart(userId: any): any[] {
    return this.safeParse(localStorage.getItem(this.cartKey(userId)));
  }

  private saveCart(userId: any, cart: any[]): any[] {
    localStorage.setItem(this.cartKey(userId), JSON.stringify(cart));
    return cart;
  }

  addToCart(userId: any, product: any, qty: number = 1): any[] {
    const cart = this.getCart(userId);
    const pid = Number(product?.id ?? product?.productId);
    const stockQty = Number(product?.stockQuantity ?? 0);

    const idx = cart.findIndex((x: any) => Number(x.productId) === pid);
    if (idx >= 0) {
      const newQty = Number(cart[idx].quantity || 0) + Number(qty || 1);
      cart[idx].quantity = stockQty > 0 ? Math.min(newQty, stockQty) : newQty;
    } else {
      cart.push({
        productId: pid,
        name: product?.name,
        price: product?.price,
        description: product?.description,
        quantity: Math.max(1, Number(qty || 1)),
        stockQuantity: isNaN(stockQty) ? 0 : stockQty
      });
    }

    return this.saveCart(userId, cart);
  }

  updateCartQuantity(userId: any, productId: any, quantity: number): any[] {
    const cart = this.getCart(userId);
    const idx = cart.findIndex((x: any) => Number(x.productId) === Number(productId));
    if (idx >= 0) {
      const stockQty = Number(cart[idx].stockQuantity ?? 0);
      let q = Math.max(1, Number(quantity || 1));
      if (stockQty > 0) q = Math.min(q, stockQty);
      cart[idx].quantity = q;
    }
    return this.saveCart(userId, cart);
  }

  removeFromCart(userId: any, productId: any): any[] {
    const updated = this.getCart(userId).filter((x: any) => Number(x.productId) !== Number(productId));
    return this.saveCart(userId, updated);
  }

  clearCart(userId: any): void {
    localStorage.removeItem(this.cartKey(userId));
  }

  getCartCount(userId: any): number {
    return this.getCart(userId).reduce((sum: number, x: any) => sum + Number(x.quantity || 0), 0);
  }

  moveWishlistItemToCart(userId: any, wishlistItem: any): { wishlist: any[], cart: any[] } {
    const productId = Number(wishlistItem?.productId);
    const wishlist = this.removeFromWishlist(userId, productId);
    const cart = this.addToCart(userId, { ...wishlistItem, id: productId }, 1);
    return { wishlist, cart };
  }

  requestOtp(email: string) {
  return this.http.post<any>(
    `${this.serverName}/api/auth/request-otp`,
    { email },
    { headers: { 'Content-Type': 'application/json' } }
  );
}

verifyOtp(email: string, otp: string) {
  return this.http.post<any>(
    `${this.serverName}/api/auth/verify-otp`,
    { email, otp },
    { headers: { 'Content-Type': 'application/json' } }
  );
}
      login2fa(details: { username: string; password: string }) {
  return this.http.post<any>(
    `${this.serverName}/api/auth/2fa/login`,
    details,
    { headers: { 'Content-Type': 'application/json' } }
  );
}

verify2fa(details: { username: string; otp: string }) {
  return this.http.post<any>(
    `${this.serverName}/api/auth/2fa/verify`,
    details,
    { headers: { 'Content-Type': 'application/json' } }
  );
}
resendOtp(email: string) {
  return this.http.post<any>(
    `${this.serverName}/api/auth/request-otp`,
    { email },
    { headers: { 'Content-Type': 'application/json' } }
  );
}

requestRegisterOtp(email: string) {
  return this.http.post<any>(
    `${this.serverName}/api/auth/register/request-otp`,
    { email },
    { headers: { 'Content-Type': 'application/json' } }
  );
}

verifyRegisterOtp(email: string, otp: string) {
  return this.http.post<any>(
    `${this.serverName}/api/auth/register/verify-otp`,
    { email, otp },
    { headers: { 'Content-Type': 'application/json' } }
  );
}

getProductByWholesalerById(productId: any): Observable<any> {
  return this.http.get<any>(
    `${this.serverName}/api/wholesalers/products/${productId}`,
    this.getHeaders()
  );
}

searchProductsByWholesaler(query: string): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.serverName}/api/wholesalers/products/search?query=${encodeURIComponent(query)}`,
    this.getHeaders()
  );
}

getLowStockProductsByWholesaler(threshold: number = 10): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.serverName}/api/wholesalers/products/low-stock?threshold=${threshold}`,
    this.getHeaders()
  );
}

getProductByConsumerById(productId: any): Observable<any> {
  return this.http.get<any>(
    `${this.serverName}/api/consumers/products/${productId}`,
    this.getHeaders()
  );
}

searchProductsByConsumers(query: string): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.serverName}/api/consumers/products/search?query=${encodeURIComponent(query)}`,
    this.getHeaders()
  );
}

getProductByManufacturerById(productId: any): Observable<any> {
  return this.http.get<any>(
    `${this.serverName}/api/manufacturers/product/${productId}`,
    this.getHeaders()
  );
}

searchProductsByManufacturer(query: string): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.serverName}/api/manufacturers/products/search?query=${encodeURIComponent(query)}`,
    this.getHeaders()
  );
}

getLowStockProductsByManufacturer(manufacturerId: any, threshold: number = 10): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.serverName}/api/manufacturers/products/low-stock?manufacturerId=${manufacturerId}&threshold=${threshold}`,
    this.getHeaders()
  );
}

getInventoryById(inventoryId: any): Observable<any> {
  return this.http.get<any>(
    `${this.serverName}/api/wholesalers/inventories/${inventoryId}`,
    this.getHeaders()
  );
}

restockInventory(inventoryId: any, qty: number): Observable<any> {
  return this.http.post<any>(
    `${this.serverName}/api/wholesalers/inventories/${inventoryId}/restock?qty=${qty}`,
    {},
    this.getHeaders()
  );
}

getInventoryByWholesalerAndProduct(wholesalerId: any, productId: any): Observable<any> {
  return this.http.get<any>(
    `${this.serverName}/api/wholesalers/inventories/by-product?wholesalerId=${wholesalerId}&productId=${productId}`,
    this.getHeaders()
  );
}

getLowStockInventoriesByWholesaler(wholesalerId: any, threshold: number = 10): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.serverName}/api/wholesalers/inventories/low-stock?wholesalerId=${wholesalerId}&threshold=${threshold}`,
    this.getHeaders()
  );
}

getInventorySummaryByWholesaler(wholesalerId: any, threshold: number = 10): Observable<any> {
  return this.http.get<any>(
    `${this.serverName}/api/wholesalers/inventories/summary?wholesalerId=${wholesalerId}&threshold=${threshold}`,
    this.getHeaders()
  );
}
getOrderByIdForWholesaler(orderId: any): Observable<any> {
  return this.http.get<any>(
    `${this.serverName}/api/wholesalers/orders/${orderId}`,
    this.getHeaders()
  );
}

getOrdersByWholesalerAndStatus(userId: any, status: string): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.serverName}/api/wholesalers/orders/status?userId=${userId}&status=${encodeURIComponent(status)}`,
    this.getHeaders()
  );
}

cancelWholesalerOrder(orderId: any): Observable<any> {
  return this.http.patch<any>(
    `${this.serverName}/api/wholesalers/order/${orderId}/cancel`,
    {},
    this.getHeaders()
  );
}

getConsumerOrdersForWholesalerByStatus(wholesalerId: any, status: string): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.serverName}/api/wholesalers/consumer-orders/status?wholesalerId=${wholesalerId}&status=${encodeURIComponent(status)}`,
    this.getHeaders()
  );
}

getOrderByIdForManufacturer(orderId: any): Observable<any> {
  return this.http.get<any>(
    `${this.serverName}/api/manufacturers/orders/${orderId}`,
    this.getHeaders()
  );
}

getOrdersByManufacturerAndStatus(manufacturerId: any, status: string): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.serverName}/api/manufacturers/orders/status?manufacturerId=${manufacturerId}&status=${encodeURIComponent(status)}`,
    this.getHeaders()
  );
}

getOrdersByProduct(productId: any): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.serverName}/api/manufacturers/orders/product/${productId}`,
    this.getHeaders()
  );
}

cancelManufacturerOrder(orderId: any): Observable<any> {
  return this.http.patch<any>(
    `${this.serverName}/api/manufacturers/orders/${orderId}/cancel`,
    {},
    this.getHeaders()
  );
}
getOrderByIdForConsumer(orderId: any): Observable<any> {
  return this.http.get<any>(
    `${this.serverName}/api/consumers/orders/${orderId}`,
    this.getHeaders()
  );
}

getOrdersByConsumerAndStatus(userId: any, status: string): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.serverName}/api/consumers/orders/status?userId=${userId}&status=${encodeURIComponent(status)}`,
    this.getHeaders()
  );
}

cancelConsumerOrder(orderId: any): Observable<any> {
  return this.http.patch<any>(
    `${this.serverName}/api/consumers/orders/${orderId}/cancel`,
    {},
    this.getHeaders()
  );
}
}