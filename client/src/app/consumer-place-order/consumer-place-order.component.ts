import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';


@Component({
  selector: 'app-consumer-place-order',
  templateUrl: './consumer-place-order.component.html',
  styleUrls: ['./consumer-place-order.component.scss']
})
export class ConsumerPlaceOrderComponent implements OnInit {

  itemForm!: FormGroup;

  productList: any[] = [];
  productId: any = null;

  formModel: any = {
    quantity: '',
    status: 'PLACED'
  };

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
     LOAD PRODUCTS FOR CONSUMER
  ------------------------------ */
  getProducts(): void {
    this.httpService.getProductsByConsumers().subscribe({
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
    this.showError = false;
    this.showMessage = false;
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

    this.httpService.consumerPlaceOrder(
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