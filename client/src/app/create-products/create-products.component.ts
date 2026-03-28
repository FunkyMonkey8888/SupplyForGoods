import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';


@Component({
  selector: 'app-create-products',
  templateUrl: './create-products.component.html',
  styleUrls: ['./create-products.component.scss']
})
export class CreateProductsComponent implements OnInit {

  itemForm!: FormGroup;

  productList: any[] = [];
  updateId: any = null;

  showError = false;
  errorMessage: any;

  showMessage = false;
  responseMessage: any;

  formModel: any = {
    name: '',
    description: '',
    price: '',
    stockQuantity: ''
  };

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      name: [this.formModel.name, Validators.required],
      description: [this.formModel.description],
      price: [this.formModel.price, Validators.required],
      stockQuantity: [this.formModel.stockQuantity, Validators.required]
    });

    this.getProducts();
  }

  /* -----------------------------
     LOAD PRODUCTS (MANUFACTURER)
  ------------------------------ */
  getProducts(): void {
    const userId = localStorage.getItem('userId');

    this.httpService.getProductsByManufacturer(userId).subscribe({
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
     CREATE / UPDATE PRODUCT
  ------------------------------ */
  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const manufacturerId = localStorage.getItem('userId');
    const payload = {
      ...this.itemForm.value,
      manufacturerId: manufacturerId
    };

    if (this.updateId) {
      // UPDATE PRODUCT
      this.httpService.updateProduct(payload, this.updateId).subscribe({
        next: () => {
          this.showMessage = true;
          this.responseMessage = 'Product updated successfully';
          this.resetForm();
          this.getProducts();
        },
        error: () => {
          this.showError = true;
          this.errorMessage = 'Failed to update product';
        }
      });
    } else {
      // CREATE PRODUCT
      this.httpService.createProduct(payload).subscribe({
        next: () => {
          this.showMessage = true;
          this.responseMessage = 'Product created successfully';
          this.resetForm();
          this.getProducts();
        },
        error: () => {
          this.showError = true;
          this.errorMessage = 'Failed to create product';
        }
      });
    }
  }

  /* -----------------------------
     EDIT PRODUCT
  ------------------------------ */
  edit(product: any): void {
    this.updateId = product.id;

    this.itemForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity
    });

    this.showMessage = false;
    this.showError = false;
  }

  /* -----------------------------
     RESET FORM
  ------------------------------ */
  resetForm(): void {
    this.itemForm.reset();
    this.updateId = null;
  }
}