"use client";

import { useState } from "react";
import { Star, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { submitReview } from "@/actions/store/review.actions";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: {
    name: string;
    image: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  avgRating: number;
}

export function ProductReviews({ productId, reviews, avgRating }: ProductReviewsProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Check if user has already reviewed
  const userReview = user ? reviews.find((r) => r.user.name === user.name) : null;

  const handleEdit = () => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment || "");
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setRating(0);
    setComment("");
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitReview(productId, rating, comment);
      if (result.success) {
        toast.success(isEditing ? "Review updated successfully" : "Review submitted successfully");
        setComment("");
        setRating(0);
        setIsEditing(false);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to save review");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive = false, onClick?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= (interactive ? hoveredRating || count : count)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
              } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && onClick?.(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
          />
        ))}
      </div>
    );
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="mt-16 border-t pt-12">
      {/* Section Header */}
      <div className="mb-12">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
          Reviews
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">Customer Reviews</h2>
      </div>

      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-xl p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Overall Rating */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl font-bold text-gray-900 mb-3">{avgRating.toFixed(1)}</div>
            {renderStars(Math.round(avgRating))}
            <p className="text-gray-600 mt-3">Based on {reviews.length} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-3">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 w-20">
                  <span className="text-sm font-medium text-gray-700">{star}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-400 h-2.5 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write/Edit Review Form */}
      {user && (!userReview || isEditing) ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEditing ? "Edit Your Review" : "Write a Review"}
            </h3>
            {isEditing && (
              <Button variant="outline" onClick={handleCancelEdit} size="sm">
                Cancel
              </Button>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Rating <span className="text-red-500">*</span>
              </label>
              {renderStars(rating, true, setRating)}
              {rating === 0 && (
                <p className="text-sm text-gray-500 mt-2">Click on a star to rate</p>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Review <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={5}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update Review" : "Submit Review"}
            </Button>
          </form>
        </div>
      ) : !user ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 mb-12 text-center">
          <p className="text-gray-700">
            Please{" "}
            <a href="/login" className="text-gray-900 hover:underline font-semibold">
              login
            </a>{" "}
            to write a review
          </p>
        </div>
      ) : null}

      {/* Reviews List */}
      <div className="space-y-8">
        {reviews.length > 0 ? (
          reviews.map((review) => {
            const isUserReview = user && review.user.name === user.name;
            return (
              <div
                key={review.id}
                className={`border-b border-gray-200 pb-8 last:border-0 ${isUserReview ? "bg-blue-50 -mx-6 px-6 py-6 rounded-xl" : ""
                  }`}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={review.user.image || undefined} />
                    <AvatarFallback className="bg-gray-900 text-white">
                      {review.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">
                          {review.user.name}
                          {isUserReview && (
                            <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                              Your Review
                            </span>
                          )}
                        </h4>
                        {renderStars(review.rating)}
                      </div>
                      {isUserReview && !isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEdit}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-gray-600 text-lg">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
}
