import { t } from "./i18n";

interface SupabaseLikeError {
  code?: string;
  message?: string;
  status?: number;
}

/** Перетворює помилку Supabase Auth на зрозуміле українське повідомлення. */
export function mapAuthError(error: SupabaseLikeError): string {
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
    return t.auth.errInvalidCredentials;
  }
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) {
    return t.auth.errNotConfirmed;
  }
  if (code === "user_already_exists" || msg.includes("already registered")) {
    return t.auth.errExists;
  }
  if (code === "weak_password") return t.auth.errPassword;
  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    error.status === 429 ||
    msg.includes("rate limit")
  ) {
    return t.auth.errRateLimit;
  }
  if (msg.includes("network") || msg.includes("fetch")) return t.auth.errNetwork;
  return t.auth.errGeneric;
}
