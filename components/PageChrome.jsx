import PopupRuntime from "./PopupRuntime";
import Image from "next/image";

export default function PageChrome({ userEmail, children }) {
  return (
    <>
      <PopupRuntime />
      <header className="app-header">
        <div className="login-brand" style={{ margin: 0 }}>
          <Image
            src="/favicon.jpg"
            alt="IFC"
            width={120}
            height={120}
            className="login-mark"
          />
        <div>
          <p className="app-eyebrow">International Foods Control</p>
          <h2>P. Gestión de análisis</h2>
        </div>
      </div>
        <div className="top-bar-grid">
          <div className="user-info">{userEmail}</div>
          <form action="/api/logout" method="POST">
            <button id="logout-btn" type="submit" className="logout-btn">
              Logout
            </button>
          </form>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="footer">
        &copy; 2026 International Foods Control, México
      </footer>
    </>
  );
}
