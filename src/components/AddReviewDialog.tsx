import { useState } from "react";
import { Star, MessageSquareHeart, Sparkles, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addReview } from "@/lib/reviews";
import { useLanguage } from "@/context/LanguageContext";

interface AddReviewDialogProps {
  onReviewAdded?: () => void;
  productId?: string;
  productName?: string;
  triggerButton?: React.ReactNode;
}

export function AddReviewDialog({
  onReviewAdded,
  productId,
  productName,
  triggerButton,
}: AddReviewDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [skinType, setSkinType] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanBody = body.trim();

    if (!cleanName) {
      toast.error(t("addReviewDialog.nameRequired"));
      return;
    }
    if (!cleanBody) {
      toast.error(t("addReviewDialog.bodyRequired"));
      return;
    }

    try {
      setIsSubmitting(true);
      await addReview({
        name: cleanName,
        rating,
        body: cleanBody,
        product_id: productId,
        product_name: productName,
        skin_type: skinType || undefined,
        would_recommend: wouldRecommend,
      });

      toast.success(t("addReviewDialog.successToast"));
      setName("");
      setBody("");
      setSkinType("");
      setWouldRecommend(true);
      setRating(5);
      setOpen(false);
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch {
      toast.error(t("addReviewDialog.errorToast"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton ? (
          triggerButton
        ) : (
          <Button
            variant="outline"
            className="gap-2 h-11 px-5 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary rounded-xl font-medium shadow-xs transition-all cursor-pointer"
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>{t("addReviewDialog.title")}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-lg rounded-2xl p-4 sm:p-6 max-h-[86vh] overflow-y-auto overscroll-contain">
        <DialogHeader className="text-start space-y-1 sm:space-y-1.5">
          <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>
              {productName
                ? t("addReviewDialog.titleProduct").replace("{product}", productName)
                : t("addReviewDialog.title")}
            </span>
            <Sparkles className="w-4 h-4 text-primary" />
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {productName
              ? t("addReviewDialog.descProduct").replace("{product}", productName)
              : t("addReviewDialog.desc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-1 sm:mt-2">
          {/* Rating Stars Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-800 mb-1">
              {t("addReviewDialog.satisfactionLabel")}
            </label>
            <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 bg-muted/40 rounded-xl w-fit">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 sm:p-1 rounded-md hover:scale-110 focus:outline-none transition-transform cursor-pointer"
                    aria-label={`تقييم ${star} من 5`}
                  >
                    <Star
                      className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-slate-300 fill-transparent"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs sm:text-sm font-semibold text-slate-700 ms-2 sm:ms-3">
                {rating === 5 && t("addReviewDialog.star5")}
                {rating === 4 && t("addReviewDialog.star4")}
                {rating === 3 && t("addReviewDialog.star3")}
                {rating === 2 && t("addReviewDialog.star2")}
                {rating === 1 && t("addReviewDialog.star1")}
              </span>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label
              htmlFor="review-name"
              className="block text-xs sm:text-sm font-medium text-slate-800 mb-1"
            >
              {t("addReviewDialog.nameLabel")}
            </label>
            <Input
              id="review-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("addReviewDialog.namePlaceholder")}
              className="h-10 rounded-xl text-sm"
              maxLength={50}
            />
          </div>

          {/* Skin Type Selection (Optional for Beauty Personalization) */}
          <div>
            <label
              htmlFor="review-skintype"
              className="block text-xs sm:text-sm font-medium text-slate-800 mb-1"
            >
              {t("addReviewDialog.skinTypeOptional")}
            </label>
            <select
              id="review-skintype"
              value={skinType}
              onChange={(e) => setSkinType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="">{t("addReviewDialog.skinTypeSelectPlaceholder")}</option>
              <option value="بشرة جافة / عادية">{t("addReviewDialog.skinTypeDry")}</option>
              <option value="بشرة مختلطة">{t("addReviewDialog.skinTypeCombo")}</option>
              <option value="بشرة دهنية">{t("addReviewDialog.skinTypeOily")}</option>
              <option value="بشرة حساسة">{t("addReviewDialog.skinTypeSensitive")}</option>
            </select>
          </div>

          {/* Would Recommend Checkbox */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-primary/5 border border-primary/20">
            <input
              type="checkbox"
              id="review-recommend"
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
              className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary cursor-pointer accent-primary"
            />
            <label
              htmlFor="review-recommend"
              className="text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>{t("addReviewDialog.recommendYes")}</span>
            </label>
          </div>

          {/* Review Body */}
          <div>
            <label
              htmlFor="review-body"
              className="block text-xs sm:text-sm font-medium text-slate-800 mb-1"
            >
              {t("addReviewDialog.bodyLabel")}
            </label>
            <Textarea
              id="review-body"
              required
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("addReviewDialog.bodyPlaceholder")}
              className="rounded-xl text-sm leading-relaxed resize-none p-2.5 sm:p-3"
              maxLength={400}
            />
            <p className="text-xs text-muted-foreground mt-1 text-end">
              {t("addReviewDialog.charCount")
                .replace("{current}", String(body.length))
                .replace("{max}", "400")}
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1.5 sm:pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-10 px-4 rounded-xl text-xs sm:text-sm text-slate-600 cursor-pointer"
            >
              {t("addReviewDialog.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl font-medium text-xs sm:text-sm min-w-[110px] cursor-pointer"
            >
              {isSubmitting ? t("addReviewDialog.submitting") : t("addReviewDialog.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
