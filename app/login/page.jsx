import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        <LoginForm />
        <p className="login-footer">&copy; 2026 International Foods Control</p>
      </section>
    </main>
  );
}
