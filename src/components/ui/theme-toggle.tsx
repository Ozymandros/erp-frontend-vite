import { Check, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/theme.context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Theme toggle: Light / Dark / System via next-themes (class on html).
 * Visuals follow CSS custom properties in index.css, not hardcoded colors.
 */
export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const activeTheme = theme ?? "system";

  const menuItemClass = (value: string) =>
    cn("flex w-full items-center", activeTheme === value && "bg-accent");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" ariaLabel="Toggle theme" className="relative">
          <Sun
            className={cn(
              "h-[1.2rem] w-[1.2rem] transition-transform motion-reduce:transition-none",
              isDark ? "-rotate-90 scale-0" : "rotate-0 scale-100",
            )}
          />
          <Moon
            className={cn(
              "absolute h-[1.2rem] w-[1.2rem] transition-transform motion-reduce:transition-none",
              isDark ? "rotate-0 scale-100" : "rotate-90 scale-0",
            )}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={menuItemClass("light")}
          onClick={() => setTheme("light")}
          aria-current={activeTheme === "light" ? "true" : undefined}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {activeTheme === "light" && <Check className="ml-auto h-4 w-4" aria-hidden />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={menuItemClass("dark")}
          onClick={() => setTheme("dark")}
          aria-current={activeTheme === "dark" ? "true" : undefined}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {activeTheme === "dark" && <Check className="ml-auto h-4 w-4" aria-hidden />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={menuItemClass("system")}
          onClick={() => setTheme("system")}
          aria-current={activeTheme === "system" ? "true" : undefined}
        >
          <span className="mr-2 h-4 w-4" aria-hidden />
          <span>System</span>
          {activeTheme === "system" && <Check className="ml-auto h-4 w-4" aria-hidden />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
