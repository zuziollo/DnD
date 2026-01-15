import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// Global error capture to avoid blank screen
window.onerror = (message, source, lineno, colno, error) => {
  console.error("[Renderer][onerror]", { message, source, lineno, colno, error });
  const detail = typeof message === "string" ? message : JSON.stringify(message);
  const container = document.getElementById("root");
  if (container) {
    container.innerHTML = `<div style="padding:16px;font-family:sans-serif;color:#f55;background:#1a1a1a">
      <h2>Renderer error</h2>
      <pre>${detail}</pre>
      <pre>${error ? (error as Error).stack ?? "" : ""}</pre>
    </div>`;
  }
};

window.onunhandledrejection = (event) => {
  console.error("[Renderer][unhandledrejection]", event.reason);
  const container = document.getElementById("root");
  if (container) {
    container.innerHTML = `<div style="padding:16px;font-family:sans-serif;color:#f55;background:#1a1a1a">
      <h2>Unhandled Promise rejection</h2>
      <pre>${event.reason ? JSON.stringify(event.reason, null, 2) : ""}</pre>
    </div>`;
  }
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);