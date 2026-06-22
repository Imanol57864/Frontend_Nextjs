"use client";

import { useEffect, useState } from "react";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setError(params.get("error") || "");
    if (params.has("error")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password")
        })
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "No fue posible iniciar sesión.");
        return;
      }

      window.location.assign(result.redirectTo);
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form action="/api/login" method="POST" className="login-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input name="email" type="email" placeholder="usuario@empresa.com" autoComplete="email" required />
        </label>
        <label>
          Password
          <input type="password" name="password" placeholder="Tu contraseña" autoComplete="current-password" required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Ingresando…" : "Entrar"}
        </button>
      </form>
      <div id="error" className={`error-box${error ? "" : " hidden"}`}>{error}</div>
    </>
  );
}
