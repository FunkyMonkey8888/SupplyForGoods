import { Component, OnInit } from '@angular/core';
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

  // ✅ new: low stock filter
  showLowStockOnly = false;
  lowStockThreshold = 10;

  // ✅ derived UI permissions
  get canSeeStock(): boolean {
    return this.role === 'MANUFACTURER';
  }

  // ✅ allowed sort keys based on role
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
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole() || '';

    // if role can't see stock, ensure we never sort by it
    if (!this.canSeeStock && this.sortKey === 'stockQuantity') {
      this.sortKey = 'name';
    }

    this.loadProducts();
  }

  refresh(): void {
    this.loadProducts(true);
  }

  private loadProducts(force: boolean = false): void {
    const userId = this.auth.getUserId();
    if (!userId) {
      this.message = 'Invalid user session.';
      return;
    }

    this.loading = true;
    this.message = '';

    // ✅ when search term exists, prefer server search
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
            // fallback to full list + local filter
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
        // low-stock endpoint exists for wholesaler products list
        this.http.getLowStockProductsByWholesaler(this.lowStockThreshold).subscribe({
          next: res => this.onLoaded(res),
          error: () => {
            // fallback: normal list
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
          // fallback to full list + local filter
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

    // If role cannot see stock, we ensure any accidental stock sorting is avoided
    if (!this.canSeeStock && this.sortKey === 'stockQuantity') {
      this.sortKey = 'name';
    }

    // If API search was used, local filter is not required,
    // but we keep it available if we loaded full list due to fallback.
    if (applyLocalFilterAfterLoad) {
      this.applyAll();
    } else {
      // Still apply sorting + paging (filter is basically "no-op" if term empty)
      this.applyAll();
    }
  }

  private onError(): void {
    this.loading = false;
    this.message = 'Failed to load products.';
    this.products = [];
    this.applyAll();
  }

  // ===== UI handlers =====

  onSearchChange(value: string): void {
    this.searchTerm = value || '';
    this.currentPage = 1;

    // Prefer server search when term exists
    if (this.searchTerm.trim()) {
      this.loadProducts();
    } else {
      // if cleared, load base list again
      this.loadProducts();
    }
  }

  changeSortKey(value: string): void {
    const key = (value as SortKey) || 'name';

    // prevent selecting stockQuantity for roles that should not see it
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

    // ✅ IMPORTANT: hide stock matching for non-manufacturer roles
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

    // prevent sorting by stock for non-manufacturer
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