"use client";

import { useEffect } from "react";

export default function LoginError() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const box = document.getElementById("error");
    if (error && box) {
      box.textContent = error;
      box.classList.remove("hidden");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return <div id="error" className="error-box hidden" />;
}
