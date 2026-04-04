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

  constructor(
    private http: HttpService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole() || '';
    this.loadProducts();
  }

  private loadProducts(): void {
    const userId = this.auth.getUserId();
    if (!userId) {
      this.message = 'Invalid user session.';
      return;
    }

    this.loading = true;
    this.message = '';

    if (this.role === 'MANUFACTURER') {
      this.http.getProductsByManufacturer(userId).subscribe({
        next: res => {
          this.products = Array.isArray(res) ? res : [];
          this.loading = false;
          if (this.products.length === 0) this.message = 'No products found.';
          this.applyAll();
        },
        error: () => {
          this.loading = false;
          this.message = 'Failed to load products.';
          this.products = [];
          this.applyAll();
        }
      });
      return;
    }

    this.http.getProductsByConsumers().subscribe({
      next: res => {
        this.products = Array.isArray(res) ? res : [];
        this.loading = false;
        if (this.products.length === 0) this.message = 'No products found.';
        this.applyAll();
      },
      error: () => {
        this.loading = false;
        this.message = 'Failed to load products.';
        this.products = [];
        this.applyAll();
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value || '';
    this.currentPage = 1;
    this.applyAll();
  }

  changeSortKey(value: string): void {
    this.sortKey = (value as SortKey) || 'name';
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
      const stock = String(p?.stockQuantity ?? '').toLowerCase();
      return name.includes(term) || desc.includes(term) || price.includes(term) || stock.includes(term);
    });
  }

  private applySort(): void {
    const key = this.sortKey;
    const dir = this.sortDir === 'asc' ? 1 : -1;

    this.filtered.sort((a, b) => {
      const av = a?.[key];
      const bv = b?.[key];

      if (key === 'name') {
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