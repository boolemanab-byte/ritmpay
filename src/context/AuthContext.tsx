import type { User as SupabaseUser } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import { mapAuthError } from "@/lib/authErrors";
import { t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

// Потрібно для веб-вікон авторизації
WebBrowser.maybeCompleteAuthSession();

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: User | null;
  /** true, доки відновлюється збережена сесія */
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** needsConfirmation = true, якщо користувачу треба підтвердити пошту */
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Єдина адреса повернення для підтвердження пошти та Google (web, Expo Go, збірка). */
const callbackUrl = () => Linking.createURL("auth-callback");

function mapUser(u: SupabaseUser | null | undefined): User | null {
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const email = u.email ?? "";
  const name = String(meta.full_name || meta.name || email.split("@")[0] || "");
  return { id: u.id, email, name };
}

/** Розбирає параметри і з ?query, і з #fragment. */
function parseAuthUrl(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const [beforeHash, hash = ""] = url.split("#");
  const query = beforeHash.split("?")[1] ?? "";
  for (const part of [query, hash]) {
    if (!part) continue;
    for (const pair of part.split("&")) {
      const [k, v = ""] = pair.split("=");
      if (k) out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, " "));
    }
  }
  return out;
}

/** Створює сесію з посилання підтвердження пошти або з відповіді Google. */
async function createSessionFromUrl(url: string) {
  const params = parseAuthUrl(url);
  if (params.error || params.error_description) {
    throw new Error(params.error_description || params.error);
  }
  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
  } else if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
  }
  // Прибрати токени з адресного рядка (web)
  if (Platform.OS === "web" && typeof window !== "undefined") {
    try {
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      /* ігноруємо */
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Відновити збережену сесію
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(mapUser(data.session?.user));
      setInitializing(false);
    });

    // 2. Слухати зміни сесії (вхід, вихід, оновлення токена).
    //    Усередині колбека не викликаємо async-методи Supabase.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user));
    });

    // 3. Обробити посилання повернення (підтвердження пошти / Google)
    const handleUrl = (url: string | null) => {
      if (url && url.includes("auth-callback")) {
        createSessionFromUrl(url).catch((e) => console.warn("Auth callback:", e));
      }
    };
    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener("url", ({ url }) => handleUrl(url));

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      sub.remove();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(mapAuthError(error));
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: callbackUrl(),
        },
      });
      if (error) throw new Error(mapAuthError(error));
      // Для вже зареєстрованої пошти Supabase не видає помилку, а повертає
      // «порожнього» користувача без identities.
      if (data.user?.identities && data.user.identities.length === 0) {
        throw new Error(t.auth.errExists);
      }
      return { needsConfirmation: !data.session };
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = callbackUrl();
    const isWeb = Platform.OS === "web";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: !isWeb },
    });
    if (error) throw new Error(t.auth.errGoogle);
    if (isWeb) return; // браузер сам перейде на Google і повернеться на /auth-callback
    if (!data.url) throw new Error(t.auth.errGoogle);

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === "success") {
      try {
        await createSessionFromUrl(result.url);
      } catch {
        throw new Error(t.auth.errGoogle);
      }
    }
  }, []);

  const resendConfirmation = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: callbackUrl() },
    });
    if (error) throw new Error(mapAuthError(error));
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.warn("Sign out:", error);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      signIn,
      signUp,
      signInWithGoogle,
      resendConfirmation,
      signOut,
    }),
    [user, initializing, signIn, signUp, signInWithGoogle, resendConfirmation, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
