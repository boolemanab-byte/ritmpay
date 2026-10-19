import { Link } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { AuthShell } from "@/components/auth/AuthShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setError(null);
    setLoading(true);
    try {
      // TODO(Supabase): if email confirmation is enabled, show a
      // "Check your inbox" state instead of signing in immediately.
      await signUp(name.trim(), email.trim(), password);
    } catch {
      setError("Could not create the account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Start tracking every bill in one place."
      footer={
        <Text className="text-sm text-mist-300">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-sky-300">
            Sign in
          </Link>
        </Text>
      }
    >
      <TextField
        label="Name"
        icon="person-outline"
        placeholder="Your name"
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
      />
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
        placeholder="At least 6 characters"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextField
        label="Confirm password"
        icon="shield-checkmark-outline"
        placeholder="Repeat password"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        onSubmitEditing={onSubmit}
      />

      {error ? <Text className="mb-3 text-sm text-red-300">{error}</Text> : null}

      <GradientButton title="Create account" onPress={onSubmit} loading={loading} />
    </AuthShell>
  );
}
