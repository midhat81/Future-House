import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { AuthProvider } from "@/contexts/AuthContext";
import "./index.css";

Sentry.init({
  dsn: import.meta.env['VITE_SENTRY_DSN'] as string | undefined,
  environment: import.meta.env.MODE,
});

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<p>An error occurred. Please refresh the page to try again.</p>}>
    <AppWrapper>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppWrapper>
  </Sentry.ErrorBoundary>
);