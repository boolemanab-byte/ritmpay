import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // TODO(Supabase): on mount, restore the session and subscribe to changes:
  //   supabase.auth.getSession().then(({ data }) => setUser(map(data.session?.user)));
  //   const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(map(session?.user)));
  // Persist sessions with expo-secure-store (native) / localStorage (web),
  // and add an `initializing` flag so the splash screen stays up until restored.

  const signIn = useCallback(async (email: string, _password: string) => {
    // TODO(Supabase): const { error } = await supabase.auth.signInWithPassword({ email, password });
    await wait(700);
    setUser({ id: "mock-user", email, name: email.split("@")[0] });
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, _password: string) => {
      // TODO(Supabase): supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      await wait(900);
      setUser({ id: "mock-user", email, name });
    },
    []
  );

  const signOut = useCallback(async () => {
    // TODO(Supabase): await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, signIn, signUp, signOut }),
    [user, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
