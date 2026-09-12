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
      toast.error("يرجى كتابة اسمكِ الكريم");
      return;
    }
    if (!cleanBody) {
      toast.error(
        productId
          ? `يرجى كتابة رأيكِ وتجربتكِ مع ${productName || "المنتج"}`
          : "يرجى كتابة تجربتكِ مع المنتجات",
      );
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

      toast.success("شكراً لكِ! تم نشر تقييمكِ بنجاح 🌸✨");
      setName("");
      setBody("");
      setRating(5);
      setOpen(false);
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch {
      toast.error("حدث خطأ أثناء حفظ التقييم، يرجى المحاولة مرة أخرى.");
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
            className="gap-2 h-11 px-5 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary rounded-xl font-medium shadow-xs transition-all"
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>شاركينا تجربتكِ</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader className="text-start space-y-2">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{productName ? `تقييم ${productName}` : "شاركينا رأيكِ وتجربتكِ"}</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 leading-relaxed">
            {productName
              ? `رأيكِ الصادق في "${productName}" يساعد أخواتكِ العميلات في اختيار المنتج المناسب لعنايتهن اليومية.`
              : "رأيكِ الصادق يُسعدنا ويساعد عميلاتنا الجدد في اختيار الروتين الأنسب لبشرتهن."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Rating Stars Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-2">
              درجة رضاكِ عن {productName ? "المنتج" : "الخدمة"}
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
                    className="p-1 rounded-lg hover:scale-110 focus:outline-none transition-transform"
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
                {rating === 5 && "ممتاز جداً 🌟"}
                {rating === 4 && "جيد جداً 👍"}
                {rating === 3 && "جيد ✨"}
                {rating === 2 && "مقبول"}
                {rating === 1 && "يحتاج تحسين"}
              </span>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label
              htmlFor="review-name"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              اسمكِ الكريم أو اللقب
            </label>
            <Input
              id="review-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: سارة، أو مريم د."
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
              {productName ? `تفاصيل تجربتكِ مع ${productName}` : "تفاصيل تجربتكِ مع المنتجات"}
            </label>
            <Textarea
              id="review-body"
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                productName
                  ? `شاركينا كيف شعرتِ بعد استخدام ${productName}، ملمسه وتأثيره على بشرتكِ...`
                  : "شاركينا شعوركِ بعد استخدام المنتجات، تأثيرها على بشرتكِ، أو تجربتكِ مع خدمة التوصيل والدعم..."
              }
              className="rounded-xl text-sm leading-relaxed resize-none"
              maxLength={400}
            />
            <p className="text-xs text-muted-foreground mt-1 text-end">{body.length} / 400 حرف</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-11 px-4 rounded-xl text-slate-600"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 rounded-xl font-medium min-w-[120px]"
            >
              {isSubmitting ? "جاري النشر..." : "نشر التقييم"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
