export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ReviewSortOption = "newest" | "oldest" | "highest" | "lowest";

export interface IReviewUser {
  _id: string;
  name: string;
  picture?: string;
}

export interface IReview {
  _id: string;
  user: IReviewUser;
  workshop: string;
  rating: number;
  title: string;
  content: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewInput {
  workshop: string;
  rating: number;
  title: string;
  content: string;
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  content?: string;
}
