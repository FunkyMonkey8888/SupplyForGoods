import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  public serverName=environment.apiUrl;
  //todo: complete missing code..
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment.development';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public serverName = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    const token = this.auth.getToken();
    return {
      headers: {
        Authorization: 'Bearer ' + token
      }
    };
  }

  // ✅ Wholesaler: Browse Products
  getProductsByWholesaler(): Observable<any> {
    return this.http.get(`${this.serverName}/wholesalers/products`, this.getHeaders());
  }

  // ✅ Consumer: Browse Products
  getProductsByConsumers(): Observable<any> {
    return this.http.get(`${this.serverName}/consumers/products`, this.getHeaders());
  }

  // ✅ Wholesaler: Get Orders
  getOrderByWholesalers(userId: any): Observable<any> {
    return this.http.get(`${this.serverName}/wholesalers/orders?userId=${userId}`, this.getHeaders());
  }

  // ✅ Consumer: Get Orders
  getOrderConsumer(userId: any): Observable<any> {
    return this.http.get(`${this.serverName}/consumers/orders?userId=${userId}`, this.getHeaders());
  }

  // ✅ Wholesaler: Get Inventories
  getInventoryByWholesalers(wholesalerId: any): Observable<any> {
    return this.http.get(`${this.serverName}/wholesalers/inventories?wholesalerId=${wholesalerId}`, this.getHeaders());
  }

  // ✅ Manufacturer: Get Products
  getProductsByManufacturer(manufacturerId: any): Observable<any> {
    return this.http.get(`${this.serverName}/manufacturers/products?manufacturerId=${manufacturerId}`, this.getHeaders());
  }

  // ✅ Wholesaler: Place Order
  placeOrder(details: any, productId: any, userId: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/wholesalers/order?productId=${productId}&userId=${userId}`,
      details,
      this.getHeaders()
    );
  }

  // ✅ Consumer: Place Order
  consumerPlaceOrder(details: any, productId: any, userId: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/consumers/order?productId=${productId}&userId=${userId}`,
      details,
      this.getHeaders()
    );
  }

  // ✅ Wholesaler: Update Order Status
  updateOrderStatus(id: any, status: any): Observable<any> {
    return this.http.put(
      `${this.serverName}/wholesalers/order/${id}?status=${status}`,
      {},
      this.getHeaders()
    );
  }

  // ✅ Consumer: Add Feedback
  addConsumerFeedBack(orderId: any, userId: any, details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/consumers/order/${orderId}/feedback?userId=${userId}`,
      details,
      this.getHeaders()
    );
  }

  // ✅ Manufacturer: Create Product
  createProduct(details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/manufacturers/product`,
      details,
      this.getHeaders()
    );
  }

  // ✅ Manufacturer: Update Product
  updateProduct(id: any, details: any): Observable<any> {
    return this.http.put(
      `${this.serverName}/manufacturers/product/${id}`,
      details,
      this.getHeaders()
    );
  }

  // ✅ Wholesaler: Add Inventory
  addInventory(details: any, productId: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/wholesalers/inventories?productId=${productId}`,
      details,
      this.getHeaders()
    );
  }

  // ✅ Wholesaler: Update Inventory
  updateInventory(stockQuantity: any, inventoryId: any): Observable<any> {
    return this.http.put(
      `${this.serverName}/wholesalers/inventories/${inventoryId}?stockQuantity=${stockQuantity}`,
      {},
      this.getHeaders()
    );
  }

  // ✅ Login
  Login(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/user/login`, details);
  }

  // ✅ Register
  registerUser(details: any): Observable<any> {
    return this.http.post(`${this.serverName}/user/register`, details);
  }
}