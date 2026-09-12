export interface CityShippingOption {
  name: string;
  rate: number;
  deliveryTime: string;
}

export const FREE_SHIPPING_THRESHOLD = 250; // ج.م

export const SUDAN_CITIES: CityShippingOption[] = [
  { name: "أم درمان", rate: 15, deliveryTime: "خلال 24-48 ساعة (نفس اليوم أحياناً)" },
  { name: "الخرطوم", rate: 15, deliveryTime: "خلال 24-48 ساعة" },
  { name: "بحري", rate: 15, deliveryTime: "خلال 24-48 ساعة" },
  { name: "بورتسودان", rate: 25, deliveryTime: "خلال 2-3 أيام عمل" },
  { name: "ود مدني", rate: 20, deliveryTime: "خلال 2-3 أيام عمل" },
  { name: "القضارف", rate: 25, deliveryTime: "خلال 3-4 أيام عمل" },
  { name: "كسلا", rate: 25, deliveryTime: "خلال 3-4 أيام عمل" },
  { name: "عطبرة", rate: 20, deliveryTime: "خلال 2-3 أيام عمل" },
  { name: "شندي", rate: 20, deliveryTime: "خلال 2-3 أيام عمل" },
  { name: "الأبيض", rate: 30, deliveryTime: "خلال 3-5 أيام عمل" },
  { name: "كوستي", rate: 25, deliveryTime: "خلال 3-4 أيام عمل" },
  { name: "دنقلا", rate: 30, deliveryTime: "خلال 3-5 أيام عمل" },
];

export function getShippingFee(cityName: string, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD || subtotal <= 0) {
    return 0;
  }
  const found = SUDAN_CITIES.find(
    (c) => c.name.trim().toLowerCase() === cityName.trim().toLowerCase(),
  );
  return found ? found.rate : 20;
}

export function getDeliveryTimeEstimate(cityName: string): string {
  const found = SUDAN_CITIES.find(
    (c) => c.name.trim().toLowerCase() === cityName.trim().toLowerCase(),
  );
  return found ? found.deliveryTime : "خلال 2-4 أيام عمل";
}
