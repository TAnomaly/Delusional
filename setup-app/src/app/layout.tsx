import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Delusional — Built for the curious",
  description: "AI-powered Digital Brain with an immersive experience.",
};

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    <path d="M2 12h20"/>
  </svg>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className={styles.navbar}>
          <div className={`${styles.navInner} liquid-glass`}>
            <div className={styles.leftGroup}>
              <Link href="/" className={styles.brand}>
                <GlobeIcon />
                <span>delusional</span>
              </Link>
              <div className={styles.navLinks}>
                <Link href="/" className={styles.navLink}>Chat</Link>
                <Link href="/board" className={styles.navLink}>Board</Link>
                <Link href="/notes" className={styles.navLink}>Notes</Link>
              </div>
            </div>
            <div className={styles.rightActions}>
              <button className={styles.textBtn}>Pro</button>
              <Link href="/settings" className={`${styles.glassBtn} liquid-glass`}>
                Settings
              </Link>
            </div>
          </div>
        </nav>

        <main className={styles.main}>
          {children}
        </main>
      </body>
    </html>
  );
}
