export const STORE_WHATSAPP_NUMBER = "249900776688"; // +249 900 776 688

/**
 * Normalizes phone numbers for WhatsApp URL (removes spaces, symbols, leading zeroes when international)
 */
export function formatPhoneNumberForWhatsApp(phone: string, defaultPrefix = "249"): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (!digits) return "";
  // If already starts with full country code (e.g. 249 or 971 or 20)
  if (
    digits.length >= 11 &&
    (digits.startsWith("249") ||
      digits.startsWith("971") ||
      digits.startsWith("20") ||
      digits.startsWith("966"))
  ) {
    return digits;
  }
  // If starts with 0 (e.g. 0912345678 or 0101234567)
  if (digits.startsWith("0")) {
    return `${defaultPrefix}${digits.slice(1)}`;
  }
  return `${defaultPrefix}${digits}`;
}

/**
 * Generates direct WhatsApp click-to-chat URL with prefilled text to store
 */
export function getWhatsAppChatUrl(customMessage?: string, storePhone?: string): string {
  const targetNumber = storePhone
    ? formatPhoneNumberForWhatsApp(storePhone)
    : STORE_WHATSAPP_NUMBER;
  const defaultMsg =
    "مرحباً سو بيوتي 🌸، أود الاستفسار بخصوص منتجات العناية الطبيعية وتفاصيل التوصيل.";
  const text = encodeURIComponent(customMessage?.trim() || defaultMsg);
  return `https://wa.me/${targetNumber || STORE_WHATSAPP_NUMBER}?text=${text}`;
}

/**
 * Generates direct WhatsApp URL to message a specific customer from Admin dashboard
 */
export function getCustomerWhatsAppUrl(
  customerPhone: string,
  message: string,
  defaultCountryCode = "249",
): string {
  const cleanPhone = formatPhoneNumberForWhatsApp(customerPhone, defaultCountryCode);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message.trim())}`;
}

/**
 * Generates a richly formatted Order Notification message for Store Admin & Customer
 */
export function formatOrderWhatsAppSummary(order: {
  orderId: string;
  fullName: string;
  phone: string;
  city: string;
  shippingAddress: string;
  items: Array<{ name: string; quantity: number; price?: number }>;
  total: number | string;
  notes?: string | null;
  storeName?: string;
}): string {
  const shortId = order.orderId.slice(0, 8).toUpperCase();
  const itemsText = order.items
    .map(
      (it, idx) =>
        `  ${idx + 1}. ${it.name} × ${it.quantity}${it.price ? ` (${(it.price * it.quantity).toFixed(0)} ج.م)` : ""}`,
    )
    .join("\n");

  return [
    `🛍️ *طلب جديد عبر المتجر الإلكتروني — ${order.storeName || "سو بيوتي"}*`,
    `━━━━━━━━━━━━━━━`,
    `📋 *رقم الطلب:* #${shortId}`,
    `👤 *اسم العميل:* ${order.fullName}`,
    `📞 *رقم الهاتف:* ${order.phone}`,
    `📍 *المدينة:* ${order.city}`,
    `🏠 *العنوان:* ${order.shippingAddress}`,
    order.notes ? `📝 *ملاحظات العميل:* ${order.notes}` : "",
    `━━━━━━━━━━━━━━━`,
    `📦 *المنتجات المطلوبة:*`,
    itemsText,
    `━━━━━━━━━━━━━━━`,
    `💰 *الإجمالي المطلوب تحصيله:* ${order.total} ج.م`,
    `💵 *طريقة الدفع:* الدفع عند الاستلام (COD)`,
    `━━━━━━━━━━━━━━━`,
    `⚡ يُرجى تأكيد الطلب والبدء في إجراءات التجهيز والشحن.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Generates direct WhatsApp URL for ordering a specific product instantly
 */
export function getWhatsAppProductOrderUrl(
  productName: string,
  price: number,
  productId?: string,
  storePhone?: string,
): string {
  const targetNumber = storePhone
    ? formatPhoneNumberForWhatsApp(storePhone)
    : STORE_WHATSAPP_NUMBER;
  const message = `مرحباً سو بيوتي 🌸، أرغب في طلب هذا المنتج:\n- اسم المنتج: ${productName}\n- السعر: ${price} ج.م${
    productId ? `\n- الرابط: ${typeof window !== "undefined" ? window.location.href : ""}` : ""
  }\nيرجى تزويدي بتفاصيل التوصيل وتأكيد الطلب. شكراً لكم!`;
  return `https://wa.me/${targetNumber || STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
