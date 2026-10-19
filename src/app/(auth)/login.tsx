import { Link } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton, OrDivider } from "@/components/auth/GoogleButton";
import { GradientButton } from "@/components/ui/GradientButton";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { ENABLE_GOOGLE_AUTH } from "@/lib/config";
import { t } from "@/lib/i18n";

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t.auth.errEmail);
    if (password.length < 6) return setError(t.auth.errPassword);

    setError(null);
    setLoading(true);
    try {
      // Після успіху (auth)-layout сам перенаправить на дашборд.
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.auth.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.auth.errGoogle);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell
      title={t.auth.loginTitle}
      subtitle={t.auth.loginSubtitle}
      footer={
        <Text className="text-sm text-mist-300">
          {t.auth.newHere}{" "}
          <Link href="/register" className="font-semibold text-sky-300">
            {t.auth.createAccount}
          </Link>
        </Text>
      }
    >
      <TextField
        label={t.auth.email}
        icon="mail-outline"
        placeholder={t.auth.emailPlaceholder}
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label={t.auth.password}
        icon="lock-closed-outline"
        placeholder="••••••••"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={onSubmit}
      />

      {error ? <Text className="mb-3 text-sm text-red-300">{error}</Text> : null}

      {/* TODO: «Забули пароль?» -> supabase.auth.resetPasswordForEmail(email, { redirectTo }) */}
      <GradientButton title={t.auth.signIn} onPress={onSubmit} loading={loading} />

      {ENABLE_GOOGLE_AUTH ? (
        <>
          <OrDivider />
          <GoogleButton onPress={onGoogle} loading={googleLoading} />
        </>
      ) : null}
    </AuthShell>
  );
}