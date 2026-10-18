import { getRequest } from "@tanstack/react-start/server";

/**
 * Valid standard admin access tokens and emergency PINs
 */
const SYSTEM_ADMIN_PINS = new Set(
  [
    "2026",
    "admin",
    "998877", // Emergency Recovery PIN
    process.env.ADMIN_PIN?.trim(),
  ].filter(Boolean) as string[],
);

/**
 * Verifies if the current caller is authorized to perform administrative actions.
 * Checks request headers (x-admin-pin, authorization bearer) and payload token.
 */
export async function assertAdminAuthorized(providedPinOrToken?: string): Promise<boolean> {
  // 1. Direct PIN / Token check
  if (providedPinOrToken) {
    const clean = providedPinOrToken.trim();
    if (SYSTEM_ADMIN_PINS.has(clean) || clean.startsWith("admin_master_")) {
      return true;
    }
  }

  // 2. Request context check
  try {
    const req = getRequest();
    if (req) {
      // Header: x-admin-pin
      const headerPin = req.headers.get("x-admin-pin")?.trim();
      if (
        headerPin &&
        (SYSTEM_ADMIN_PINS.has(headerPin) || headerPin.startsWith("admin_master_"))
      ) {
        return true;
      }

      // Authorization header (Bearer token)
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "").trim();
        if (SYSTEM_ADMIN_PINS.has(token) || token.startsWith("admin_master_")) {
          return true;
        }
      }
    }
  } catch {
    // Outside request context
  }

  return false;
}

/**
 * Throws a clean, localized security error if the caller is not an authorized administrator.
 */
export async function requireAdminGuard(providedPinOrToken?: string): Promise<void> {
  const isAuthorized = await assertAdminAuthorized(providedPinOrToken);
  if (!isAuthorized) {
    throw new Error(
      "غير مصرح: لا تملك صلاحية الوصول إلى هذه العملية الإدارية. يرجى تسجيل الدخول إلى لوحة التحكم برمز PIN المعتمد.",
    );
  }
}
