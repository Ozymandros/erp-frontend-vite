import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { useEffect, type ReactNode } from "react";

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
      <ThemeColorMeta />
      {children}
    </NextThemesProvider>
  );
}

/**
 * Syncs browser theme-color meta with --primary CSS variable.
 */
function ThemeColorMeta() {
  const { resolvedTheme } = useNextTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim();
    if (!primary) return;

    const content = `hsl(${primary})`;
    let meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  }, [resolvedTheme]);

  return null;
}

/**
 * Hook to access theme state and setter.
 * Wraps next-themes useTheme for backward compatibility.
 */
export const useTheme = useNextTheme;
