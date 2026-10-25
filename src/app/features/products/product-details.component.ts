import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { CompanyApiService } from '../../core/api/company-api.service';
import { ProductDetails, Review } from '../../core/api/models';
import { SharedService } from '../../core/services/sharedService/shared.service';
import { BadgeComponent } from '../../core/ui/badge.component';
import { EmptyStateComponent } from '../../core/ui/empty-state.component';
import { ToastService } from '../../core/ui/toast.service';
import { apiErrorMessage } from '../../core/ui/api-error';
import { initials, timeAgo } from '../../core/ui/format';
import { ArrowLeft, ImageOff, MessageSquare, Pencil, Reply, Send, Star } from '../../core/ui/icons';
import { STATUS_EXPLANATIONS, STATUS_LABELS } from './product-status';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [DecimalPipe, RouterLink, LucideAngularModule, BadgeComponent, EmptyStateComponent],
  templateUrl: './product-details.component.html',
})
export class ProductDetailsComponent implements OnInit {
  private api = inject(CompanyApiService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  public sharedService = inject(SharedService);

  readonly product = signal<ProductDetails | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly reviewTotal = signal(0);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly selectedImage = signal<string | null>(null);

  readonly currentImage = computed(() => {
    const p = this.product();
    return this.selectedImage() ?? p?.images.find(i => i.isMain)?.url ?? p?.images[0]?.url ?? null;
  });
  readonly canSubmit = computed(() => ['DRAFT', 'REJECTED'].includes(this.product()?.status ?? ''));

  readonly statusLabels = STATUS_LABELS;
  readonly explanations = STATUS_EXPLANATIONS;
  readonly stars = [1, 2, 3, 4, 5];
  readonly initials = initials;
  readonly timeAgo = timeAgo;
  protected readonly icons = { ArrowLeft, Pencil, Send, Star, ImageOff, MessageSquare, Reply };

  private id = 0;

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
    this.api.getReviews({ productId: this.id, size: 5 }).subscribe({
      next: page => {
        this.reviews.set(page.content);
        this.reviewTotal.set(page.totalElements);
      }
    });
  }

  load() {
    this.api.getProduct(this.id).subscribe({
      next: p => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load this product.'));
        this.loading.set(false);
      }
    });
  }

  // Send a draft or rejected product to ReviewHood for approval, unchanged
  submitForReview() {
    const p = this.product();
    if (!p) return;
    this.submitting.set(true);
    this.api.updateProduct(p.id, { name: p.name, description: p.description, subcategoryId: p.subcategoryId, status: 'PENDING_REVIEW' }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.product.set({ ...p, status: 'PENDING_REVIEW' });
        this.toast.success('Submitted. ReviewHood will review your product soon.');
      },
      error: err => {
        this.submitting.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not submit the product.'));
      }
    });
  }
}
