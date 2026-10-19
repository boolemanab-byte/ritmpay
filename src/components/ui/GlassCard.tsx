import { BlurView } from "expo-blur";
import { ReactNode } from "react";
import { StyleSheet, View, ViewProps } from "react-native";

interface Props extends ViewProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

/** Translucent card with a blurred backdrop and a hairline border. */
export function GlassCard({
  children,
  className = "",
  intensity = 25,
  ...rest
}: Props) {
  return (
    <View
      className={`overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] ${className}`}
      {...rest}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
