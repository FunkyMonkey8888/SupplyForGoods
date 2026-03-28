import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public serverName = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private authHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.authService.getToken()
      })
    };
  }

  registerUser(data: any) {
    return this.http.post<any>(
      this.serverName + '/api/user/register',
      data
    );
  }

  Login(data: any) {
    return this.http.post<any>(
      this.serverName + '/api/user/login',
      data
    );
  }

  getProductsByWholesaler() {
    return this.http.get<any[]>(
      this.serverName + '/api/wholesalers/products',
      this.authHeaders()
    );
  }

  getProductsByConsumers() {
    return this.http.get<any[]>(
      this.serverName + '/api/consumers/products',
      this.authHeaders()
    );
  }

  getProductsByManufacturer(id: any) {
    return this.http.get<any[]>(
      this.serverName + '/api/manufacturers/products?manufacturerId=' + id,
      this.authHeaders()
    );
  }

  placeOrder(details: any, productId: any, userId: any) {
    return this.http.post<any>(
      this.serverName + '/api/wholesalers/order?productId=' + productId + '&userId=' + userId,
      details,
      this.authHeaders()
    );
  }

  consumerPlaceOrder(details: any, productId: any, userId: any) {
    return this.http.post<any>(
      this.serverName + '/api/consumers/order?productId=' + productId + '&userId=' + userId,
      details,
      this.authHeaders()
    );
  }

  getOrderByWholesalers(id: any) {
    return this.http.get<any[]>(
      this.serverName + '/api/wholesalers/orders?userId=' + id,
      this.authHeaders()
    );
  }

  getOrderConsumer(id: any) {
    return this.http.get<any[]>(
      this.serverName + '/api/consumers/orders?userId=' + id,
      this.authHeaders()
    );
  }

  updateOrderStatus(id: any, status: any) {
    return this.http.put<any>(
      this.serverName + '/api/wholesalers/order/' + id + '?status=' + status,
      {},
      this.authHeaders()
    );
  }

  addInventory(details: any, productId: any) {
    return this.http.post<any>(
      this.serverName + '/api/wholesalers/inventories?productId=' + productId,
      details,
      this.authHeaders()
    );
  }

  updateInventory(stockQuantity: any, inventoryId: any) {
    return this.http.put<any>(
      this.serverName + '/api/wholesalers/inventories/' + inventoryId + '?stockQuantity=' + stockQuantity,
      {},
      this.authHeaders()
    );
  }

  getInventoryByWholesalers(id: any) {
    return this.http.get<any[]>(
      this.serverName + '/api/wholesalers/inventories?wholesalerId=' + id,
      this.authHeaders()
    );
  }

  addConsumerFeedBack(orderId: any, userId: any, details: any) {
    return this.http.post<any>(
      this.serverName + '/api/consumers/order/' + orderId + '/feedback?userId=' + userId,
      details,
      this.authHeaders()
    );
  }

  createProduct(details: any) {
    return this.http.post<any>(
      this.serverName + '/api/manufacturers/product',
      details,
      this.authHeaders()
    );
  }

  updateProduct(details: any, id: any) {
    return this.http.put<any>(
      this.serverName + '/api/manufacturers/product/' + id,
      details,
      this.authHeaders()
    );
  }
}