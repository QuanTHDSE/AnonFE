import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./app/App";
import "./styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

createRoot(rootElement).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId ?? ""}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
