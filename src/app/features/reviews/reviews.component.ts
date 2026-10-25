import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { CompanyApiService } from '../../core/api/company-api.service';
import { CompanyContextService } from '../../core/api/company-context.service';
import { Comment, Review } from '../../core/api/models';
import { Page, emptyPage } from '../../core/model/page.model';
import { PaginationComponent } from '../../core/ui/pagination.component';
import { EmptyStateComponent } from '../../core/ui/empty-state.component';
import { ToastService } from '../../core/ui/toast.service';
import { ConfirmService } from '../../core/ui/confirm.service';
import { apiErrorMessage } from '../../core/ui/api-error';
import { initials, timeAgo } from '../../core/ui/format';
import { ChevronDown, CornerDownRight, LoaderCircle, MessageSquare, Reply, Send, Star, Trash2, X } from '../../core/ui/icons';

interface Thread {
  open: boolean;
  loading: boolean;
  comments: Comment[];
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule, PaginationComponent, EmptyStateComponent],
  templateUrl: './reviews.component.html',
})
export class ReviewsComponent implements OnInit {
  private api = inject(CompanyApiService);
  private context = inject(CompanyContextService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  // Filters, mirrored in the URL
  readonly unanswered = signal(false);
  readonly rating = signal<number | null>(null);
  readonly productId = signal<number | null>(null);
  readonly productName = signal<string | null>(null);
  readonly size = 10;

  readonly reviews = signal<Page<Review>>(emptyPage());
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  // Per review: reply box text and the expanded conversation
  readonly drafts: Record<number, string> = {};
  readonly replyOpen = signal<number | null>(null);
  readonly threads = signal<Record<number, Thread>>({});
  // Reply to a comment inside a conversation
  readonly commentReplyTo = signal<number | null>(null);
  commentReplyText = '';
  readonly sending = signal(false);

  readonly stars = [1, 2, 3, 4, 5];
  readonly initials = initials;
  readonly timeAgo = timeAgo;
  protected readonly icons = { Star, Reply, Send, MessageSquare, ChevronDown, CornerDownRight, Trash2, X, LoaderCircle };

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.unanswered.set(params.get('filter') === 'unanswered');
      this.rating.set(params.get('rating') ? Number(params.get('rating')) : null);
      this.productId.set(params.get('product') ? Number(params.get('product')) : null);
      this.load(Number(params.get('page') ?? 0));
    });
  }

  load(page = 0) {
    this.loading.set(true);
    this.error.set(null);
    this.api.getReviews({ unanswered: this.unanswered(), rating: this.rating(), productId: this.productId(), page, size: this.size }).subscribe({
      next: res => {
        this.reviews.set(res);
        this.loading.set(false);
        this.productName.set(this.productId() ? res.content[0]?.productName ?? null : null);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Could not load reviews.'));
        this.loading.set(false);
      }
    });
  }

  setFilters(changes: Record<string, string | number | null>) {
    const queryParams: Record<string, string | number | null> = { page: null, ...changes };
    for (const key of Object.keys(queryParams)) {
      const value = queryParams[key];
      if (value === '' || (key === 'page' && value === 0)) queryParams[key] = null;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  // ── Replying to a review ──

  openReply(review: Review) {
    this.replyOpen.set(review.id);
    this.drafts[review.id] ??= '';
  }

  sendReply(review: Review) {
    const text = (this.drafts[review.id] ?? '').trim();
    if (!text) return;
    this.sending.set(true);
    this.api.replyToReview(review.id, text).subscribe({
      next: comment => {
        this.sending.set(false);
        this.drafts[review.id] = '';
        this.replyOpen.set(null);
        this.patchReview(review.id, r => ({ ...r, previewComment: comment, commentsCount: r.commentsCount + 1 }));
        this.appendToThread(review.id, comment);
        this.context.refreshCounts();
        this.toast.success('Reply posted. The customer can see it now.');
      },
      error: err => {
        this.sending.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not post the reply.'));
      }
    });
  }

  // ── Conversation ──

  toggleThread(review: Review) {
    const current = this.threads()[review.id];
    if (current?.open) {
      this.setThread(review.id, { ...current, open: false });
      return;
    }
    this.setThread(review.id, { open: true, loading: true, comments: current?.comments ?? [] });
    this.api.getComments(review.id).subscribe({
      next: page => this.setThread(review.id, { open: true, loading: false, comments: page.content }),
      error: err => {
        this.setThread(review.id, { open: true, loading: false, comments: [] });
        this.toast.error(apiErrorMessage(err, 'Could not load the conversation.'));
      }
    });
  }

  startCommentReply(comment: Comment) {
    this.commentReplyTo.set(comment.id);
    this.commentReplyText = '';
  }

  sendCommentReply(review: Review, comment: Comment) {
    const text = this.commentReplyText.trim();
    if (!text) return;
    this.sending.set(true);
    this.api.replyToComment(comment.id, text).subscribe({
      next: saved => {
        this.sending.set(false);
        this.commentReplyTo.set(null);
        this.commentReplyText = '';
        this.appendToThread(review.id, saved);
        this.patchReview(review.id, r => ({ ...r, previewComment: saved, commentsCount: r.commentsCount + 1 }));
        this.context.refreshCounts();
      },
      error: err => {
        this.sending.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not post the reply.'));
      }
    });
  }

  async deleteComment(review: Review, comment: Comment) {
    const ok = await this.confirm.ask({ title: 'Delete this reply?', message: 'Customers will see that a reply was deleted.', confirmLabel: 'Delete', tone: 'danger' });
    if (!ok) return;
    this.api.deleteComment(comment.id).subscribe({
      next: () => {
        const thread = this.threads()[review.id];
        if (thread) {
          this.setThread(review.id, { ...thread, comments: thread.comments.map(c => c.id === comment.id ? { ...c, deleted: true, content: '[deleted Comment]' } : c) });
        }
        this.patchReview(review.id, r => r.previewComment?.id === comment.id ? { ...r, previewComment: { ...r.previewComment, deleted: true } } : r);
        this.context.refreshCounts();
        this.toast.success('Reply deleted.');
      },
      error: err => this.toast.error(apiErrorMessage(err, 'Could not delete the reply.'))
    });
  }

  thread(reviewId: number): Thread | undefined {
    return this.threads()[reviewId];
  }

  private setThread(reviewId: number, thread: Thread) {
    this.threads.update(t => ({ ...t, [reviewId]: thread }));
  }

  private appendToThread(reviewId: number, comment: Comment) {
    const thread = this.threads()[reviewId];
    if (thread) this.setThread(reviewId, { ...thread, comments: [...thread.comments, comment] });
  }

  private patchReview(reviewId: number, change: (r: Review) => Review) {
    this.reviews.update(page => ({ ...page, content: page.content.map(r => r.id === reviewId ? change(r) : r) }));
  }
}
