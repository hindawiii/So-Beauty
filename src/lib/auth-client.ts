/**
 * Clean Local & Autonomous Client Authentication Service
 * Replaces external Supabase client dependency with a reactive, localized session engine.
 * Prepares the codebase for direct Firebase Auth integration without breaking any current UI flow.
 */

export type AuthUser = {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
  app_metadata?: {
    role?: string;
  };
  created_at?: string;
};

export type AuthSession = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};

export type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "USER_UPDATED" | "TOKEN_REFRESHED";

type AuthListener = (event: AuthChangeEvent, session: AuthSession | null) => void;

const AUTH_STORAGE_KEY = "store_auth_session";
const USERS_STORAGE_KEY = "store_registered_users";

// In-memory listeners registry
const listeners: Set<AuthListener> = new Set();

function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[AuthClient] Failed to read stored session:", e);
    return null;
  }
}

function persistSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem("store_auth_token", session.access_token);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("store_auth_token");
    }
  } catch (e) {
    console.warn("[AuthClient] Failed to persist session:", e);
  }
}

function notifyListeners(event: AuthChangeEvent, session: AuthSession | null) {
  listeners.forEach((fn) => {
    try {
      fn(event, session);
    } catch (e) {
      console.error("[AuthClient] Listener error:", e);
    }
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("store_auth_state_change", {
        detail: { event, session },
      }),
    );
  }
}

export const authClient = {
  auth: {
    async getUser(): Promise<{ data: { user: AuthUser | null }; error: null }> {
      const session = getStoredSession();
      return {
        data: { user: session?.user ?? null },
        error: null,
      };
    },

    async getSession(): Promise<{ data: { session: AuthSession | null }; error: null }> {
      const session = getStoredSession();
      return {
        data: { session },
        error: null,
      };
    },

    async signInWithPassword({
      email,
      password,
    }: {
      email: string;
      password?: string;
    }): Promise<{ data: { user: AuthUser; session: AuthSession }; error: Error | null }> {
      const cleanEmail = email.trim().toLowerCase();

      // Check registered users in storage
      let users: Record<string, { id: string; email: string; name: string }> = {};
      try {
        const raw = localStorage.getItem(USERS_STORAGE_KEY);
        if (raw) users = JSON.parse(raw);
      } catch (_e) {
        // Fallback gracefully
      }

      const found = users[cleanEmail];
      const userId = found?.id || `usr-${Math.random().toString(36).slice(2, 10)}`;
      const fullName = found?.name || cleanEmail.split("@")[0];

      const user: AuthUser = {
        id: userId,
        email: cleanEmail,
        user_metadata: {
          full_name: fullName,
        },
        created_at: new Date().toISOString(),
      };

      const session: AuthSession = {
        access_token: `mock_jwt_${userId}_${Date.now()}`,
        token_type: "bearer",
        expires_in: 3600 * 24 * 7,
        user,
      };

      persistSession(session);
      notifyListeners("SIGNED_IN", session);

      return { data: { user, session }, error: null };
    },

    async signUp({
      email,
      options,
    }: {
      email: string;
      password?: string;
      options?: {
        emailRedirectTo?: string;
        data?: {
          full_name?: string;
        };
      };
    }): Promise<{ data: { user: AuthUser; session: AuthSession }; error: Error | null }> {
      const cleanEmail = email.trim().toLowerCase();
      const fullName = options?.data?.full_name?.trim() || cleanEmail.split("@")[0];
      const userId = `usr-${Math.random().toString(36).slice(2, 10)}`;

      // Save user to registry
      try {
        const raw = localStorage.getItem(USERS_STORAGE_KEY);
        const users: Record<string, { id: string; email: string; name: string }> = raw
          ? JSON.parse(raw)
          : {};
        users[cleanEmail] = { id: userId, email: cleanEmail, name: fullName };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } catch (e) {
        console.warn("[AuthClient] Failed to persist user registration:", e);
      }

      const user: AuthUser = {
        id: userId,
        email: cleanEmail,
        user_metadata: {
          full_name: fullName,
        },
        created_at: new Date().toISOString(),
      };

      const session: AuthSession = {
        access_token: `mock_jwt_${userId}_${Date.now()}`,
        token_type: "bearer",
        expires_in: 3600 * 24 * 7,
        user,
      };

      persistSession(session);
      notifyListeners("SIGNED_IN", session);

      return { data: { user, session }, error: null };
    },

    async signOut(): Promise<{ error: null }> {
      persistSession(null);
      notifyListeners("SIGNED_OUT", null);
      return { error: null };
    },

    async setSession(tokens?: {
      access_token?: string;
      refresh_token?: string;
    }): Promise<{ error: null }> {
      if (tokens?.access_token) {
        const session: AuthSession = {
          access_token: tokens.access_token,
          token_type: "bearer",
          expires_in: 3600 * 24 * 7,
          user: {
            id: `usr-oauth-${Date.now()}`,
            email: "user@example.com",
            user_metadata: { full_name: "مستخدم الحساب" },
          },
        };
        persistSession(session);
        notifyListeners("SIGNED_IN", session);
      }
      return { error: null };
    },

    onAuthStateChange(callback: (event: AuthChangeEvent, session: AuthSession | null) => void): {
      data: {
        subscription: {
          unsubscribe: () => void;
        };
      };
    } {
      listeners.add(callback);

      // Trigger initial call with current state
      const current = getStoredSession();
      try {
        callback(current ? "SIGNED_IN" : "SIGNED_OUT", current);
      } catch (_e) {
        // Initial callback failed silently
      }

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              listeners.delete(callback);
            },
          },
        },
      };
    },
  },
};

// Aliased export for backwards compatibility
export const supabase = authClient;
