import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';


@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.scss']
})
export class PlaceOrderComponent implements OnInit {

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
        this.productList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load products';
      }
    });
  }

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

    this.httpService.placeOrder(
      this.itemForm.value,
      this.productId,
      userId
    ).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Order placed successfully';
        this.itemForm.reset({ status: 'PLACED' });
        this.productId = null;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Order placement failed';
      }
    });
  }
}