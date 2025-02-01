import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration) => {
      console.log("Service Worker Registered");

      // Listen for updates
      registration.onupdatefound = () => {
        const newSW = registration.installing;
        if (newSW) {
          newSW.onstatechange = () => {
            if (newSW.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.log("New update available! Reloading...");
                window.location.reload(); // Reload once
              }
            }
          };
        }
      };
    })
    .catch((err) => console.error("Service Worker Registration Failed:", err));
}

const root = createRoot(rootElement);
root.render(
  <AuthProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AuthProvider>
);
