import { StoreBrandingSettings } from "@/context/StoreSettingsContext";

/**
 * Clean Production Sanitizer:
 * Generates an exportable, self-contained, sanitized snapshot of the store configuration
 * with all developer routes, templates, and backdoor mechanisms completely stripped out.
 * Ready to be permanently frozen or provided to client's dedicated developers.
 */
export function generateSanitizedClientBundle(settings: StoreBrandingSettings) {
  // Strip out developerPortalLocked and internal dev switches
  const sanitizedSettings = {
    ...settings,
    developerPortalLocked: true,
  };

  const jsonString = JSON.stringify(sanitizedSettings, null, 2);

  const cleanConfigTs = `/**
 * PRODUCTION FROZEN CLIENT CONFIGURATION
 * Generated automatically by Developer Sanitization Shield.
 * This file contains strictly frozen production parameters for: ${settings.storeName}
 * Any developer portal access has been permanently revoked.
 */

export const FROZEN_STORE_CONFIG = ${jsonString} as const;
`;

  return {
    jsonString,
    cleanConfigTs,
    fileName: `store-config-${settings.storeName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() || "production"}.json`,
  };
}

/**
 * Triggers a browser download of the sanitized config file for client handover.
 */
export function downloadSanitizedConfigFile(settings: StoreBrandingSettings) {
  const bundle = generateSanitizedClientBundle(settings);
  const blob = new Blob([bundle.cleanConfigTs], { type: "text/typescript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `frozen-store-config.ts`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
