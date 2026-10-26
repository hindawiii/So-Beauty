import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore, setLogLevel } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App safely (singleton)
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const dbId = firebaseConfig.firestoreDatabaseId || "(default)";

// CRITICAL: Initialize Firestore with auto-detect long-polling for iframe/sandbox environments
export const db = (() => {
  try {
    return initializeFirestore(
      firebaseApp,
      {
        experimentalAutoDetectLongPolling: true,
      },
      dbId,
    );
  } catch {
    return getFirestore(firebaseApp, dbId);
  }
})();

// Silence internal gRPC idle stream / connection retry warnings in dev/sandbox
try {
  setLogLevel("silent");
} catch {
  // Graceful no-op
}

export const auth = getAuth(firebaseApp);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
