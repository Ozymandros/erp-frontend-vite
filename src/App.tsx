import { BrowserRouter } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { AuthProvider } from "@/contexts/auth.context";
import { ToastContextProvider } from "@/contexts/toast.context";
import { ThemeProvider } from "@/contexts/theme.context";
import { AppRoutes } from "@/routes";

/**
 * Main App component with Radix UI Themes integration.
 * 
 * According to Radix UI Themes documentation:
 * - Use ThemeProvider from next-themes with attribute="class"
 * - Wrap with Theme component from @radix-ui/themes
 * - Do NOT set appearance prop - rely on class switching from next-themes
 * - This prevents appearance flash during initial render
 */
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Theme>
          <AuthProvider>
            <ToastContextProvider>
              <AppRoutes />
            </ToastContextProvider>
          </AuthProvider>
        </Theme>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
