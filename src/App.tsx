import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth.context";
import { ToastContextProvider } from "@/contexts/toast.context";
import { AppRoutes } from "@/routes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContextProvider>
          <AppRoutes />
        </ToastContextProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
