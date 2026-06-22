"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t } = useLang();

  useEffect(() => {
    // Add/remove class to burger button if it exists in DOM
    const burger = document.querySelector("[data-burger]");
    if (burger) {
      if (isOpen) {
        burger.classList.add("open");
      } else {
        burger.classList.remove("open");
      }
    }
    
    // Lock body scroll
    document.body.style.overflow = isOpen ? "hidden" : "";
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Click handler wrapper to ensure menu closes
  const handleClick = () => {
    onClose();
  };

  return (
    <div className={`mobile-menu ${isOpen ? "open" : ""}`} data-mobile-menu="">
      <Link href="/servicios/web" onClick={handleClick}>
        <span>01</span>
        <span>{t("Webs y comercio", "Web & Commerce")}</span>
      </Link>
      <Link href="/servicios/crm" onClick={handleClick}>
        <span>02</span>
        <span>CRM / ERP</span>
      </Link>
      <Link href="/servicios/campus" onClick={handleClick}>
        <span>03</span>
        <span>{t("Campus virtual", "Virtual Campus")}</span>
      </Link>
      <Link href="/servicios/ia" onClick={handleClick}>
        <span>04</span>
        <span>{t("Automatización IA", "AI Automation")}</span>
      </Link>
      <Link href="/servicios" onClick={handleClick}>
        <span>05</span>
        <span>{t("Todas las soluciones", "All solutions")}</span>
      </Link>
      <Link href="/contacto" onClick={handleClick}>
        <span>06</span>
        <span>{t("Contacto", "Contact")}</span>
      </Link>
    </div>
  );
}
