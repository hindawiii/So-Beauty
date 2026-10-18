export interface CityShippingOption {
  name: string;
  name_en?: string;
  rate: number;
  deliveryTime: string;
  deliveryTime_en?: string;
  country?: string;
  country_en?: string;
}

export const DEFAULT_FREE_SHIPPING_THRESHOLD = 250;

export const REGIONAL_CITIES: Record<string, CityShippingOption[]> = {
  SAR: [
    {
      name: "الرياض",
      name_en: "Riyadh",
      rate: 25,
      deliveryTime: "خلال 24-48 ساعة",
      deliveryTime_en: "Within 24-48 hours",
      country: "السعودية",
      country_en: "Saudi Arabia",
    },
    {
      name: "جدة",
      name_en: "Jeddah",
      rate: 25,
      deliveryTime: "خلال 24-48 ساعة",
      deliveryTime_en: "Within 24-48 hours",
      country: "السعودية",
      country_en: "Saudi Arabia",
    },
    {
      name: "الدمام",
      name_en: "Dammam",
      rate: 25,
      deliveryTime: "خلال 24-48 ساعة",
      deliveryTime_en: "Within 24-48 hours",
      country: "السعودية",
      country_en: "Saudi Arabia",
    },
    {
      name: "مكة المكرمة",
      name_en: "Makkah",
      rate: 30,
      deliveryTime: "خلال 2-3 أيام عمل",
      deliveryTime_en: "2-3 business days",
      country: "السعودية",
      country_en: "Saudi Arabia",
    },
    {
      name: "المدينة المنورة",
      name_en: "Madinah",
      rate: 30,
      deliveryTime: "خلال 2-3 أيام عمل",
      deliveryTime_en: "2-3 business days",
      country: "السعودية",
      country_en: "Saudi Arabia",
    },
    {
      name: "الخبر",
      name_en: "Al Khobar",
      rate: 25,
      deliveryTime: "خلال 24-48 ساعة",
      deliveryTime_en: "Within 24-48 hours",
      country: "السعودية",
      country_en: "Saudi Arabia",
    },
    {
      name: "أبها / خميس مشيط",
      name_en: "Abha / Khamis Mushait",
      rate: 35,
      deliveryTime: "خلال 3-4 أيام عمل",
      deliveryTime_en: "3-4 business days",
      country: "السعودية",
      country_en: "Saudi Arabia",
    },
    {
      name: "تبوك",
      name_en: "Tabuk",
      rate: 35,
      deliveryTime: "خلال 3-4 أيام عمل",
      deliveryTime_en: "3-4 business days",
      country: "السعودية",
      country_en: "Saudi Arabia",
    },
  ],
  AED: [
    {
      name: "دبي",
      name_en: "Dubai",
      rate: 20,
      deliveryTime: "خلال 24 ساعة (نفس اليوم أحياناً)",
      deliveryTime_en: "Within 24 hours (Same-day available)",
      country: "الإمارات",
      country_en: "UAE",
    },
    {
      name: "أبوظبي",
      name_en: "Abu Dhabi",
      rate: 25,
      deliveryTime: "خلال 24-48 ساعة",
      deliveryTime_en: "Within 24-48 hours",
      country: "الإمارات",
      country_en: "UAE",
    },
    {
      name: "الشارقة",
      name_en: "Sharjah",
      rate: 20,
      deliveryTime: "خلال 24-48 ساعة",
      deliveryTime_en: "Within 24-48 hours",
      country: "الإمارات",
      country_en: "UAE",
    },
    {
      name: "عجمان",
      name_en: "Ajman",
      rate: 20,
      deliveryTime: "خلال 24-48 ساعة",
      deliveryTime_en: "Within 24-48 hours",
      country: "الإمارات",
      country_en: "UAE",
    },
    {
      name: "العين",
      name_en: "Al Ain",
      rate: 30,
      deliveryTime: "خلال 2-3 أيام عمل",
      deliveryTime_en: "2-3 business days",
      country: "الإمارات",
      country_en: "UAE",
    },
    {
      name: "رأس الخيمة",
      name_en: "Ras Al Khaimah",
      rate: 30,
      deliveryTime: "خلال 2-3 أيام عمل",
      deliveryTime_en: "2-3 business days",
      country: "الإمارات",
      country_en: "UAE",
    },
  ],
  EGP: [
    {
      name: "القاهرة",
      name_en: "Cairo",
      rate: 50,
      deliveryTime: "خلال 24-48 ساعة",
      deliveryTime_en: "Within 24-48 hours",
      country: "مصر",
      country_en: "Egypt",
    },
    {
      name: "الجيزة",
      name_en: "Giza",
      rate: 50,
      deliveryTime: "خلال 24-48 ساعة",
      deliveryTime_en: "Within 24-48 hours",
      country: "مصر",
      country_en: "Egypt",
    },
    {
      name: "الإسكندرية",
      name_en: "Alexandria",
      rate: 65,
      deliveryTime: "خلال 2-3 أيام عمل",
      deliveryTime_en: "2-3 business days",
      country: "مصر",
      country_en: "Egypt",
    },
    {
      name: "المنصورة",
      name_en: "Mansoura",
      rate: 70,
      deliveryTime: "خلال 2-3 أيام عمل",
      deliveryTime_en: "2-3 business days",
      country: "مصر",
      country_en: "Egypt",
    },
    {
      name: "طنطا",
      name_en: "Tanta",
      rate: 70,
      deliveryTime: "خلال 2-3 أيام عمل",
      deliveryTime_en: "2-3 business days",
      country: "مصر",
      country_en: "Egypt",
    },
    {
      name: "بورسعيد",
      name_en: "Port Said",
      rate: 75,
      deliveryTime: "خلال 2-4 أيام عمل",
      deliveryTime_en: "2-4 business days",
      country: "مصر",
      country_en: "Egypt",
    },
  ],
  SDG: [
    {
      name: "أم درمان",
      name_en: "Omdurman",
      rate: 15,
      deliveryTime: "خلال 24-48 ساعة",
      deliveryTime_en: "Within 24-48 hours",
      country: "السودان",
      country_en: "Sudan",
    },
    {
      name: "الخرطوم",
      name_en: "Khartoum",
      rate: 15,
      deliveryTime: "خلال 24-48 ساعة",
      deliveryTime_en: "Within 24-48 hours",
      country: "السودان",
      country_en: "Sudan",
    },
    {
      name: "بحري",
      name_en: "Bahri",
      rate: 15,
      deliveryTime: "خلال 24-48 ساعة",
      deliveryTime_en: "Within 24-48 hours",
      country: "السودان",
      country_en: "Sudan",
    },
    {
      name: "بورتسودان",
      name_en: "Port Sudan",
      rate: 25,
      deliveryTime: "خلال 2-3 أيام عمل",
      deliveryTime_en: "2-3 business days",
      country: "السودان",
      country_en: "Sudan",
    },
    {
      name: "ود مدني",
      name_en: "Wad Madani",
      rate: 20,
      deliveryTime: "خلال 2-3 أيام عمل",
      deliveryTime_en: "2-3 business days",
      country: "السودان",
      country_en: "Sudan",
    },
    {
      name: "القضارف",
      name_en: "Al Qadarif",
      rate: 25,
      deliveryTime: "خلال 3-4 أيام عمل",
      deliveryTime_en: "3-4 business days",
      country: "السودان",
      country_en: "Sudan",
    },
    {
      name: "كسلا",
      name_en: "Kassala",
      rate: 25,
      deliveryTime: "خلال 3-4 أيام عمل",
      deliveryTime_en: "3-4 business days",
      country: "السودان",
      country_en: "Sudan",
    },
    {
      name: "عطبرة",
      name_en: "Atbara",
      rate: 20,
      deliveryTime: "خلال 2-3 أيام عمل",
      deliveryTime_en: "2-3 business days",
      country: "السودان",
      country_en: "Sudan",
    },
    {
      name: "شندي",
      name_en: "Shendi",
      rate: 20,
      deliveryTime: "خلال 2-3 أيام عمل",
      deliveryTime_en: "2-3 business days",
      country: "السودان",
      country_en: "Sudan",
    },
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

export function getDeliveryTimeEstimate(
  cityName: string,
  currencyCode: string = "SDG",
  lang: "ar" | "en" = "ar",
): string {
  const cities = REGIONAL_CITIES[currencyCode] || REGIONAL_CITIES.SDG;
  const found = cities.find(
    (c) =>
      c.name.trim().toLowerCase() === cityName.trim().toLowerCase() ||
      c.name_en?.trim().toLowerCase() === cityName.trim().toLowerCase(),
  );
  if (!found) {
    return lang === "en" ? "Within 2-4 business days" : "خلال 2-4 أيام عمل";
  }
  return lang === "en" && found.deliveryTime_en ? found.deliveryTime_en : found.deliveryTime;
}

export function getLocalizedCityName(
  city: CityShippingOption | string,
  lang: "ar" | "en" = "ar",
  currencyCode: string = "SDG",
): string {
  if (typeof city === "object" && city) {
    return lang === "en" && city.name_en ? city.name_en : city.name;
  }
  const cities = REGIONAL_CITIES[currencyCode] || REGIONAL_CITIES.SDG;
  const found = cities.find(
    (c) =>
      c.name.trim().toLowerCase() === city.trim().toLowerCase() ||
      c.name_en?.trim().toLowerCase() === city.trim().toLowerCase(),
  );
  if (found && lang === "en" && found.name_en) {
    return found.name_en;
  }
  return city;
}
