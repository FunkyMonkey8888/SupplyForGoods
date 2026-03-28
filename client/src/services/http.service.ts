import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public serverName = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /* -------------------------------
     COMMON HEADER
  -------------------------------- */

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /* -------------------------------
     AUTH APIs
  -------------------------------- */

  Login(details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/user/login`,
      details
    );
  }

  registerUser(details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/user/register`,
      details
    );
  }

  /* -------------------------------
     PRODUCT APIs
  -------------------------------- */

  getProductsByManufacturer(id: any): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/manufacturers/products?manufacturerId=${id}`,
      { headers: this.getHeaders() }
    );
  }

  getProductsByWholesaler(): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/wholesalers/products`,
      { headers: this.getHeaders() }
    );
  }

  getProductsByConsumers(): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/consumers/products`,
      { headers: this.getHeaders() }
    );
  }

  createProduct(details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/manufacturers/product`,
      details,
      { headers: this.getHeaders() }
    );
  }

  updateProduct(details: any, id: any): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/manufacturers/product/${id}`,
      details,
      { headers: this.getHeaders() }
    );
  }

  /* -------------------------------
     ORDER APIs
  -------------------------------- */

  placeOrder(details: any, productId: any, userId: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/wholesalers/order?productId=${productId}&userId=${userId}`,
      details,
      { headers: this.getHeaders() }
    );
  }

  consumerPlaceOrder(details: any, productId: any, userId: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/consumers/order?productId=${productId}&userId=${userId}`,
      details,
      { headers: this.getHeaders() }
    );
  }

  updateOrderStatus(id: any, status: any): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/wholesalers/order/${id}?status=${status}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getOrderByWholesalers(id: any): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/wholesalers/orders?userId=${id}`,
      { headers: this.getHeaders() }
    );
  }

  getOrderConsumer(id: any): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/consumers/orders?userId=${id}`,
      { headers: this.getHeaders() }
    );
  }

  /* -------------------------------
     INVENTORY APIs
  -------------------------------- */

  addInventory(details: any, productId: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/wholesalers/inventories?productId=${productId}`,
      details,
      { headers: this.getHeaders() }
    );
  }

  updateInventory(stockQuantity: any, inventoryId: any): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/wholesalers/inventories/${inventoryId}?stockQuantity=${stockQuantity}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getInventoryByWholesalers(id: any): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/wholesalers/inventories?wholesalerId=${id}`,
      { headers: this.getHeaders() }
    );
  }

  /* -------------------------------
     FEEDBACK APIs
  -------------------------------- */

  addConsumerFeedBack(orderId: any, userId: any, details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/consumers/order/${orderId}/feedback?userId=${userId}`,
      details,
      { headers: this.getHeaders() }
    );
  }
}