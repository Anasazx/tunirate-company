import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CompanyApiService } from './company-api.service';
import { Company, Membership } from './models';

// The signed-in member's company and role, loaded once by the layout and refreshed after changes
@Injectable({ providedIn: 'root' })
export class CompanyContextService {
  private api = inject(CompanyApiService);

  readonly company = signal<Company | null>(null);
  readonly membership = signal<Membership | null>(null);
  readonly unansweredReviews = signal(0);

  readonly isHead = computed(() => this.membership()?.companyRole === 'HEAD');

  refresh() {
    forkJoin({ company: this.api.getMyCompany(), membership: this.api.getMyMembership() }).subscribe({
      next: ({ company, membership }) => {
        this.company.set(company);
        this.membership.set(membership);
      },
      error: () => { /* the pages show their own errors */ }
    });
    this.refreshCounts();
  }

  // Sidebar badge: reviews still waiting for a company reply
  refreshCounts() {
    this.api.getReviews({ unanswered: true, size: 1 }).subscribe({
      next: page => this.unansweredReviews.set(page.totalElements),
      error: () => {}
    });
  }
}
