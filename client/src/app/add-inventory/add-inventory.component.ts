import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.scss']
})
export class AddInventoryComponent implements OnInit {

  itemForm!: FormGroup;

  products: any[] = [];
  selectedProduct: any = null;

  wholesalerId!: number | string;

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.wholesalerId = this.auth.getUserId()!;
    this.buildForm();
    this.loadProducts();
  }

  private buildForm(): void {
    this.itemForm = this.fb.group({
      productId: ['', Validators.required],
      stockQuantity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  private loadProducts(): void {
    this.http.getProductsByWholesaler().subscribe({
      next: res => this.products = res,
      error: () => this.errorMessage = 'Failed to load products'
    });
  }

  selectProduct(product: any): void {
    this.selectedProduct = product;
    this.itemForm.get('productId')?.setValue(product.id)
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSubmit(): void {

    if (!this.selectedProduct) {
      this.errorMessage = 'Please select a product';
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.http.addInventory(
      { stockQuantity: this.itemForm.value.stockQuantity ,
        wholesalerId: this.wholesalerId,
      },
      this.selectedProduct.id,
    ).subscribe({
      next: () => {
        this.successMessage =
          `Inventory added for ${this.selectedProduct.name}`;
        this.loading = false;
        this.itemForm.reset();
        this.selectedProduct = null;
      },
      error: () => {
        this.errorMessage = 'Failed to add inventory';
        this.loading = false;
        setTimeout(() => {
          this.errorMessage = ''
        }, 3000);
      }
    });
  }
}