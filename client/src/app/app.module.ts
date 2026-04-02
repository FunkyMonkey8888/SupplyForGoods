import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistrationComponent } from './registration/registration.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpService } from '../services/http.service';
import { DashbaordComponent } from './dashbaord/dashbaord.component';


import { CreateProductsComponent } from './create-products/create-products.component';

import { PlaceOrderComponent } from './place-order/place-order.component';
import { GetOrdersComponent } from './get-orders/get-orders.component';

import { AddInventoryComponent } from './add-inventory/add-inventory.component';
import { ConsumerPlaceOrderComponent } from './consumer-place-order/consumer-place-order.component';
import { ConsumerGetOrdersComponent } from './consumer-get-orders/consumer-get-orders.component';
import { ViewProductsComponent } from './view-products/view-products.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
      RegistrationComponent,
      DashbaordComponent,     
      CreateProductsComponent,

    
      PlaceOrderComponent,
      GetOrdersComponent,
      AddInventoryComponent,
      ConsumerPlaceOrderComponent,
      ConsumerGetOrdersComponent,
      ViewProductsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule ,
    CommonModule
  ],
  providers: [HttpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
