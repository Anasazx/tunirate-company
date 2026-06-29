import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReviewResponse } from '../../../core/model/dto/reviewDTO/reviewResponse.model';
import { DetailedProduct } from '../../../core/model/detailedProduct.model';
import { CommentResponse } from '../../../core/model/dto/commentDTO/commentResponse.model';
import { ProductService } from '../../../core/services/productService/product.service';
import { SharedService } from '../../../core/services/sharedService/shared.service';
import { ReviewService } from '../../../core/services/reviewService/review.service';
import { CommentService } from '../../../core/services/commentService/comment.service';
import { ReviewRequest } from '../../../core/model/dto/reviewDTO/reviewRequest.model';


@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})


export class ProductDetailsComponent implements OnInit {

  // ===================== STATE =====================
  product?: DetailedProduct;

  reviews: (ReviewResponse & {
    showComments?: boolean;
    comments?: CommentResponse[];
    newComment?: string;
  })[] = [];

  myReview: ReviewResponse | null = null;

  reviewContent = '';
  selectedRating = 0;
  hoveredRating = 0;

  submittingReview = false;
  deletingReviewId: number | null = null;

  descExpanded = false;
  selectedImage: string | null = '';

  visibleReviews = 3;

  // ===================== INIT =====================
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private location: Location,
    public sharedService: SharedService,
    private reviewService: ReviewService,
    private commentService: CommentService
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) this.loadProduct(+productId);
  }

  // ===================== LOAD PRODUCT =====================
  loadProduct(id: number) {
    this.productService.getDetailedProductById(id).subscribe({
      next: (data) => {
        this.product = data;

        const mainImage =
          data.images?.find(i => i.isMain) ?? data.images?.[0];

        this.selectedImage = mainImage?.url ?? null;

        this.loadReviews(id);
      },
      error: console.error
    });
  }

  // ===================== LOAD REVIEWS =====================
  private loadReviews(productId: number) {
    this.reviewService.getReviewsByProductId(productId, 0, 100).subscribe({
      next: (page) => {
        
        console.log("these r the idk ", page);

        this.reviews = (page.content ?? []).map(r => ({
          ...r,
          showComments: false,
          comments: [],
          newComment: ''
        }));

        this.product!.reviews = this.reviews;

        this.myReview = this.reviews.find(r => r.isMine) ?? null;

        if (this.myReview) {
          this.reviewContent = this.myReview.content ?? '';
          this.selectedRating = this.myReview.rating ?? 0;
        } else {
          this.reviewContent = '';
          this.selectedRating = 0;
        }
      },
      error: err => {
        console.error(err);
        this.reviews = [];
        this.myReview = null;
      }
    });
  }

  // ===================== REVIEW CRUD =====================
  submitReview() {
    if (!this.product?.id || this.selectedRating <= 0) return;

    const request: ReviewRequest = {
      rating: this.selectedRating,
      content: this.reviewContent || null,
      productId: this.product.id
    };

    this.submittingReview = true;

    const request$ = this.myReview
      ? this.reviewService.updateReview(this.myReview.id, request)
      : this.reviewService.createReview(request);

    request$.subscribe({
      next: (res) => {
        const saved = res as ReviewResponse;

        if (this.myReview) {
          this.reviews = this.reviews.map(r =>
            r.id === this.myReview!.id ? { ...saved, comments: r.comments, showComments: r.showComments } : r
          );
        } else {
          this.reviews = [{ ...saved, comments: [], showComments: false }, ...this.reviews];
        }

        this.product!.reviews = this.reviews;
        this.myReview = saved;

        this.reviewContent = saved.content ?? '';
        this.selectedRating = 0;
        this.submittingReview = false;
      },
      error: err => {
        console.error(err);
        this.submittingReview = false;
      }
    });
  }

  deleteReview(review: ReviewResponse) {
    if (!review.isMine || !this.product) return;

    if (!confirm('Delete your review?')) return;

    this.deletingReviewId = review.id;

    this.reviewService.deleteReview(review.id).subscribe({
      next: () => {

        this.reviews = this.reviews.filter(r => r.id !== review.id);
        this.product!.reviews = this.reviews;

        this.deletingReviewId = null;
      },
      error: err => {
        console.error(err);
        this.deletingReviewId = null;
      }
    });
  }

  // ===================== COMMENTS =====================
  addComment(review: ReviewResponse & any) {

    if (!review.newComment?.trim()) return;

    this.commentService.createComment(review.id, {
      content: review.newComment
    }).subscribe({
      next: (comment) => {

        review.comments = [comment, ...(review.comments || [])];

        review.commentsCount = (review.commentsCount || 0) + 1;

        review.newComment = '';
      },
      error: console.error
    });
  }

  loadComments(review: ReviewResponse & any) {

    this.commentService.getCommentsByReviewId(review.id)
      .subscribe({
        next: (comments) => {
          console.log("these r the comments", comments);
          
          review.comments = comments ?? [];
          review.showComments = true;
        },
        error: console.error
      });
  }

  toggleComments(review: ReviewResponse & any) {
    if (!review.showComments && (!review.comments || review.comments.length === 0)) {
      this.loadComments(review);
    } else {
      review.showComments = !review.showComments;
    }
  }

  // ===================== UI HELPERS =====================
  getSolidStars(rating: number) {
    return Array(Math.floor(rating));
  }

  getOutlineStars(rating: number) {
    return Array(5 - Math.floor(rating));
  }

  goBack() {
    this.location.back();
  }

  get reviewFormTitle() {
    return this.myReview ? 'Update Your Review' : 'Share Your Thoughts';
  }

  get reviewFormButtonLabel() {
    return this.myReview ? 'Update Review' : 'Submit Review';
  }

  getAccentColor(review: any): string {
    if (review.isMine) return '#378ADD';      
    if (review.rating >= 4) return '#1D9E75';
    if (review.rating <= 2) return '#D85A30'; 
    return '#888780';
  }

  //Reply logic 
  replyingToCommentId: number | null = null;
  replyText = '';

  startReply(comment: any) {
    this.replyingToCommentId = comment.id;
    this.replyText = '';
  }

  cancelReply() {
    this.replyingToCommentId = null;
    this.replyText = '';
  }

  sendReply(comment: any) {

    if (!this.replyText.trim()) return;

    const request = {
      content: this.replyText,
      reviewId: comment.reviewId
    };

    this.commentService.replyToComment(comment.id, request).subscribe({
      next: (newReply) => {

        // find review
        const review = this.reviews.find(r => r.id === comment.reviewId);

        if (!review) return;

        // init array if needed
        if (!review.comments) {
          review.comments = [];
        }

        // 👇 add new reply instantly (OPTIMISTIC UI)
        review.comments = [...review.comments, newReply];

        // update count
        review.commentsCount = (review.commentsCount || 0) + 1;

        // reset UI
        this.replyingToCommentId = null;
        this.replyText = '';
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  //End reply logic
}