import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.css']
})
export class AddInventoryComponent implements OnInit {

  itemForm: FormGroup;
  formModel: any = { status: null };
  showError: boolean = false;
  errorMessage: any;
  productList: any[] = [];
  showMessage: boolean = false;
  responseMessage: any;
  orderList: any[] = [];
  updateId: any;
  productId: any;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService
  ) {
    this.itemForm = this.fb.group({
      wholesalerId: [this.authService.getUserId(), Validators.required],
      stockQuantity: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getInventory();
    this.getProducts();
  }

  getInventory() {
    const userId = this.authService.getUserId();
    this.httpService.getInventoryByWholesalers(userId).subscribe({
      next: (res) => {
        this.orderList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load inventory';
      }
    });
  }

  getProducts() {
    this.httpService.getProductsByWholesaler().subscribe({
      next: (res) => {
        this.productList = res;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load products';
      }
    });
  }

  editInventory(item: any) {
    this.updateId = item.id;
    this.itemForm.patchValue({
      wholesalerId: item.wholesalerId,
      stockQuantity: item.stockQuantity
    });
    this.showMessage = false;
    this.showError = false;
  }

  selectProduct(product: any) {
    this.productId = product.id;
    this.showMessage = false;
    this.showError = false;
  }

  onSubmit() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    if (this.updateId) {
      this.httpService.updateInventory(
        this.itemForm.value.stockQuantity,
        this.updateId
      ).subscribe({
        next: () => {
          this.showMessage = true;
          this.responseMessage = 'Inventory updated successfully';
          this.updateId = null;
          this.itemForm.reset({ wholesalerId: this.authService.getUserId() });
          this.getInventory();
        },
        error: () => {
          this.showError = true;
          this.errorMessage = 'Inventory update failed';
        }
      });
    } else {
      if (!this.productId) {
        return;
      }

      this.httpService.addInventory(
        this.itemForm.value,
        this.productId
      ).subscribe({
        next: () => {
          this.showMessage = true;
          this.responseMessage = 'Inventory added successfully';
          this.itemForm.reset({ wholesalerId: this.authService.getUserId() });
          this.productId = null;
          this.getInventory();
        },
        error: () => {
          this.showError = true;
          this.errorMessage = 'Inventory addition failed';
        }
      });
    }
  }
}