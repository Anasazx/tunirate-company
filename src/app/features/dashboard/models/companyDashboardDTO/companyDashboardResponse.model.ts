import {MinimizedReviewResponse} from '../../../reviews/models/reviewDTO/minimizedReviewResponse.model';

export interface CompanyDashboardResponse {
    totalProducts: number;
    totalReviews: number;
    averageRating: number;
    totalTeamMembers: number;
    recentReviews: MinimizedReviewResponse[];
}
