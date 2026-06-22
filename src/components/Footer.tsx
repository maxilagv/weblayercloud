"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/LangContext";
import LcGlyph from "./LcGlyph";

export default function Footer() {
  const { t } = useLang();
  const pathname = usePathname();

  // Compact footer is used on contact pages.
  const isCompact = pathname === "/contacto";

  return (
    <footer className="footer">
      <div className="wrap">
        {!isCompact && (
          <div className="footer-grid">
            <div>
              <Link href="/" className="brand" aria-label="LayerCloud">
                <LcGlyph width={28} height={28} />
                <span className="name">
                  <b>Layer</b>
                  <span>Cloud</span>
                </span>
              </Link>
              <p className="blurb">
                {t(
                  "Equipo boutique de ingeniería que construye software a medida, capa por capa.",
                  "A boutique engineering team building custom software, layer by layer."
                )}
              </p>
            </div>
            <div>
              <h5>{t("Soluciones", "Solutions")}</h5>
              <ul>
                <li>
                  <Link href="/servicios/web">{t("Webs y comercio", "Web & commerce")}</Link>
                </li>
                <li>
                  <Link href="/servicios/crm">CRM / ERP</Link>
                </li>
                <li>
                  <Link href="/servicios/campus">{t("Campus virtual", "Virtual campus")}</Link>
                </li>
                <li>
                  <Link href="/servicios/ia">{t("Automatización IA", "AI automation")}</Link>
                </li>
              </ul>
            </div>
            <div>
              <h5>{t("Empresa", "Company")}</h5>
              <ul>
                <li>
                  <Link href="/servicios">{t("Soluciones", "Solutions")}</Link>
                </li>
                <li>
                  <Link href="/contacto">{t("Contacto", "Contact")}</Link>
                </li>
              </ul>
            </div>
            <div>
              <h5>{t("Contacto", "Contact")}</h5>
              <ul>
                <li>
                  <a href="mailto:soporte@weblayer.cloud">soporte@weblayer.cloud</a>
                </li>
                <li>
                  <a href="#">{t("Buenos Aires — Remoto", "Buenos Aires — Remote")}</a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {isCompact && (
          <div style={{ marginBottom: "20px" }}>
            <Link href="/" className="brand" aria-label="LayerCloud">
              <LcGlyph width={28} height={28} />
              <span className="name">
                <b>Layer</b>
                <span>Cloud</span>
              </span>
            </Link>
          </div>
        )}

        <div className={`footer-bottom ${isCompact ? "compact-border" : ""}`} style={isCompact ? { marginTop: 0, paddingTop: 0, borderTop: "none" } : {}}>
          <small>
            © {new Date().getFullYear()} LayerCloud. {t("Todos los derechos reservados.", "All rights reserved.")}
          </small>
          <div className="footer-social">
            <a href="#" aria-label="LinkedIn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.46v6.28z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="3.6" />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" aria-label="GitHub">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9v2.81c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
