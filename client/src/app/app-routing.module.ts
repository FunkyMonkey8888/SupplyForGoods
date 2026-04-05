import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { DashbaordComponent } from './dashbaord/dashbaord.component';
import { CreateProductsComponent } from './create-products/create-products.component';
import { PlaceOrderComponent } from './place-order/place-order.component';
import { GetOrdersComponent } from './get-orders/get-orders.component';
import { AddInventoryComponent } from './add-inventory/add-inventory.component';
import { ConsumerPlaceOrderComponent } from './consumer-place-order/consumer-place-order.component';
import { ConsumerGetOrdersComponent } from './consumer-get-orders/consumer-get-orders.component';
import { OtpLoginComponent } from './otp-login/otp-login.component';
import { ViewProductsComponent } from './view-products/view-products.component';

import { ErrorPageComponent } from './pages/error-page.component';
import { NotFoundComponent } from './not-found/not-found.component';

// ✅ If you have an AuthGuard, use it for protected routes
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  // ✅ Public pages
  { path: '', component: DashbaordComponent }, // OR a LandingComponent if you create one
  // If your landing is inside AppComponent and you want dashboard protected,
  // then create a LandingComponent. Best practice. See note below.

  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'otp-login', component: OtpLoginComponent },

  // ✅ Protected pages (only after login)
  { path: 'dashboard', component: DashbaordComponent, canActivate: [AuthGuard] },
  { path: 'create-product', component: CreateProductsComponent, canActivate: [AuthGuard] },
  { path: 'view-products', component: ViewProductsComponent, canActivate: [AuthGuard] },
  { path: 'place-product', component: PlaceOrderComponent, canActivate: [AuthGuard] },
  { path: 'add-inventory', component: AddInventoryComponent, canActivate: [AuthGuard] },
  { path: 'get-orders', component: GetOrdersComponent, canActivate: [AuthGuard] },
  { path: 'consumer-place-order', component: ConsumerPlaceOrderComponent, canActivate: [AuthGuard] },
  { path: 'consumer-get-orders', component: ConsumerGetOrdersComponent, canActivate: [AuthGuard] },

  // ✅ Error pages
  { path: 'error', component: ErrorPageComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}