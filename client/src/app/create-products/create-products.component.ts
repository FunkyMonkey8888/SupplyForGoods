import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-products',
  templateUrl: './create-products.component.html',
  styleUrls: ['./create-products.component.css']
})
export class CreateProductsComponent implements OnInit {

  itemForm: FormGroup;
  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  productList: any[] = [];
  showMessage: boolean = false;
  responseMessage: any;
  updateId: any;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required],
      stockQuantity: ['', Validators.required],
      manufacturerId: [this.authService.getUserId()]
    });
  }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    const userId = this.authService.getUserId();
    this.httpService.getProductsByManufacturer(userId).subscribe({
      next: (res) => {
        this.productList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load products';
      }
    });
  }

  onSubmit() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    if (this.updateId) {
      this.httpService.updateProduct(this.itemForm.value, this.updateId).subscribe({
        next: () => {
          this.showMessage = true;
          this.responseMessage = 'Product updated successfully';
          this.updateId = null;
          this.itemForm.reset({ manufacturerId: this.authService.getUserId() });
          this.getProducts();
        },
        error: () => {
          this.showError = true;
          this.errorMessage = 'Product update failed';
        }
      });
    } else {
      this.httpService.createProduct(this.itemForm.value).subscribe({
        next: () => {
          this.showMessage = true;
          this.responseMessage = 'Product created successfully';
          this.itemForm.reset({ manufacturerId: this.authService.getUserId() });
          this.getProducts();
        },
        error: () => {
          this.showError = true;
          this.errorMessage = 'Product creation failed';
        }
      });
    }
  }

  edit(product: any) {
    this.updateId = product.id;
    this.itemForm.patchValue(product);
    this.showMessage = false;
    this.showError = false;
  }
}