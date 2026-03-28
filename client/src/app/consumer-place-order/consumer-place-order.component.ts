import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-consumer-place-order',
  templateUrl: './consumer-place-order.component.html',
  styleUrls: ['./consumer-place-order.component.css']
})
export class ConsumerPlaceOrderComponent implements OnInit {

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
    this.httpService.getProductsByConsumers().subscribe({
      next: (res) => {
        this.productList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load products';
      }
    });
  }

  addToOrder(product: any) {
    this.productId = product.id;
    this.showMessage = false;
    this.showError = false;
  }

  onSubmit() {
    if (!this.productId || this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const userId = this.authService.getUserId();

    this.httpService.consumerPlaceOrder(
      this.itemForm.value,
      this.productId,
      userId
    ).subscribe({
      next: () => {
        this.showMessage = true;
        this.responseMessage = 'Order placed successfully';
        this.itemForm.reset({ status: 'PENDING' });
        this.productId = null;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Order placement failed';
      }
    });
  }
}