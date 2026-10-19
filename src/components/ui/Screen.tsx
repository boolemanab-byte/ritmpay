import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/lib/theme";

/** Slate gradient background with two soft glow orbs behind the content. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 bg-ink-900">
      <LinearGradient
        colors={[colors.ink[900], colors.ink[800], colors.ink[900]]}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-sky-400/15"
      />
      <View
        pointerEvents="none"
        className="absolute -right-28 top-1/3 h-72 w-72 rounded-full bg-gold-400/10"
      />
      <StatusBar style="light" />
      {children}
    </View>
  );
}
