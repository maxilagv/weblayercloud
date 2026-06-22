"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";
import LcGlyph from "./LcGlyph";

interface NavbarProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export default function Navbar({ onMenuToggle, isMenuOpen }: NavbarProps) {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`} data-nav="">
      <div className="wrap">
        <div className="nav-inner">
          <Link href="/" className="brand" aria-label={t("LayerCloud inicio", "LayerCloud home")}>
            <LcGlyph />
            <span className="name">
              <b>Layer</b>
              <span>Cloud</span>
            </span>
          </Link>
          <div className="nav-links">
            <div className="nav-dropdown">
              <button className="nd-trigger" aria-haspopup="true">
                {t("Servicios", "Services")}{" "}
                <svg className="nd-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="nd-panel" role="menu">
                <Link href="/servicios/web" className="nd-item" role="menuitem">
                  <span className="nd-ic" style={{ background: "var(--violet)" }}>&#9671;</span>
                  <span className="nd-tx">
                    <span className="nd-t">{t("Webs y comercio", "Web & Commerce")}</span>
                    <span className="nd-s">{t("Landings, e-commerce, embudos", "Landings, e-commerce, funnels")}</span>
                  </span>
                </Link>
                <Link href="/servicios/crm" className="nd-item" role="menuitem">
                  <span className="nd-ic" style={{ background: "var(--indigo)" }}>&#9636;</span>
                  <span className="nd-tx">
                    <span className="nd-t">CRM / ERP</span>
                    <span className="nd-s">{t("Pipelines, dashboards, IA", "Pipelines, dashboards, AI")}</span>
                  </span>
                </Link>
                <Link href="/servicios/campus" className="nd-item" role="menuitem">
                  <span className="nd-ic" style={{ background: "var(--coral)" }}>&#9678;</span>
                  <span className="nd-tx">
                    <span className="nd-t">{t("Campus virtual", "Virtual Campus")}</span>
                    <span className="nd-s">{t("Roles, notas, notificaciones", "Roles, grades, notifications")}</span>
                  </span>
                </Link>
                <Link href="/servicios/ia" className="nd-item" role="menuitem">
                  <span className="nd-ic" style={{ background: "var(--amber)" }}>&#10022;</span>
                  <span className="nd-tx">
                    <span className="nd-t">{t("Automatización IA", "AI Automation")}</span>
                    <span className="nd-s">{t("Agentes, flujos, integraciones", "Agents, flows, integrations")}</span>
                  </span>
                </Link>
                <div className="nd-sep"></div>
                <Link href="/servicios" className="nd-item" role="menuitem">
                  <span className="nd-ic" style={{ background: "var(--paper-ink)" }}>&#9672;</span>
                  <span className="nd-tx">
                    <span className="nd-t">{t("Ver todas las soluciones", "All solutions")}</span>
                    <span className="nd-s">{t("Explorador + constructor + matriz", "Explorer + builder + matrix")}</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <div className="nav-right">
            <div className="lang-toggle" role="group" aria-label={t("Idioma", "Language")}>
              <button aria-pressed={lang === "es"} onClick={() => setLang("es")}>
                ES
              </button>
              <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>
                EN
              </button>
            </div>
            <Link href="/contacto" className="btn">
              {t("Iniciar proyecto", "Start project")}{" "}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <button 
              className={`burger ${isMenuOpen ? "open" : ""}`} 
              data-burger="" 
              aria-label={t("Menú", "Menu")}
              onClick={onMenuToggle}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
