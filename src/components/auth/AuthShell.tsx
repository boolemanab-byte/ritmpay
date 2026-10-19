import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/lib/theme";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Shared layout for Login and Register: logo, glass form card, footer link. */
export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow justify-center px-6 py-12"
        >
          <View className="w-full max-w-md self-center">
            {/* Logo */}
            <View className="mb-10 items-center">
              <LinearGradient
                colors={[colors.sky[300], colors.gold[400]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: colors.sky[400],
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 8 },
                }}
              >
                <Ionicons name="pulse" size={30} color={colors.ink[900]} />
              </LinearGradient>
              <Text className="mt-5 text-3xl font-bold tracking-tight text-mist-100">
                Ритм<Text className="text-gold-400">Pay</Text>
              </Text>
              <Text className="mt-1 text-sm text-mist-300">
                Your bills, in rhythm.
              </Text>
            </View>

            <GlassCard className="p-6">
              <Text className="text-2xl font-semibold text-mist-100">{title}</Text>
              <Text className="mb-6 mt-1 text-sm text-mist-300">{subtitle}</Text>
              {children}
            </GlassCard>

            <View className="mt-6 items-center">{footer}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
