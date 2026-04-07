import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

type SortKey = 'name' | 'price' | 'stockQuantity';

@Component({
  selector: 'app-view-products',
  templateUrl: './view-products.component.html',
  styleUrls: ['./view-products.component.scss']
})
export class ViewProductsComponent implements OnInit {
  products: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];

  loading = false;
  message = '';

  searchTerm = '';
  sortKey: SortKey = 'name';
  sortDir: 'asc' | 'desc' = 'asc';

  pageSize = 9;
  currentPage = 1;
  totalPages = 1;

  pageSizes = [6, 9, 12];
  role: string = '';

  // low stock filter
  showLowStockOnly = false;
  lowStockThreshold = 10;

  // manufacturer edit/delete
  editingId: number | null = null;
  editForm!: FormGroup;
  saving = false;

  // wholesaler orders count per product (for delete restriction)
  wholesalerOrderCount: Record<number, number> = {};

  get canSeeStock(): boolean {
    return this.role === 'MANUFACTURER';
  }

  get isManufacturer(): boolean {
    return this.role === 'MANUFACTURER';
  }

  get sortKeys(): { key: SortKey; label: string }[] {
    const base = [
      { key: 'name' as SortKey, label: 'Name' },
      { key: 'price' as SortKey, label: 'Price' }
    ];
    if (this.canSeeStock) base.push({ key: 'stockQuantity', label: 'Stock' });
    return base;
  }

  constructor(
    private http: HttpService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole() || '';

    if (!this.canSeeStock && this.sortKey === 'stockQuantity') {
      this.sortKey = 'name';
    }

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(1)]],
      stockQuantity: [0, [Validators.required, Validators.min(1)]]
    });

    this.loadProducts();
  }

  refresh(): void {
    this.loadProducts(true);
  }

  private loadProducts(force: boolean = false): void {
    const userIdRaw = this.auth.getUserId();
    const userId = userIdRaw != null ? Number(userIdRaw) : null;

    if (!userId) {
      this.message = 'Invalid user session.';
      return;
    }

    this.loading = true;
    this.message = '';

    const term = (this.searchTerm || '').trim();

    // Manufacturer
    if (this.role === 'MANUFACTURER') {
      if (this.showLowStockOnly) {
        this.http.getLowStockProductsByManufacturer(userId, this.lowStockThreshold).subscribe({
          next: res => this.onLoaded(res),
          error: () => this.onError()
        });
        return;
      }

      if (term) {
        this.http.searchProductsByManufacturer(term).subscribe({
          next: res => this.onLoaded(res),
          error: () => {
            this.http.getProductsByManufacturer(userId).subscribe({
              next: res2 => this.onLoaded(res2, true),
              error: () => this.onError()
            });
          }
        });
        return;
      }

      this.http.getProductsByManufacturer(userId).subscribe({
        next: res => this.onLoaded(res),
        error: () => this.onError()
      });
      return;
    }

    // Wholesaler
    if (this.role === 'WHOLESALER') {
      if (this.showLowStockOnly) {
        this.http.getLowStockProductsByWholesaler(this.lowStockThreshold).subscribe({
          next: res => this.onLoaded(res),
          error: () => {
            this.http.getProductsByWholesaler().subscribe({
              next: res2 => this.onLoaded(res2, true),
              error: () => this.onError()
            });
          }
        });
        return;
      }

      if (term) {
        this.http.searchProductsByWholesaler(term).subscribe({
          next: res => this.onLoaded(res),
          error: () => {
            this.http.getProductsByWholesaler().subscribe({
              next: res2 => this.onLoaded(res2, true),
              error: () => this.onError()
            });
          }
        });
        return;
      }

      this.http.getProductsByWholesaler().subscribe({
        next: res => this.onLoaded(res),
        error: () => this.onError()
      });
      return;
    }

    // Consumer (default)
    if (term) {
      this.http.searchProductsByConsumers(term).subscribe({
        next: res => this.onLoaded(res),
        error: () => {
          this.http.getProductsByConsumers().subscribe({
            next: res2 => this.onLoaded(res2, true),
            error: () => this.onError()
          });
        }
      });
      return;
    }

    this.http.getProductsByConsumers().subscribe({
      next: res => this.onLoaded(res),
      error: () => this.onError()
    });
  }

  private onLoaded(res: any, applyLocalFilterAfterLoad: boolean = false): void {
    this.products = Array.isArray(res) ? res : [];
    this.loading = false;

    if (this.products.length === 0) {
      this.message = 'No products found.';
    } else {
      this.message = '';
    }

    if (!this.canSeeStock && this.sortKey === 'stockQuantity') {
      this.sortKey = 'name';
    }

    // Manufacturer-only: fetch wholesaler order counts to control delete button
    if (this.isManufacturer) {
      this.wholesalerOrderCount = {};
      this.fetchWholesalerOrderCounts();
    }

    this.applyAll();
  }

  private onError(): void {
    this.loading = false;
    this.message = 'Failed to load products.';
    this.products = [];
    this.filtered = [];
    this.paged = [];
    this.totalPages = 1;
    this.currentPage = 1;
  }

  // ===== Manufacturer: Delete constraint & Edit =====

  private fetchWholesalerOrderCounts(): void {
    for (const p of this.products) {
      const pid = Number(p?.id);
      if (!pid) continue;

      // expects HttpService.getWholesalerOrderCountForProduct(productId)
      this.http.getWholesalerOrderCountForProduct(pid).subscribe({
        next: (cnt: number) => (this.wholesalerOrderCount[pid] = Number(cnt || 0)),
        error: () => (this.wholesalerOrderCount[pid] = 0)
      });
    }
  }

  canDeleteProduct(product: any): boolean {
    if (!this.isManufacturer) return false;
    const pid = Number(product?.id);
    const cnt = Number(this.wholesalerOrderCount[pid] ?? 0);
    return cnt === 0;
  }

  deleteProduct(product: any): void {
    if (!this.isManufacturer) return;

    const pid = Number(product?.id);
    if (!pid) return;

    const cnt = Number(this.wholesalerOrderCount[pid] ?? 0);
    if (cnt > 0) {
      this.message = `Cannot delete product. Wholesaler orders exist: ${cnt}`;
      return;
    }

    this.loading = true;
    this.message = '';

    // expects HttpService.deleteManufacturerProduct(productId)
    this.http.deleteManufacturerProduct(pid).subscribe({
      next: () => {
        this.loading = false;
        this.editingId = null;
        this.loadProducts();
      },
      error: (err: any) => {
        this.loading = false;
        this.message = err?.error?.message || 'Delete failed.';
      }
    });
  }

  startEdit(product: any): void {
    if (!this.isManufacturer) return;

    this.message = '';
    this.editingId = Number(product?.id) || null;

    this.editForm.patchValue({
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: Number(product?.price ?? 0),
      stockQuantity: Number(product?.stockQuantity ?? 0)
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset({
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0
    });
  }

  saveEdit(original: any): void {
    if (!this.isManufacturer) return;
    if (!this.editingId) return;

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const userIdRaw = this.auth.getUserId();
    const manufacturerId = userIdRaw != null ? Number(userIdRaw) : null;
    if (!manufacturerId) {
      this.message = 'Invalid user session.';
      return;
    }

    this.saving = true;
    this.message = '';

    const payload = {
      ...original,
      ...this.editForm.value,
      manufacturerId
    };

    // expects HttpService.updateManufacturerProduct(productId, body)
    this.http.updateManufacturerProduct(this.editingId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.editingId = null;
        this.loadProducts();
      },
      error: (err: any) => {
        this.saving = false;
        this.message = err?.error?.message || 'Update failed.';
      }
    });
  }

  // ===== UI handlers =====

  onSearchChange(value: string): void {
    this.searchTerm = value || '';
    this.currentPage = 1;
    this.loadProducts();
  }

  changeSortKey(value: string): void {
    const key = (value as SortKey) || 'name';

    if (!this.canSeeStock && key === 'stockQuantity') {
      this.sortKey = 'name';
    } else {
      this.sortKey = key;
    }

    this.currentPage = 1;
    this.applyAll();
  }

  toggleSortDir(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.currentPage = 1;
    this.applyAll();
  }

  changePageSize(value: string): void {
    const n = Number(value);
    this.pageSize = this.pageSizes.includes(n) ? n : 9;
    this.currentPage = 1;
    this.applyAll();
  }

  toggleLowStock(checked: boolean): void {
    this.showLowStockOnly = !!checked;
    this.currentPage = 1;
    this.loadProducts();
  }

  setLowStockThreshold(value: string): void {
    const n = Number(value);
    this.lowStockThreshold = !isNaN(n) && n > 0 ? n : 10;
    if (this.showLowStockOnly) this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyPaging();
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    if (total <= 1) return [1];

    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(total, this.currentPage + 2);

    for (let i = start; i <= end; i++) pages.push(i);

    if (pages[0] !== 1) pages.unshift(1);
    if (pages[pages.length - 1] !== total) pages.push(total);

    return Array.from(new Set(pages));
  }

  // ===== Filtering / Sorting / Paging =====

  private applyAll(): void {
    this.applyFilter();
    this.applySort();
    this.applyPaging();
  }

  private applyFilter(): void {
    const term = (this.searchTerm || '').trim().toLowerCase();

    if (!term) {
      this.filtered = [...this.products];
      return;
    }

    this.filtered = this.products.filter(p => {
      const name = String(p?.name ?? '').toLowerCase();
      const desc = String(p?.description ?? '').toLowerCase();
      const price = String(p?.price ?? '').toLowerCase();

      if (this.canSeeStock) {
        const stock = String(p?.stockQuantity ?? '').toLowerCase();
        return name.includes(term) || desc.includes(term) || price.includes(term) || stock.includes(term);
      }

      return name.includes(term) || desc.includes(term) || price.includes(term);
    });
  }

  private applySort(): void {
    const key = this.sortKey;
    const dir = this.sortDir === 'asc' ? 1 : -1;

    const effectiveKey: SortKey = (!this.canSeeStock && key === 'stockQuantity') ? 'name' : key;

    this.filtered.sort((a, b) => {
      const av = a?.[effectiveKey];
      const bv = b?.[effectiveKey];

      if (effectiveKey === 'name') {
        const as = String(av ?? '').toLowerCase();
        const bs = String(bv ?? '').toLowerCase();
        return as.localeCompare(bs) * dir;
      }

      const an = Number(av ?? 0);
      const bn = Number(bv ?? 0);
      if (an === bn) return 0;
      return (an > bn ? 1 : -1) * dir;
    });
  }

  private applyPaging(): void {
    const count = this.filtered.length;
    this.totalPages = Math.max(1, Math.ceil(count / this.pageSize));

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paged = this.filtered.slice(start, end);

    if (!this.loading && this.products.length > 0 && this.filtered.length === 0) {
      this.message = 'No matching products found.';
    } else if (!this.loading && this.products.length > 0 && this.filtered.length > 0) {
      this.message = '';
    }
  }
}