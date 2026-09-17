import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useStoreSettings } from "@/context/StoreSettingsContext";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Truck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية وأمان البيانات — حماية معلوماتك" },
      {
        name: "description",
        content:
          "نلتزم بحماية خصوصية بياناتك الشخصية ومعلومات الشحن والتوصيل وفق أعلى معايير الأمان والسرية.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
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
          <span className="text-foreground font-medium">سياسة الخصوصية</span>
        </div>

        {/* Header Title Section */}
        <div className="mb-10 text-center sm:text-start border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>حماية البيانات والخصوصية</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
            style={{ fontFamily: settings.fontDisplay || "var(--font-display)" }}
          >
            سياسة الخصوصية وسرية المعلومات
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
            آخر تحديث: {new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long" })}
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
              <h2 className="text-lg sm:text-xl font-bold">1. التزامنا بحماية خصوصيتك</h2>
            </div>
            <p>
              نقدر في <strong>{settings.storeName}</strong> مخاوفكم واهتمامكم بشأن خصوصية بياناتكم
              على شبكة الإنترنت. تم إعداد هذه السياسة لمساعدتكم في فهم طبيعة البيانات التي نجمعها
              منكم وكيفية تعاملنا معها، ونؤكد لكم التزامنا التام بعدم بيع أو تأجير أي من بياناتكم
              الشخصية لأي طرف ثالث لأغراض تسويقية غير مصرح بها.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">2. البيانات التي نقوم بجمعها</h2>
            </div>
            <p>عند استخدامكم لمتجرنا أو إتمام طلب شراء، قد نطلب منكم تزويدنا بالمعلومات التالية:</p>
            <ul className="space-y-2.5 ps-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>
                  <strong>بيانات التواصل الشخصية:</strong> الاسم الكامل، رقم الهاتف الجوال، والبريد
                  الإلكتروني (إن وجد).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>
                  <strong>بيانات الشحن والتوصيل:</strong> اسم المدينة، العنوان التفصيلي، والحي،
                  لتسهيل وصول مندوب الشحن بدقة.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>
                  <strong>سجل الطلبات:</strong> المنتجات والكميات المشتراة، وتاريخ الطلب وحالته
                  التشغيلية لمتابعة الضمان وخدمة ما بعد البيع.
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
              <h2 className="text-lg sm:text-xl font-bold">3. كيفية استخدام ومشاركة البيانات</h2>
            </div>
            <p>
              نستخدم البيانات المجمعة لأغراض محددة ومباشرة تضمن حصولكم على أفضل تجربة شراء وخدمة:
            </p>
            <ul className="space-y-2.5 ps-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>تجهيز وإرسال الطلبات والتواصل معكم لتأكيد مواعيد التسليم.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>
                  مشاركة اسم المستلم ورقم هاتفه وعنوانه فقط مع مناديب الشحن أو شركات النقل الرسمية
                  المتعاقد معها لتسليم الشحنة.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span>
                  تقديم خدمة العملاء، والدعم الفني، ومعالجة أي استفسارات أو طلبات استبدال.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">4. أمان وسرية البيانات</h2>
            </div>
            <p>
              نطبق إجراءات تقنية وإدارية متطورة لتأمين بياناتكم ضد الوصول غير المصرح به أو الفقدان
              أو التعديل. يتم تشفير كافة الاتصالات والبيانات عبر بروتوكولات الأمان القياسية
              (SSL/TLS)، كما نضمن وصول الموظفين المصرح لهم فقط للبيانات المرتبطة مباشرة بتنفيذ
              طلباتكم.
            </p>
          </section>

          {/* Section 5: Contact for inquiries */}
          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              5. الاستفسارات وحقوق العميل
            </h2>
            <p>
              يحق لكم في أي وقت الاستفسار عن بياناتكم المسجلة أو طلب تحديثها، كما يسعدنا الإجابة على
              أي استفسار بخصوص سياسة الخصوصية عبر قنوات التواصل المعتمدة:
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
