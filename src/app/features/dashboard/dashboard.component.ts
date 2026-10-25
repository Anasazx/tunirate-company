import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';

import { CompanyApiService } from '../../core/api/company-api.service';
import { CompanyContextService } from '../../core/api/company-context.service';
import { CompanyDashboard } from '../../core/api/models';
import { AuthService } from '../auth/services/authService/auth.service';
import { LineChartComponent } from '../../core/ui/line-chart.component';
import { EmptyStateComponent } from '../../core/ui/empty-state.component';
import { apiErrorMessage } from '../../core/ui/api-error';
import { timeAgo } from '../../core/ui/format';
import { ArrowRight, CircleCheck, FileText, Hourglass, MessageSquare, Package, Plus, Reply, Star, TriangleAlert } from '../../core/ui/icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink, LucideAngularModule, LineChartComponent, EmptyStateComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private api = inject(CompanyApiService);
  readonly context = inject(CompanyContextService);
  private readonly authUser = toSignal(inject(AuthService).currentUser$);

  readonly firstName = computed(() => this.authUser()?.user?.name?.split(' ')[0] ?? '');
  readonly data = signal<CompanyDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly stars = [1, 2, 3, 4, 5];
  readonly timeAgo = timeAgo;
  protected readonly icons = { Star, MessageSquare, Package, Reply, ArrowRight, Plus, FileText, Hourglass, TriangleAlert, CircleCheck };

  readonly reviewsLast30 = computed(() => (this.data()?.reviewsOverTime ?? []).reduce((sum, p) => sum + p.count, 0));
  readonly chartLabels = computed(() => (this.data()?.reviewsOverTime ?? []).map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })));
  readonly chartValues = computed(() => (this.data()?.reviewsOverTime ?? []).map(p => p.count));

  // 5★ → 1★ with share of all reviews
  readonly ratingRows = computed(() => {
    const dist = this.data()?.ratingDistribution ?? {};
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    return [5, 4, 3, 2, 1].map(stars => {
      const count = dist[stars] ?? 0;
      return { stars, count, percent: total ? Math.round((count / total) * 100) : 0 };
    });
  });

  // Products that need something from the company
  readonly productTodos = computed(() => {
    const s = this.data()?.productsByStatus ?? {};
    return [
      { status: 'REJECTED', label: 'Rejected', hint: 'Fix them and submit again', count: s['REJECTED'] ?? 0, icon: TriangleAlert, tone: 'text-red-600 bg-red-50' },
      { status: 'DRAFT', label: 'Drafts', hint: 'Not submitted yet', count: s['DRAFT'] ?? 0, icon: FileText, tone: 'text-slate-600 bg-slate-100' },
      { status: 'PENDING_REVIEW', label: 'In review', hint: 'Waiting for ReviewHood', count: s['PENDING_REVIEW'] ?? 0, icon: Hourglass, tone: 'text-amber-700 bg-amber-50' },
    ];
  });
  readonly published = computed(() => this.data()?.productsByStatus['PUBLISHED'] ?? 0);
  readonly nothingToDo = computed(() => this.productTodos().every(t => t.count === 0));

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getDashboard().subscribe({
      next: data => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load the dashboard.'));
        this.loading.set(false);
      }
    });
  }
}
