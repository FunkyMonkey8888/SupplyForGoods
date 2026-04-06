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

  wholesalerId!: number;

  loading = false;
  successMessage = '';
  errorMessage = '';

  role: string | null = null;

  existingInventory: any = null;
  currentStock = 0;
  checkingInventory = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    this.wholesalerId = Number(this.auth.getUserId());

    this.buildForm();

    if (!this.wholesalerId || !this.role) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    if (this.role !== 'WHOLESALER') {
      this.errorMessage = 'Only wholesalers can add inventory.';
      return;
    }

    this.loadProducts();
  }

  private buildForm(): void {
    this.itemForm = this.fb.group({
      productId: ['', Validators.required],
      stockQuantity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  refreshProducts(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading = true;
    this.clearMessages();

    this.http.getProductsByWholesaler().subscribe({
      next: res => {
        this.products = res || [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load products';
        this.loading = false;
      }
    });
  }

  selectProduct(product: any): void {
    this.selectedProduct = product;
    this.itemForm.get('productId')?.setValue(product?.id);
    this.itemForm.patchValue({ stockQuantity: '' });

    this.existingInventory = null;
    this.currentStock = 0;

    this.clearMessages();
    this.fetchExistingInventory();
  }

  private fetchExistingInventory(): void {
    if (!this.selectedProduct?.id || !this.wholesalerId) return;

    this.checkingInventory = true;

    this.http.getInventoryByWholesalerAndProduct(this.wholesalerId, this.selectedProduct.id).subscribe({
      next: inv => {
        this.existingInventory = inv;
        this.currentStock = Number(inv?.stockQuantity ?? 0);
        this.checkingInventory = false;
      },
      error: () => {
        this.existingInventory = null;
        this.currentStock = 0;
        this.checkingInventory = false;
      }
    });
  }

  onSubmit(): void {
    this.clearMessages();

    if (this.role !== 'WHOLESALER') {
      this.errorMessage = 'Only wholesalers can add inventory.';
      return;
    }

    if (!this.selectedProduct) {
      this.errorMessage = 'Please select a product';
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const qtyToAdd = Number(this.itemForm.value.stockQuantity);
    if (!qtyToAdd || qtyToAdd < 1) {
      this.errorMessage = 'Stock quantity must be at least 1';
      return;
    }

    this.loading = true;

    // ✅ Backend already supports "add or update existing stock" in InventoryService.addInventory()
    this.http.addInventory(
      {
        stockQuantity: qtyToAdd,
        wholesalerId: this.wholesalerId
      },
      this.selectedProduct.id
    ).subscribe({
      next: () => {
        const base = this.selectedProduct?.name || 'selected product';
        const wasExisting = !!this.existingInventory;

        this.successMessage = wasExisting
          ? `Inventory updated for ${base} (+${qtyToAdd}).`
          : `Inventory added for ${base}.`;

        this.loading = false;

        this.itemForm.reset();
        this.selectedProduct = null;

        this.existingInventory = null;
        this.currentStock = 0;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to add inventory';
        this.loading = false;
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }
}