import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import {
  FileText,
  ShieldAlert,
  RotateCcw,
  Truck,
  CreditCard,
  Scale,
  CheckCircle2,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "الشروط والأحكام — سياسة الاستخدام والتعامل" },
      {
        name: "description",
        content:
          "الشروط والأحكام المنظمة لعمليات الشراء، الدفع عند الاستلام، الشحن، والاستبدال بمتجرنا المعتمد.",
      },
    ],
  }),
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
  const { settings } = useStoreSettings();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
          <span className="text-foreground font-medium">الشروط والأحكام</span>
        </div>

        {/* Header Title Section */}
        <div className="mb-10 text-center sm:text-start border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Scale className="w-4 h-4" />
            <span>اتفاقية الاستخدام والتعامل</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
            style={{ fontFamily: settings.fontDisplay || "var(--font-display)" }}
          >
            الشروط والأحكام وسياسة الشراء
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
            مرحباً بك في <strong>{settings.storeName}</strong>. تحكم هذه الوثيقة العلاقة التعاقدية
            بين المتجر والعميل الكريم عند إتمام أي طلب عبر منصتنا.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Section 1 */}
          <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">1. إنشاء الطلب والموافقة</h2>
            </div>
            <p>
              يعد إرسال الطلب عبر نموذج الشراء بمثابة تأكيد رغبة العميل في استلام المنتجات المحددة
              بالسعر المعروض. يقوم فريق خدمة العملاء بتأكيد بيانات الشحنة عبر رسائل الواتساب أو
              الاتصال الهاتفي قبل انطلاق مندوب التوصيل لضمان أعلى مستويات الدقة.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">2. الأسعار والدفع عند الاستلام (COD)</h2>
            </div>
            <p>نعتمد نظام الدفع الآمن عند الاستلام لتوفير أقصى درجات الثقة وراحة البال لعملائنا:</p>
            <ul className="space-y-2.5 ps-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>
                  كافة الأسعار المعروضة تشمل المنتج والضرائب المطبقة، وتظهر رسوم الشحن بوضوح في ملخص
                  الطلب قبل التأكيد.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>
                  يلتزم العميل بسداد قيمة الفاتورة نقداً أو عبر وسائل التحويل المعتمدة عند استلام
                  الشحنة من مندوب التوصيل.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">3. الشحن والتوصيل ومعاينة الشحنة</h2>
            </div>
            <p>نعمل بالتعاون مع أفضل مناديب وشركات الشحن لضمان سرعة وسلامة التوصيل:</p>
            <ul className="space-y-2.5 ps-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>
                  تتراوح مدة التوصيل المعتادة بين 24 إلى 72 ساعة عمل حسب المدينة والمنطقة الجغرافية.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>
                  <strong>حق المعاينة:</strong> يحق للعميل التأكد من سلامة الغلاف الخارجي وعدد القطع
                  عند الاستلام بحضور مندوب التوصيل.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">4. سياسة الاستبدال والاسترجاع</h2>
            </div>
            <p>
              رضاكم التام هو أولويتنا القصوى، ونضمن استبدال أو استرجاع المنتج في الحالات التالية:
            </p>
            <ul className="space-y-2.5 ps-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>
                  إذا وصل المنتج تالفاً أثناء الشحن أو به عيب مصنعي مثبت، يتم استبداله مجاناً وبدون
                  أي رسوم إضافية.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>إذا استلم العميل منتجاً يختلف عن الذي تم طلبه في الفاتورة الرسمية.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>
                  لأسباب صحية متعلقة بمنتجات العناية الشخصية، يشترط أن يكون المنتج غير مستخدم
                  وبغلافه الأصلي المحكم.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 5: Support */}
          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              5. خدمة العملاء والدعم
            </h2>
            <p>
              إذا كان لديكم أي ملاحظة، شكوى، أو استفسار حول طلبكم، يسعدنا تواصلكم المباشر معنا
              فوراً:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm font-medium" dir="ltr">
                  {settings.supportPhone || "+249 900 776 688"}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm font-medium" dir="ltr">
                  {settings.supportEmail || "support@store.com"}
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
