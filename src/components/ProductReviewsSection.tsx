import { useState, useEffect, useCallback, useRef } from "react";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquareHeart,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
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
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});

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

  // Reviews sorted by newest
  const displayedReviews = [...reviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const handleHelpful = (reviewId: string) => {
    if (votedHelpful[reviewId]) return;
    setVotedHelpful((prev) => ({ ...prev, [reviewId]: true }));
    setHelpfulCounts((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isRTL = language === "ar";

  const scrollByDirection = (dir: "prev" | "next") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const amount = 320;
    const delta = dir === "next" ? (isRTL ? -amount : amount) : isRTL ? amount : -amount;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section id="product-reviews" className="pt-6 sm:pt-8 pb-3 border-t border-slate-200/80">
      {/* Clean & Balanced Section Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {title ||
              (productName
                ? t("reviews.title").replace("{product}", productName)
                : t("home.reviewsTitle"))}
          </h2>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>5.0</span>
          </div>
        </div>

        <AddReviewDialog
          productId={productId}
          productName={productName}
          onReviewAdded={loadReviews}
          triggerButton={
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3.5 rounded-xl text-xs font-semibold gap-1.5 border-primary/20 hover:bg-primary/5 text-primary shadow-2xs cursor-pointer shrink-0"
            >
              <MessageSquareHeart className="w-3.5 h-3.5" />
              <span>{t("reviews.addReviewBtn")}</span>
            </Button>
          }
        />
      </div>

      {/* Horizontal Swipeable Reviews Cards Strip */}
      {displayedReviews.length === 0 && !loading ? (
        <div className="bg-muted/30 border border-slate-200/80 rounded-2xl p-6 text-center max-w-md mx-auto my-3">
          <MessageSquareHeart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-xs font-bold text-slate-800 mb-1">{t("reviews.noReviews")}</h3>
          <p className="text-[11px] text-slate-500 mb-3">
            {t("reviews.firstToReview").replace("{product}", productName || "")}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setFilterRating(null);
              setFilterSkinType(null);
            }}
            className="h-8 px-3 rounded-xl text-xs cursor-pointer"
          >
            {t("reviews.resetFilter")}
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory no-scrollbar scroll-smooth"
          >
            {displayedReviews.map((rev) => {
              const {
                name: reviewerName,
                body: reviewerBody,
                skinType: reviewerSkinType,
              } = getLocalizedReview(rev, language);

              return (
                <div
                  key={rev.id}
                  className="w-[82vw] sm:w-[320px] md:w-[350px] shrink-0 snap-start bg-card border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm"
                >
                  <div>
                    {/* Reviewer Header */}
                    <div className="flex items-center justify-between gap-2.5 mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {reviewerName.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[130px]">
                              {reviewerName}
                            </span>
                            {rev.is_verified && (
                              <span
                                className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-semibold border border-emerald-200/70 shrink-0"
                                title="Verified buyer"
                              >
                                <BadgeCheck className="w-3 h-3 text-emerald-600" />
                                <span>{t("reviews.verifiedBuyer")}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span suppressHydrationWarning>
                              {new Date(rev.created_at).toLocaleDateString(
                                language === "ar" ? "ar-EG" : "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                            {reviewerSkinType && (
                              <>
                                <span>•</span>
                                <span className="text-primary/90 font-medium bg-primary/5 px-1.5 py-0.2 rounded">
                                  {reviewerSkinType}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 fill-slate-100 dark:text-slate-700 dark:fill-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Body */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-3">
                      "{reviewerBody}"
                    </p>
                  </div>

                  {/* Helpful & Recommendation footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{t("reviews.recommendTag")}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleHelpful(rev.id)}
                      disabled={votedHelpful[rev.id]}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] transition-colors cursor-pointer ${
                        votedHelpful[rev.id]
                          ? "bg-emerald-50 text-emerald-700 font-semibold cursor-default"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <ThumbsUp className="w-2.5 h-2.5" />
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

          {/* Bottom Navigation Chevrons & Swipe Hint */}
          {displayedReviews.length > 1 && (
            <div className="flex items-center justify-between pt-3 px-1 text-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {language === "ar"
                  ? "← اسحبي لتصفح باقي التجارب →"
                  : "← Swipe to browse more reviews →"}
              </span>

              {/* Prev / Next Bottom Chevrons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollByDirection("prev")}
                  className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Previous reviews"
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-0 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByDirection("next")}
                  className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Next reviews"
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-0 rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
