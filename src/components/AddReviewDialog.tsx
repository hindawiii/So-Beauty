import { useState } from "react";
import { Star, MessageSquareHeart, Sparkles } from "lucide-react";
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
      });

      toast.success(t("addReviewDialog.successToast"));
      setName("");
      setBody("");
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

      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader className="text-start space-y-2">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>
              {productName
                ? t("addReviewDialog.titleProduct").replace("{product}", productName)
                : t("addReviewDialog.title")}
            </span>
            <Sparkles className="w-4 h-4 text-primary" />
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 leading-relaxed">
            {productName
              ? t("addReviewDialog.descProduct").replace("{product}", productName)
              : t("addReviewDialog.desc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Rating Stars Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-2">
              {t("addReviewDialog.satisfactionLabel")}
            </label>
            <div className="flex items-center gap-1.5 p-2 bg-muted/40 rounded-xl w-fit">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-lg hover:scale-110 focus:outline-none transition-transform cursor-pointer"
                    aria-label={`تقييم ${star} من 5`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-slate-300 fill-transparent"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-sm font-semibold text-slate-700 ms-3">
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
              className="block text-sm font-medium text-slate-800 mb-1.5"
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
              className="h-11 rounded-xl text-base"
              maxLength={50}
            />
          </div>

          {/* Review Body */}
          <div>
            <label
              htmlFor="review-body"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              {t("addReviewDialog.bodyLabel")}
            </label>
            <Textarea
              id="review-body"
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("addReviewDialog.bodyPlaceholder")}
              className="rounded-xl text-sm leading-relaxed resize-none"
              maxLength={400}
            />
            <p className="text-xs text-muted-foreground mt-1 text-end">
              {t("addReviewDialog.charCount")
                .replace("{current}", String(body.length))
                .replace("{max}", "400")}
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-11 px-4 rounded-xl text-slate-600 cursor-pointer"
            >
              {t("addReviewDialog.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 rounded-xl font-medium min-w-[120px] cursor-pointer"
            >
              {isSubmitting ? t("addReviewDialog.submitting") : t("addReviewDialog.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
