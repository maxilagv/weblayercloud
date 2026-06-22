import Link from "next/link";
import styles from "./not-found.module.css";
import LcGlyph from "@/components/LcGlyph";

export default function NotFound() {
  return (
    <main className={styles.container}>
      <div className={styles['err-glow']} aria-hidden="true"></div>
      <div className={styles['err-inner']}>
        <div className={styles['err-glyph']}>
          <LcGlyph width={52} height={52} />
        </div>
        <div className={styles['err-code']}>404</div>
        <div className={styles['err-label']}>Página no encontrada</div>
        <h1 className={styles['err-title']}>Esta capa no existe.</h1>
        <p className={styles['err-sub']}>
          La página que buscás no está disponible o fue movida. Volvé al inicio y encontrás todo lo que necesitás.
        </p>
        <div className={styles['err-btns']}>
          <Link href="/" className={styles['btn-home']}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Volver al inicio
          </Link>
          <Link href="/contacto" className={styles['btn-back-link']}>
            Contactar →
          </Link>
        </div>
      </div>
    </main>
  );
}
