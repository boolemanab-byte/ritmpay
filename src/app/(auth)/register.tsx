import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton, OrDivider } from "@/components/auth/GoogleButton";
import { GradientButton } from "@/components/ui/GradientButton";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { ENABLE_GOOGLE_AUTH } from "@/lib/config";
import { t } from "@/lib/i18n";

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle, resendConfirmation } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Адреса, на яку надіслано лист підтвердження (показуємо окремий стан) */
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const onSubmit = async () => {
    if (name.trim().length < 2) return setError(t.auth.errName);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t.auth.errEmail);
    if (password.length < 6) return setError(t.auth.errPassword);
    if (password !== confirm) return setError(t.auth.errMismatch);

    setError(null);
    setLoading(true);
    try {
      const { needsConfirmation } = await signUp(name.trim(), email.trim(), password);
      // Якщо підтвердження не потрібне, сесія вже є і (auth)-layout перенаправить сам.
      if (needsConfirmation) setSentTo(email.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : t.auth.errSignUp);
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

  const onResend = async () => {
    if (!sentTo) return;
    setNote(null);
    try {
      await resendConfirmation(sentTo);
      setNote(t.auth.resent);
    } catch (e) {
      setNote(e instanceof Error ? e.message : t.auth.errGeneric);
    }
  };

  // Стан «Перевірте пошту»
  if (sentTo) {
    return (
      <AuthShell
        title={t.auth.confirmTitle}
        subtitle={t.auth.confirmText(sentTo)}
        footer={
          <Pressable onPress={onResend} hitSlop={8}>
            <Text className="text-sm font-semibold text-sky-300">{t.auth.resend}</Text>
          </Pressable>
        }
      >
        {note ? <Text className="mb-4 text-sm text-mist-300">{note}</Text> : null}
        <GradientButton title={t.auth.toLogin} onPress={() => router.replace("/login")} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t.auth.registerTitle}
      subtitle={t.auth.registerSubtitle}
      footer={
        <Text className="text-sm text-mist-300">
          {t.auth.haveAccount}{" "}
          <Link href="/login" className="font-semibold text-sky-300">
            {t.auth.signIn}
          </Link>
        </Text>
      }
    >
      <TextField
        label={t.auth.name}
        icon="person-outline"
        placeholder={t.auth.namePlaceholder}
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
      />
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
        placeholder={t.auth.passwordHint}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextField
        label={t.auth.confirmPassword}
        icon="shield-checkmark-outline"
        placeholder={t.auth.repeatPassword}
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        onSubmitEditing={onSubmit}
      />

      {error ? <Text className="mb-3 text-sm text-red-300">{error}</Text> : null}

      <GradientButton title={t.auth.createAccount} onPress={onSubmit} loading={loading} />

      {ENABLE_GOOGLE_AUTH ? (
        <>
          <OrDivider />
          <GoogleButton onPress={onGoogle} loading={googleLoading} />
        </>
      ) : null}
    </AuthShell>
  );
}