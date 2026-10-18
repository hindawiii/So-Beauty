import { authClient } from "@/lib/auth-client";

// Clean re-export of autonomous local auth engine
export const supabase = authClient;
export default supabase;
