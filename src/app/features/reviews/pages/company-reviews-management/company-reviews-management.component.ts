import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { ReviewResponse } from '../../models/reviewDTO/reviewResponse.model';
import { CommentResponse } from '../../models/commentDTO/commentResponse.model';
import { ReviewService } from '../../../../core/services/reviewService/review.service';
import { CommentService } from '../../../../core/services/commentService/comment.service';

@Component({
  selector: 'app-company-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-reviews-management.component.html',
  styleUrl: './company-reviews-management.component.css'
})
export class CompanyReviewsManagementComponent implements OnInit {

  // ===================== REVIEWS =====================
  reviews: (ReviewResponse & {
    newComment?: string;
  })[] = [];

  selectedRating: number | null = null;
  loading = false;
  error: string | null = null;

  // ===================== COMMENTS =====================
  expandedReviewIds = new Set<number>();
  commentsMap: { [reviewId: number]: CommentResponse[] } = {};
  loadingComments: { [reviewId: number]: boolean } = {};

  // ===================== REPLY STATE =====================
  replyingToCommentId: number | null = null;
  replyText = '';

  constructor(
    private reviewService: ReviewService,
    private commentService: CommentService
  ) {}

  ngOnInit() {
    this.loadReviews();
  }

  // ===================== REVIEWS =====================
  loadReviews() {
    this.loading = true;

    this.reviewService.getMyCompanyReviews().subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load reviews';
        this.loading = false;
      }
    });
  }

  get filteredReviews() {
    if (!this.selectedRating) return this.reviews;
    return this.reviews.filter(r => r.rating === this.selectedRating);
  }

  setFilter(rating: number | null) {
    this.selectedRating = rating;
  }

  // ===================== COMMENTS =====================
  toggleComments(reviewId: number) {
    if (this.expandedReviewIds.has(reviewId)) {
      this.expandedReviewIds.delete(reviewId);
      return;
    }

    this.expandedReviewIds.add(reviewId);

    if (!this.commentsMap[reviewId]) {
      this.loadComments(reviewId);
    }
  }

  loadComments(reviewId: number) {
    this.loadingComments[reviewId] = true;

    this.commentService.getCommentsByReviewId(reviewId).subscribe({
      next: (data) => {
        this.commentsMap[reviewId] = data;
        this.loadingComments[reviewId] = false;
      },
      error: () => {
        this.loadingComments[reviewId] = false;
      }
    });
  }

  // ===================== ADD COMMENT =====================
  addComment(review: any) {
    if (!review.newComment?.trim()) return;

    const reviewId = review.id;

    const temp: CommentResponse = {
      id: Date.now(),
      content: review.newComment,
      actorName: 'You',
      actorType: 'COMPANY' as any,
      actorId: 0,
      reviewId,
      isMine: true,
      createdAt: new Date().toISOString(),
      repliedToActorName: null,
      repliedToCommentId: null,
      repliedToActorId: null,
      repliedToActorType: null,
    };

    this.commentsMap[reviewId] = [
      temp,
      ...(this.commentsMap[reviewId] || [])
    ];

    const payload = { content: review.newComment };

    review.newComment = '';

    this.commentService.createCommentAsCompany(reviewId, payload).subscribe({
      next: (saved) => {
        this.commentsMap[reviewId] = this.commentsMap[reviewId].map(c =>
          c.id === temp.id ? saved : c
        );
      },
      error: () => {
        this.commentsMap[reviewId] =
          this.commentsMap[reviewId].filter(c => c.id !== temp.id);
      }
    });
  }

  // ===================== REPLY =====================
  startReply(comment: CommentResponse) {
    this.replyingToCommentId = comment.id;
    this.replyText = '';
  }

  cancelReply() {
    this.replyingToCommentId = null;
    this.replyText = '';
  }

  sendReply(comment: CommentResponse) {
    if (!this.replyText.trim()) return;

    const reviewId = comment.reviewId;

    const temp: CommentResponse = {
      id: Date.now(),
      content: this.replyText,
      actorName: 'You',
      actorType: 'COMPANY' as any,
      actorId: 0,
      reviewId,
      isMine: true,
      createdAt: new Date().toISOString(),

      repliedToCommentId: comment.id,
      repliedToActorId: comment.actorId,
      repliedToActorType: comment.actorType,
      repliedToActorName: comment.actorName
    };

    this.commentsMap[reviewId] = [
      temp,
      ...(this.commentsMap[reviewId] || [])
    ];

    const payload = {
      content: this.replyText,
      reviewId
    };

    this.replyText = '';
    this.replyingToCommentId = null;

    this.commentService.replyToCommentAsCompany(comment.id, payload).subscribe({
      next: (saved) => {
        this.commentsMap[reviewId] = this.commentsMap[reviewId].map(c =>
          c.id === temp.id ? saved : c
        );
      },
      error: () => {
        this.commentsMap[reviewId] =
          this.commentsMap[reviewId].filter(c => c.id !== temp.id);
      }
    });
  }
}
