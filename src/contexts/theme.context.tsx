import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import type { ReactNode } from "react";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: "dark" | "light" | "system";
  storageKey?: string;
};

/**
 * Theme provider using next-themes for SSR-safe theme switching.
 * This integrates with Radix UI Themes which uses class-based theme switching.
 * 
 * According to Radix UI Themes docs:
 * - Use ThemeProvider from next-themes with attribute="class"
 * - Wrap with Theme component from @radix-ui/themes
 * - Do NOT manually set appearance prop on Theme component
 * - Rely on class switching that next-themes provides
 * - This prevents appearance flash during initial render
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Hook to access theme state and setter.
 * Wraps next-themes useTheme for backward compatibility.
 */
export const useTheme = useNextTheme;
