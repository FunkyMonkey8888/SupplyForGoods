import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';


@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.scss']
})
export class AddInventoryComponent implements OnInit {

  itemForm!: FormGroup;

  productList: any[] = [];
  inventoryList: any[] = [];

  productId: any = null;
  updateId: any = null;

  showError = false;
  errorMessage: any;

  showMessage = false;
  responseMessage: any;

  formModel: any = {
    stockQuantity: ''
  };

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      stockQuantity: [this.formModel.stockQuantity, Validators.required]
    });

    this.getProducts();
    this.getInventory();
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
     LOAD INVENTORY
  ------------------------------ */
  getInventory(): void {
    const wholesalerId = localStorage.getItem('userId');

    this.httpService.getInventoryByWholesalers(wholesalerId).subscribe({
      next: (res: any) => {
        this.inventoryList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load inventory';
      }
    });
  }

  /* -----------------------------
     SELECT PRODUCT FOR ADD
  ------------------------------ */
  addInventory(product: any): void {
    this.productId = product.id;
    this.updateId = null;
    this.itemForm.reset();
    this.showError = false;
    this.showMessage = false;
  }

  /* -----------------------------
     SELECT INVENTORY FOR UPDATE
  ------------------------------ */
  editInventory(inv: any): void {
    this.updateId = inv.id;
    this.productId = null;

    this.itemForm.patchValue({
      stockQuantity: inv.stockQuantity
    });

    this.showError = false;
    this.showMessage = false;
  }

  /* -----------------------------
     ADD / UPDATE INVENTORY
  ------------------------------ */
  onSubmit(): void {

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const wholesalerId = localStorage.getItem('userId');
    const payload = {
      wholesalerId: wholesalerId,
      stockQuantity: this.itemForm.value.stockQuantity
    };

    if (this.updateId) {
      // UPDATE INVENTORY
      this.httpService.updateInventory(
        payload.stockQuantity,
        this.updateId
      ).subscribe({
        next: () => {
          this.showMessage = true;
          this.responseMessage = 'Inventory updated successfully';
          this.resetForm();
          this.getInventory();
        },
        error: () => {
          this.showError = true;
          this.errorMessage = 'Failed to update inventory';
        }
      });

    } else if (this.productId) {
      // ADD INVENTORY
      this.httpService.addInventory(payload, this.productId).subscribe({
        next: () => {
          this.showMessage = true;
          this.responseMessage = 'Inventory added successfully';
          this.resetForm();
          this.getInventory();
        },
        error: () => {
          this.showError = true;
          this.errorMessage = 'Failed to add inventory';
        }
      });
    } else {
      this.showError = true;
      this.errorMessage = 'Select product or inventory first';
    }
  }

  /* -----------------------------
     RESET FORM
  ------------------------------ */
  resetForm(): void {
    this.itemForm.reset();
    this.productId = null;
    this.updateId = null;
  }
}