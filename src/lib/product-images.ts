import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";

const map: Record<string, string> = {
  "/src/assets/product-1.jpg": p1,
  "/src/assets/product-2.jpg": p2,
  "/src/assets/product-3.jpg": p3,
  "/src/assets/product-4.jpg": p4,
};

export function resolveProductImage(url: string | null | undefined): string {
  if (!url) return p1;
  return map[url] ?? url;
}

const GALLERY_REGEX = /<!--GALLERY:(.*?)-->/;
const I18N_REGEX = /<!--I18N:(.*?)-->/;

/**
 * Extracts gallery image URLs from product metadata or description.
 * If the merchant did NOT provide multiple angles, returns an array with ONLY the primary image.
 */
export function extractProductGallery(
  product:
    | {
        image_url?: string | null;
        description?: string | null;
        gallery_images?: (string | null)[] | null;
      }
    | null
    | undefined,
): string[] {
  if (!product) return [resolveProductImage(null)];

  // 1. Direct gallery_images array
  if (
    product.gallery_images &&
    Array.isArray(product.gallery_images) &&
    product.gallery_images.length > 0
  ) {
    const valid = product.gallery_images
      .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      .map((u) => resolveProductImage(u));
    if (valid.length > 0) {
      return valid;
    }
  }

  // 2. Embedded gallery in description: <!--GALLERY:["url1", "url2"]-->
  if (product.description && typeof product.description === "string") {
    const match = product.description.match(GALLERY_REGEX);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const resolved = parsed
            .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
            .map((u) => resolveProductImage(u));
          if (resolved.length > 0) {
            return resolved;
          }
        }
      } catch {
        // Fall through to primary image
      }
    }
  }

  // 3. Fallback: single primary image (No forced multi-images!)
  return [resolveProductImage(product.image_url)];
}

/**
 * Removes embedded gallery and i18n tags from description before customer display.
 */
export function cleanProductDescription(desc: string | null | undefined): string {
  if (!desc) return "";
  return desc.replace(GALLERY_REGEX, "").replace(I18N_REGEX, "").trim();
}

/**
 * Encodes array of gallery image URLs into a persistent comment tag.
 */
export function encodeProductGallery(galleryUrls: string[]): string {
  const clean = galleryUrls.map((u) => u.trim()).filter((u) => u.length > 0);
  if (clean.length === 0) return "";
  return `<!--GALLERY:${JSON.stringify(clean)}-->`;
}

/**
 * Legacy support: returns single resolved image unless product has multiple angles
 */
export function getProductGalleryImages(
  primaryUrl: string | null | undefined,
  product?: { description?: string | null; gallery_images?: (string | null)[] | null },
): string[] {
  if (product) {
    return extractProductGallery({ image_url: primaryUrl, ...product });
  }
  return [resolveProductImage(primaryUrl)];
}
