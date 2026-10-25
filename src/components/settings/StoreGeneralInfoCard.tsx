import React from "react";
import { Store, Phone, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StoreBrandingSettings } from "@/context/StoreSettingsContext";

interface StoreGeneralInfoCardProps {
  formData: StoreBrandingSettings;
  onChange: <K extends keyof StoreBrandingSettings>(
    key: K,
    value: StoreBrandingSettings[K],
  ) => void;
}

export function StoreGeneralInfoCard({ formData, onChange }: StoreGeneralInfoCardProps) {
  return (
    <div className="space-y-6">
      {/* 1. Identity & Name */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Store className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm text-slate-900">1. هوية المتجر والاسم والشعار الرسمي</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              اسم المتجر بالعربية <span className="text-rose-500">*</span>
            </label>
            <Input
              value={formData.storeName}
              onChange={(e) => onChange("storeName", e.target.value)}
              placeholder="سو بيوتي — So Beauty"
              className="h-10 text-xs sm:text-sm rounded-xl font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              اسم المتجر بالإنجليزية (English)
            </label>
            <Input
              value={formData.storeName_en || ""}
              onChange={(e) => onChange("storeName_en", e.target.value)}
              placeholder="So Beauty"
              className="h-10 text-xs sm:text-sm rounded-xl font-sans"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              الجملة الترويجية القصيرة (Tagline بالعربية)
            </label>
            <Input
              value={formData.tagline}
              onChange={(e) => onChange("tagline", e.target.value)}
              placeholder="نقاء الطبيعة، وفخامة العناية"
              className="h-10 text-xs sm:text-sm rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Tagline in English</label>
            <Input
              value={formData.tagline_en || ""}
              onChange={(e) => onChange("tagline_en", e.target.value)}
              placeholder="Botanical Care"
              className="h-10 text-xs sm:text-sm rounded-xl font-sans"
              dir="ltr"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              رابط شعار المتجر (Logo Image URL)
            </label>
            <div className="flex gap-2.5">
              <Input
                value={formData.logoUrl}
                onChange={(e) => onChange("logoUrl", e.target.value)}
                placeholder="https://... أو اتركيه فارغاً للاعتماد على اللوجو المطبعي"
                className="h-10 text-xs rounded-xl font-mono flex-1"
                dir="ltr"
              />
              {formData.logoUrl && (
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-white p-1">
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              وصف المتجر (لتحسين محركات البحث وسيو المشاركة)
            </label>
            <Textarea
              value={formData.storeDescription}
              onChange={(e) => onChange("storeDescription", e.target.value)}
              placeholder="متجر سوداني متخصص في العناية الطبيعية بالبشرة..."
              rows={2}
              className="text-xs rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact & Social Channels */}
      <div className="bg-card border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Phone className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">
            2. قنوات التواصل وخدمة العملاء وواتساب
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              رقم واتساب الرسمي للطلبات (بالمفتاح الدولي)
            </label>
            <Input
              value={formData.whatsappNumber}
              onChange={(e) => onChange("whatsappNumber", e.target.value)}
              placeholder="249912345678"
              className="h-10 text-xs font-mono rounded-xl"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              رقم الهاتف المباشر للاتصال
            </label>
            <Input
              value={formData.contactPhone}
              onChange={(e) => onChange("contactPhone", e.target.value)}
              placeholder="0912345678"
              className="h-10 text-xs font-mono rounded-xl"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              البريد الإلكتروني للدعم الفني
            </label>
            <Input
              type="email"
              value={formData.supportEmail}
              onChange={(e) => onChange("supportEmail", e.target.value)}
              placeholder="support@sobeauty.sd"
              className="h-10 text-xs font-mono rounded-xl"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">العنوان ومقر المستودع</label>
            <Input
              value={formData.storeAddress}
              onChange={(e) => onChange("storeAddress", e.target.value)}
              placeholder="الخرطوم / أم درمان — شارع الوادي"
              className="h-10 text-xs rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
