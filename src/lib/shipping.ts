export interface CityShippingOption {
  name: string;
  rate: number;
  deliveryTime: string;
  country?: string;
}

export const DEFAULT_FREE_SHIPPING_THRESHOLD = 250;

export const REGIONAL_CITIES: Record<string, CityShippingOption[]> = {
  SAR: [
    { name: "الرياض", rate: 25, deliveryTime: "خلال 24-48 ساعة", country: "السعودية" },
    { name: "جدة", rate: 25, deliveryTime: "خلال 24-48 ساعة", country: "السعودية" },
    { name: "الدمام", rate: 25, deliveryTime: "خلال 24-48 ساعة", country: "السعودية" },
    { name: "مكة المكرمة", rate: 30, deliveryTime: "خلال 2-3 أيام عمل", country: "السعودية" },
    { name: "المدينة المنورة", rate: 30, deliveryTime: "خلال 2-3 أيام عمل", country: "السعودية" },
    { name: "الخبر", rate: 25, deliveryTime: "خلال 24-48 ساعة", country: "السعودية" },
    { name: "أبها / خميس مشيط", rate: 35, deliveryTime: "خلال 3-4 أيام عمل", country: "السعودية" },
    { name: "تبوك", rate: 35, deliveryTime: "خلال 3-4 أيام عمل", country: "السعودية" },
  ],
  AED: [
    {
      name: "دبي",
      rate: 20,
      deliveryTime: "خلال 24 ساعة (نفس اليوم أحياناً)",
      country: "الإمارات",
    },
    { name: "أبوظبي", rate: 25, deliveryTime: "خلال 24-48 ساعة", country: "الإمارات" },
    { name: "الشارقة", rate: 20, deliveryTime: "خلال 24-48 ساعة", country: "الإمارات" },
    { name: "عجمان", rate: 20, deliveryTime: "خلال 24-48 ساعة", country: "الإمارات" },
    { name: "العين", rate: 30, deliveryTime: "خلال 2-3 أيام عمل", country: "الإمارات" },
    { name: "رأس الخيمة", rate: 30, deliveryTime: "خلال 2-3 أيام عمل", country: "الإمارات" },
  ],
  EGP: [
    { name: "القاهرة", rate: 50, deliveryTime: "خلال 24-48 ساعة", country: "مصر" },
    { name: "الجيزة", rate: 50, deliveryTime: "خلال 24-48 ساعة", country: "مصر" },
    { name: "الإسكندرية", rate: 65, deliveryTime: "خلال 2-3 أيام عمل", country: "مصر" },
    { name: "المنصورة", rate: 70, deliveryTime: "خلال 2-3 أيام عمل", country: "مصر" },
    { name: "طنطا", rate: 70, deliveryTime: "خلال 2-3 أيام عمل", country: "مصر" },
    { name: "بورسعيد", rate: 75, deliveryTime: "خلال 2-4 أيام عمل", country: "مصر" },
  ],
  SDG: [
    { name: "أم درمان", rate: 15, deliveryTime: "خلال 24-48 ساعة", country: "السودان" },
    { name: "الخرطوم", rate: 15, deliveryTime: "خلال 24-48 ساعة", country: "السودان" },
    { name: "بحري", rate: 15, deliveryTime: "خلال 24-48 ساعة", country: "السودان" },
    { name: "بورتسودان", rate: 25, deliveryTime: "خلال 2-3 أيام عمل", country: "السودان" },
    { name: "ود مدني", rate: 20, deliveryTime: "خلال 2-3 أيام عمل", country: "السودان" },
    { name: "القضارف", rate: 25, deliveryTime: "خلال 3-4 أيام عمل", country: "السودان" },
    { name: "كسلا", rate: 25, deliveryTime: "خلال 3-4 أيام عمل", country: "السودان" },
    { name: "عطبرة", rate: 20, deliveryTime: "خلال 2-3 أيام عمل", country: "السودان" },
    { name: "شندي", rate: 20, deliveryTime: "خلال 2-3 أيام عمل", country: "السودان" },
  ],
};

export const SUDAN_CITIES = REGIONAL_CITIES.SDG;

/**
 * Dynamic shipping fee calculation respecting store configured thresholds & custom delivery fee
 */
export function getShippingFee(
  cityName: string,
  subtotal: number,
  overrideThreshold?: number,
  overrideFee?: number,
  currencyCode: string = "SDG",
): number {
  const threshold =
    typeof overrideThreshold === "number" && overrideThreshold > 0
      ? overrideThreshold
      : DEFAULT_FREE_SHIPPING_THRESHOLD;

  if (subtotal >= threshold || subtotal <= 0) {
    return 0;
  }

  // If a global standard delivery fee is configured in store settings, respect it
  if (typeof overrideFee === "number" && overrideFee >= 0) {
    return overrideFee;
  }

  const cities = REGIONAL_CITIES[currencyCode] || REGIONAL_CITIES.SDG;
  const found = cities.find((c) => c.name.trim().toLowerCase() === cityName.trim().toLowerCase());
  return found ? found.rate : 25;
}

export function getDeliveryTimeEstimate(cityName: string, currencyCode: string = "SDG"): string {
  const cities = REGIONAL_CITIES[currencyCode] || REGIONAL_CITIES.SDG;
  const found = cities.find((c) => c.name.trim().toLowerCase() === cityName.trim().toLowerCase());
  return found ? found.deliveryTime : "خلال 2-4 أيام عمل";
}
