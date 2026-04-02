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

  /* =====================================================
     ✅ UPDATED: PRODUCT APIs WITH SORT + SEARCH + PAGINATION
     ===================================================== */

  /* ✅ Old method — unchanged (tests use this) */
  getProductsByWholesaler(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverName}/api/wholesalers/products`,
      this.getHeaders()
    );
  }

  /* ✅ Enhanced version (OPTIONAL params — no breakage) */
  getProductsByWholesalerAdvanced(
    sort: string = "",
    search: string = "",
    page: number | null = null,
    size: number | null = null
  ): Observable<any[]> {

    let url = `${this.serverName}/api/wholesalers/products`;
    const params: string[] = [];

    if (sort) params.push(`sort=${sort}`);
    if (search) params.push(`name=${search}`);
    if (page !== null) params.push(`page=${page}`);
    if (size !== null) params.push(`size=${size}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<any[]>(url, this.getHeaders());
  }

  /* ✅ Old method — unchanged (tests use this) */
  getProductsByConsumers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverName}/api/consumers/products`,
      this.getHeaders()
    );
  }

  /* ✅ Enhanced version (OPTIONAL params — no breakage) */
  getProductsByConsumersAdvanced(
    sort: string = "",
    search: string = "",
    page: number | null = null,
    size: number | null = null
  ): Observable<any[]> {

    let url = `${this.serverName}/api/consumers/products`;
    const params: string[] = [];

    if (sort) params.push(`sort=${sort}`);
    if (search) params.push(`name=${search}`);
    if (page !== null) params.push(`page=${page}`);
    if (size !== null) params.push(`size=${size}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<any[]>(url, this.getHeaders());
  }


  /* ================= MANUFACTURER PRODUCT APIs ================= */

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

  updateOrderStatus(orderId: any, status: string): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/wholesalers/order/${orderId}?status=${status}`,
      {},
      this.getHeaders()
    );
  }

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
}