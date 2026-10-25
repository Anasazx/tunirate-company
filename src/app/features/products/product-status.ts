import { ProductStatus } from '../../core/api/models';

// How product statuses are worded for companies
export const STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'In review',
  PUBLISHED: 'Live',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
};

export const STATUS_EXPLANATIONS: Record<ProductStatus, string> = {
  DRAFT: 'Only your team can see this draft. Submit it when it is ready and ReviewHood will review it.',
  PENDING_REVIEW: 'ReviewHood is reviewing this product. It goes live once it is approved.',
  PUBLISHED: 'This product is live: customers can find it and review it.',
  REJECTED: 'ReviewHood did not approve this product. Fix the details and submit it again.',
  ARCHIVED: 'This product is hidden from customers. Contact ReviewHood to restore it.',
};
