import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.scss']
})
export class PlaceOrderComponent implements OnInit {

  itemForm!: FormGroup;

  inventories: any[] = [];
  selectedInventory: any = null;

  userId!: number;
  role: string | null = null;

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.auth.getUserId());
    this.role = this.auth.getRole();

    this.buildForm();

    if (!this.userId || !this.role) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    if (this.role !== 'WHOLESALER') {
      this.errorMessage = 'Only wholesalers can place orders here.';
      return;
    }

    this.loadInventories();
  }

  private buildForm(): void {
    this.itemForm = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      status: ['PENDING']
    });
  }

  get availableStock(): number {
    return Number(this.selectedInventory?.stockQuantity ?? 0);
  }

  isSelected(inv: any): boolean {
    return Number(inv?.id) === Number(this.selectedInventory?.id);
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  refreshInventories(): void {
    this.loadInventories(true);
  }

  private loadInventories(keepSelection: boolean = false): void {
    this.clearMessages();

    this.http.getInventoryByWholesalers(this.userId).subscribe({
      next: inventories => {
        this.inventories = inventories || [];

        if (this.inventories.length === 0) {
          this.errorMessage = 'You must add inventory before placing any orders.';
        }

        if (keepSelection && this.selectedInventory?.product?.id) {
          const pid = Number(this.selectedInventory.product.id);
          const match = this.inventories.find(x => Number(x?.product?.id) === pid);
          this.selectedInventory = match || null;
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load inventory';
      }
    });
  }

  selectInventory(inventory: any): void {
    this.selectedInventory = inventory;
    this.clearMessages();

    this.itemForm.patchValue({ quantity: '' });
  }

  private refreshSelectedInventoryThenPlaceOrder(qty: number): void {
    const productId = this.selectedInventory?.product?.id;

    if (!productId) {
      this.errorMessage = 'Selected inventory has no product.';
      this.loading = false;
      return;
    }

    // ✅ Prevent stale stock: fetch latest inventory for this wholesaler+product
    this.http.getInventoryByWholesalerAndProduct(this.userId, productId).subscribe({
      next: inv => {
        this.selectedInventory = inv;

        const latestStock = Number(inv?.stockQuantity ?? 0);
        if (qty > latestStock) {
          this.errorMessage = `Insufficient stock. Available: ${latestStock}`;
          this.loading = false;
          return;
        }

        this.doPlaceOrder(qty, productId);
      },
      error: () => {
        // If refresh fails, still allow user to try (optional). Here we block for safety.
        this.errorMessage = 'Unable to verify latest stock. Please try again.';
        this.loading = false;
      }
    });
  }

  private doPlaceOrder(qty: number, productId: number): void {
    this.http.placeOrder(
      {
        wholesalerId: this.userId,
        quantity: qty,
        status: 'PENDING'
      },
      productId,
      this.userId
    ).subscribe({
      next: () => {
        this.successMessage = 'Order placed successfully';
        this.loading = false;

        this.itemForm.reset({ status: 'PENDING', quantity: '' });
        this.selectedInventory = null;

        // ✅ refresh inventory list so UI stays accurate
        this.loadInventories();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Order placement failed';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.clearMessages();

    if (this.role !== 'WHOLESALER') {
      this.errorMessage = 'Only wholesalers can place orders here.';
      return;
    }

    if (!this.selectedInventory) {
      this.errorMessage = 'Please select an inventory item';
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const qty = Number(this.itemForm.value.quantity);
    const availableStock = this.availableStock;

    if (qty > availableStock) {
      this.errorMessage = `Insufficient stock. Available: ${availableStock}`;
      return;
    }

    this.loading = true;

    // ✅ Extra feature: verify latest stock before placing order
    this.refreshSelectedInventoryThenPlaceOrder(qty);
  }
}