import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
<<<<<<< HEAD
import { AuthService } from '../../services/auth.service';

=======
 
 
>>>>>>> 53ec9a5451e84798ae6dac9500784838a5976677
@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.css']
})
export class PlaceOrderComponent implements OnInit {
<<<<<<< HEAD

  itemForm: FormGroup;
  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  productList: any[] = [];
  showMessage: boolean = false;
  responseMessage: any;
  productId: any;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService
  ) {
    this.itemForm = this.fb.group({
      quantity: ['', Validators.required],
      status: ['PENDING']
    });
  }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.httpService.getProductsByWholesaler().subscribe({
      next: (res) => {
=======
 
  itemForm!: FormGroup;
 
  formModel: any = {
    quantity: '',
    status: 'PLACED'
  };
 
  productList: any[] = [];
  productId: any;
 
  showError = false;
  errorMessage: any;
 
  showMessage = false;
  responseMessage: any;
 
  constructor(
    private fb: FormBuilder,
    private httpService: HttpService
  ) {}
 
  ngOnInit(): void {
    this.itemForm = this.fb.group({
      quantity: [this.formModel.quantity, Validators.required],
      status: [this.formModel.status, Validators.required]
    });
 
    this.getProducts();
  }
 
  /* -----------------------------
     LOAD PRODUCTS
  ------------------------------ */
  getProducts(): void {
    this.httpService.getProductsByWholesaler().subscribe({
      next: (res: any) => {
>>>>>>> 53ec9a5451e84798ae6dac9500784838a5976677
        this.productList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load products';
      }
    });
  }
<<<<<<< HEAD

  addToOrder(val: any) {
    this.productId = val.id;
  }

  onSubmit() {
    if (!this.productId || this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const userId = this.authService.getUserId();

=======
 
  /* -----------------------------
     SELECT PRODUCT
  ------------------------------ */
  addToOrder(product: any): void {
    this.productId = product.id;
    this.showMessage = false;
    this.showError = false;
  }
 
  /* -----------------------------
     PLACE ORDER
  ------------------------------ */
  onSubmit(): void {
    if (!this.productId) {
      this.showError = true;
      this.errorMessage = 'Please select a product';
      return;
    }
 
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }
 
    const userId = localStorage.getItem('userId');
 
>>>>>>> 53ec9a5451e84798ae6dac9500784838a5976677
    this.httpService.placeOrder(
      this.itemForm.value,
      this.productId,
      userId
    ).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Order placed successfully';
<<<<<<< HEAD
        this.itemForm.reset({ status: 'PENDING' });
=======
        this.itemForm.reset({ status: 'PLACED' });
>>>>>>> 53ec9a5451e84798ae6dac9500784838a5976677
        this.productId = null;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Order placement failed';
      }
    });
  }
}