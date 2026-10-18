import { useState, useEffect, useCallback } from "react";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquareHeart,
  Sparkles,
  ArrowUpDown,
  Filter,
  BadgeCheck,
  HeartHandshake,
} from "lucide-react";
import { Review, getProductReviews, getLocalizedReview, INITIAL_REVIEWS } from "@/lib/reviews";
import { AddReviewDialog } from "@/components/AddReviewDialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface ProductReviewsSectionProps {
  productId?: string;
  productName?: string;
  title?: string;
  subtitle?: string;
}

export function ProductReviewsSection({
  productId,
  productName,
  title,
  subtitle,
}: ProductReviewsSectionProps) {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [loading, setLoading] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterSkinType, setFilterSkinType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "highest">("newest");
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});
  const [showAllReviews, setShowAllReviews] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      if (productId) {
        const data = await getProductReviews(productId, productName);
        setReviews(data);
      } else {
        const data = await getProductReviews();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to load product reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [productId, productName]);

  useEffect(() => {
    loadReviews();

    const handleReviewsChanged = () => {
      loadReviews();
    };

    window.addEventListener("so_beauty_review_added", handleReviewsChanged);
    window.addEventListener("so_beauty_review_updated", handleReviewsChanged);
    window.addEventListener("so_beauty_review_deleted", handleReviewsChanged);
    window.addEventListener("so_beauty_seed_reviews_toggled", handleReviewsChanged);

    return () => {
      window.removeEventListener("so_beauty_review_added", handleReviewsChanged);
      window.removeEventListener("so_beauty_review_updated", handleReviewsChanged);
      window.removeEventListener("so_beauty_review_deleted", handleReviewsChanged);
      window.removeEventListener("so_beauty_seed_reviews_toggled", handleReviewsChanged);
    };
  }, [loadReviews]);

  // Calculations for summary stats
  const totalCount = reviews.length;
  const averageRating =
    totalCount > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1)
      : "5.0";

  const starBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { stars, count, percentage };
  });

  // Filter & Sort
  const displayedReviews = reviews
    .filter((r) => (filterRating ? Math.round(r.rating) === filterRating : true))
    .filter((r) => (filterSkinType ? r.skin_type === filterSkinType : true))
    .sort((a, b) => {
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleHelpful = (reviewId: string) => {
    if (votedHelpful[reviewId]) return;
    setVotedHelpful((prev) => ({ ...prev, [reviewId]: true }));
    setHelpfulCounts((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
  };

  return (
    <section id="product-reviews" className="pt-10 pb-4 border-t border-slate-200/80">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("reviews.tag")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {title ||
              (productName
                ? t("reviews.title").replace("{product}", productName)
                : t("home.reviewsTitle"))}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {subtitle || (productName ? t("reviews.subtitle") : t("home.reviewsSubtitle"))}
          </p>
        </div>

        <AddReviewDialog
          productId={productId}
          productName={productName}
          onReviewAdded={loadReviews}
          triggerButton={
            <Button className="h-11 px-5 rounded-xl font-semibold gap-2 shadow-xs shrink-0 cursor-pointer">
              <MessageSquareHeart className="w-4 h-4" />
              <span>{t("reviews.addReviewBtn")}</span>
            </Button>
          }
        />
      </div>

      {/* Compact Luxe Rating Summary Strip (Ultra-sleek, zero wasted space) */}
      <div className="bg-muted/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-xl border border-border/60 shadow-2xs">
            <span
              suppressHydrationWarning
              className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100"
            >
              {averageRating}
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(Number(averageRating))
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200 fill-slate-100"
                  }`}
                />
              ))}
            </div>
          </div>
          <span
            suppressHydrationWarning
            className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            {t("reviews.basedOn").replace("{count}", String(totalCount))}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 text-xs font-semibold">
          <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{t("reviews.recommendationRate")}</span>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Rating filters chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            {t("reviews.filter")}
          </span>
          <button
            type="button"
            onClick={() => setFilterRating(null)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              filterRating === null
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {t("reviews.all")} ({totalCount})
          </button>
          {[5, 4, 3].map((stars) => {
            const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
            if (count === 0 && filterRating !== stars) return null;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  filterRating === stars
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span>
                  {stars} {t("reviews.stars")}
                </span>
                <span className="text-[11px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => setSortBy(sortBy === "newest" ? "highest" : "newest")}
            className="text-slate-700 hover:text-primary font-semibold transition-colors cursor-pointer"
          >
            {t("reviews.sortBy")} {sortBy === "newest" ? t("reviews.newest") : t("reviews.highest")}
          </button>
        </div>
      </div>

      {/* Reviews List (Immediate Zero-Latency Rendering) */}
      {displayedReviews.length === 0 && !loading ? (
        <div className="bg-muted/30 border border-slate-200/80 rounded-3xl p-8 text-center max-w-md mx-auto my-6">
          <MessageSquareHeart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">{t("reviews.noReviews")}</h3>
          <p className="text-xs text-slate-500 mb-4">
            {t("reviews.firstToReview").replace("{product}", productName || "")}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setFilterRating(null);
              setFilterSkinType(null);
            }}
            className="h-9 px-4 rounded-xl text-xs cursor-pointer"
          >
            {t("reviews.resetFilter")}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(showAllReviews ? displayedReviews : displayedReviews.slice(0, 2)).map((rev) => {
              const {
                name: reviewerName,
                body: reviewerBody,
                skinType: reviewerSkinType,
              } = getLocalizedReview(rev, language);

              return (
                <div
                  key={rev.id}
                  className="bg-card border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm"
                >
                  <div>
                    {/* Reviewer Header */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                          {reviewerName.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {reviewerName}
                            </span>
                            {rev.is_verified && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200"
                                title="Verified buyer"
                              >
                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{t("reviews.verifiedBuyer")}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span suppressHydrationWarning>
                              {new Date(rev.created_at).toLocaleDateString(
                                language === "ar" ? "ar-EG" : "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </span>
                            {reviewerSkinType && (
                              <>
                                <span>•</span>
                                <span className="text-primary/90 font-medium bg-primary/5 px-2 py-0.5 rounded-md">
                                  {reviewerSkinType}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 fill-slate-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Body */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      "{reviewerBody}"
                    </p>
                  </div>

                  {/* Helpful & Recommendation footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{t("reviews.recommendTag")}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleHelpful(rev.id)}
                      disabled={votedHelpful[rev.id]}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                        votedHelpful[rev.id]
                          ? "bg-emerald-50 text-emerald-700 font-semibold cursor-default"
                          : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>
                        {votedHelpful[rev.id]
                          ? t("reviews.helpful")
                          : helpfulCounts[rev.id]
                            ? `${t("reviews.helpful")} (${helpfulCounts[rev.id]})`
                            : t("reviews.helpful")}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {displayedReviews.length > 2 && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setShowAllReviews((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary/5 transition-colors cursor-pointer border border-primary/25"
              >
                <span>
                  {showAllReviews
                    ? language === "ar"
                      ? "عرض أقل ▲"
                      : "Show less ▲"
                    : language === "ar"
                      ? `عرض جميع الآراء (${displayedReviews.length}) ▼`
                      : `View all ${displayedReviews.length} reviews ▼`}
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
