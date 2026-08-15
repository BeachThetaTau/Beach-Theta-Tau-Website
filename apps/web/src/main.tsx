import React from "react";
import ReactDOM from "react-dom/client";
import "./shared/styles/tailwind.css";
import App from "./app/App";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element.");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
