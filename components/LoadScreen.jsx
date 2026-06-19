"use client";

import { useEffect } from "react";

export default function LoadScreen() {
  useEffect(() => {
    let activeRequests = 0;

    window.activateLoadScreen = () => {
      activeRequests += 1;
      document.getElementById("loadscreen")?.classList.add("active");
    };

    window.deactivateLoadScreen = () => {
      activeRequests = Math.max(0, activeRequests - 1);
      if (activeRequests === 0) {
        document.getElementById("loadscreen")?.classList.remove("active");
      }
    };

    return () => {
      delete window.activateLoadScreen;
      delete window.deactivateLoadScreen;
    };
  }, []);

  return (
    <div id="loadscreen" className="loading-overlay">
      <div className="lab-loader">
        <svg viewBox="0 0 100 140" className="flask" aria-hidden="true">
          <defs>
            <clipPath id="flask-clip">
              <path d="M35 10 H65 V45 C65 55, 80 80, 80 100 C80 125, 20 125, 20 100 C20 80, 35 55, 35 45 Z" />
            </clipPath>
          </defs>
          <path d="M35 10 H65 V45 C65 55, 80 80, 80 100 C80 125, 20 125, 20 100 C20 80, 35 55, 35 45 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
          <g clipPath="url(#flask-clip)">
            <rect className="liquid-level" x="0" y="140" width="100" height="140" />
          </g>
          <path fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" d="M35 10 H65 V45 C65 55, 80 80, 80 100 C80 125, 20 125, 20 100 C20 80, 35 55, 35 45 Z" />
        </svg>
      </div>
    </div>
  );
}
