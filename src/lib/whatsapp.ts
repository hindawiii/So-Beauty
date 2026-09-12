export const STORE_WHATSAPP_NUMBER = "249900776688"; // +249 900 776 688

/**
 * Generates direct WhatsApp click-to-chat URL with prefilled text
 */
export function getWhatsAppChatUrl(customMessage?: string): string {
  const defaultMsg =
    "مرحباً سو بيوتي 🌸، أود الاستفسار بخصوص منتجات العناية الطبيعية وتفاصيل التوصيل.";
  const text = encodeURIComponent(customMessage?.trim() || defaultMsg);
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${text}`;
}

/**
 * Generates direct WhatsApp URL for ordering a specific product instantly
 */
export function getWhatsAppProductOrderUrl(
  productName: string,
  price: number,
  productId?: string,
): string {
  const message = `مرحباً سو بيوتي 🌸، أرغب في طلب هذا المنتج:\n- اسم المنتج: ${productName}\n- السعر: ${price} ج.م${
    productId ? `\n- الرابط: ${typeof window !== "undefined" ? window.location.href : ""}` : ""
  }\nيرجى تزويدي بتفاصيل التوصيل وتأكيد الطلب. شكراً لكم!`;
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
