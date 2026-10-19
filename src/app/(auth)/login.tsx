import { Link } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { AuthShell } from "@/components/auth/AuthShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setError(null);
    setLoading(true);
    try {
      // On success the (auth) layout redirects to the dashboard automatically.
      await signIn(email.trim(), password);
    } catch {
      setError("Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your payments."
      footer={
        <Text className="text-sm text-mist-300">
          New here?{" "}
          <Link href="/register" className="font-semibold text-sky-300">
            Create an account
          </Link>
        </Text>
      }
    >
      <TextField
        label="Email"
        icon="mail-outline"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label="Password"
        icon="lock-closed-outline"
        placeholder="••••••••"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={onSubmit}
      />

      {error ? <Text className="mb-3 text-sm text-red-300">{error}</Text> : null}

      {/* TODO(Supabase): "Forgot password?" -> supabase.auth.resetPasswordForEmail()
          TODO: Sign in with Apple / Google via supabase.auth.signInWithOAuth() */}
      <GradientButton title="Sign in" onPress={onSubmit} loading={loading} />
    </AuthShell>
  );
}
