import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme before render to avoid flash
const theme = localStorage.getItem("econology_theme");
if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark");
}

// Track first visit for days active
if (!localStorage.getItem("econology_first_visit")) {
  localStorage.setItem("econology_first_visit", new Date().toISOString());
}

createRoot(document.getElementById("root")!).render(<App />);

