import LoginError from "@/components/LoginError";
import Image from "next/image";

export const metadata = {
  title: "International Foods Control - Login"
};

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <Image
            src="/favicon.jpg"
            alt="IFC"
            width={120}
            height={120}
            className="login-mark"
          />
          <div>
            <p className="app-eyebrow">International Foods Control</p>
            <h1 id="login-title">P. Gestión de análisis</h1>
          </div>
        </div>
        <form action="/api/login" method="POST" className="login-form">
          <label>
            Email
            <input name="email" type="email" placeholder="usuario@empresa.com" autoComplete="email" required />
          </label>
          <label>
            Password
            <input type="password" name="password" placeholder="Tu contraseña" autoComplete="current-password" required />
          </label>
          <button type="submit">Entrar</button>
        </form>
        <LoginError />
        <p className="login-footer">&copy; 2026 International Foods Control</p>
      </section>
    </main>
  );
}
