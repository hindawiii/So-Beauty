import { useState, useEffect, useCallback } from "react";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquareHeart,
  Sparkles,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { Review, getProductReviews } from "@/lib/reviews";
import { AddReviewDialog } from "@/components/AddReviewDialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

export function ProductReviewsSection({ productId, productName }: ProductReviewsSectionProps) {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "highest">("newest");
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProductReviews(productId, productName);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load product reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [productId, productName]);

  useEffect(() => {
    loadReviews();

    const handleNewReview = (e: Event) => {
      const customEvent = e as CustomEvent<Review>;
      if (customEvent.detail?.product_id === productId) {
        setReviews((prev) => [customEvent.detail, ...prev]);
      }
    };

    window.addEventListener("so_beauty_review_added", handleNewReview);
    return () => window.removeEventListener("so_beauty_review_added", handleNewReview);
  }, [loadReviews, productId]);

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
            {t("reviews.title").replace("{product}", productName)}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t("reviews.subtitle")}</p>
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

      {/* Ratings Overview Card */}
      <div className="bg-card border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Big Score Block */}
          <div className="md:col-span-4 text-center md:border-e md:border-slate-200/80 md:pe-6">
            <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
              {averageRating}
              <span className="text-lg font-normal text-slate-400"> / 5</span>
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(Number(averageRating))
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200 fill-slate-100"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {t("reviews.basedOn").replace("{count}", String(totalCount))}
            </p>
          </div>

          {/* Breakdown Progress Bars */}
          <div className="md:col-span-8 space-y-2">
            {starBreakdown.map((item) => (
              <button
                key={item.stars}
                type="button"
                onClick={() => setFilterRating(filterRating === item.stars ? null : item.stars)}
                className={`w-full flex items-center gap-3 text-xs group p-1 rounded-lg transition-colors cursor-pointer ${
                  filterRating === item.stars ? "bg-primary/5 font-bold" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1 w-14 shrink-0 text-slate-700">
                  <span>{item.stars}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <div className="w-12 text-end text-slate-400 group-hover:text-slate-700 transition-colors">
                  {item.percentage}%
                </div>
              </button>
            ))}
          </div>
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

      {/* Reviews List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">{t("reviews.loadingReviews")}</p>
        </div>
      ) : displayedReviews.length === 0 ? (
        <div className="bg-muted/30 border border-slate-200/80 rounded-3xl p-8 text-center max-w-md mx-auto my-6">
          <MessageSquareHeart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">{t("reviews.noReviews")}</h3>
          <p className="text-xs text-slate-500 mb-4">
            {t("reviews.firstToReview").replace("{product}", productName)}
          </p>
          <Button
            variant="outline"
            onClick={() => setFilterRating(null)}
            className="h-9 px-4 rounded-xl text-xs cursor-pointer"
          >
            {t("reviews.resetFilter")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-card border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm"
            >
              <div>
                {/* Reviewer Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                      {rev.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {rev.name}
                        </span>
                        {rev.is_verified && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200"
                            title="Verified buyer"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{t("reviews.verifiedBuyer")}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString(
                          language === "ar" ? "ar-EG" : "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
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
                  "{rev.body}"
                </p>
              </div>

              {/* Helpful footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px]">
                  {t("reviews.trustedExperience").replace("{product}", productName)}
                </span>
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
          ))}
        </div>
      )}
    </section>
  );
}
