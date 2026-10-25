import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { CompanyApiService } from '../../core/api/company-api.service';
import { Product, ProductStatus, ProductStatusCounts } from '../../core/api/models';
import { SharedService } from '../../core/services/sharedService/shared.service';
import { Page, emptyPage } from '../../core/model/page.model';
import { BadgeComponent } from '../../core/ui/badge.component';
import { PaginationComponent } from '../../core/ui/pagination.component';
import { EmptyStateComponent } from '../../core/ui/empty-state.component';
import { SearchInputComponent } from '../../core/ui/search-input.component';
import { apiErrorMessage } from '../../core/ui/api-error';
import { Package, Pencil, Plus } from '../../core/ui/icons';
import { STATUS_LABELS } from './product-status';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [DatePipe, RouterLink, LucideAngularModule, BadgeComponent, PaginationComponent, EmptyStateComponent, SearchInputComponent],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  private api = inject(CompanyApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public sharedService = inject(SharedService);

  readonly tabs: { value: ProductStatus | null; label: string }[] = [
    { value: null, label: 'All' },
    { value: 'PUBLISHED', label: 'Live' },
    { value: 'PENDING_REVIEW', label: 'In review' },
    { value: 'DRAFT', label: 'Drafts' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  readonly status = signal<ProductStatus | null>(null);
  readonly q = signal('');
  readonly size = 20;
  readonly products = signal<Page<Product>>(emptyPage());
  readonly counts = signal<ProductStatusCounts>({});
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly totalCount = computed(() => Object.values(this.counts()).reduce((a, b) => a + (b ?? 0), 0));
  readonly statusLabels = STATUS_LABELS;
  protected readonly icons = { Plus, Pencil, Package };

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.status.set((params.get('status') as ProductStatus) || null);
      this.q.set(params.get('q') ?? '');
      this.load(Number(params.get('page') ?? 0));
    });
  }

  load(page = 0) {
    this.loading.set(true);
    this.error.set(null);
    this.api.getProducts({ q: this.q(), status: this.status(), page, size: this.size }).subscribe({
      next: res => {
        this.products.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load your products.'));
        this.loading.set(false);
      }
    });
    this.api.getProductStatusCounts().subscribe({ next: c => this.counts.set(c) });
  }

  setFilters(changes: Record<string, string | number | null>) {
    const queryParams: Record<string, string | number | null> = { page: null, ...changes };
    for (const key of Object.keys(queryParams)) {
      const value = queryParams[key];
      if (value === '' || (key === 'page' && value === 0)) queryParams[key] = null;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }
}
