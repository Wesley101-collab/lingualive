import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/speaker', icon: '🎤', label: 'Live Speaker', desc: 'Start speaking' },
  { href: '/viewer', icon: '👁️', label: 'Viewer', desc: 'Watch captions' },
  { href: '/upload', icon: '📁', label: 'Upload', desc: 'Analyze files' },
  { href: '/history', icon: '📋', label: 'History', desc: 'Past sessions' },
];

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Hide sidebar on landing page
  const isLandingPage = router.pathname === '/';

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.body.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  const closeSidebar = () => setSidebarOpen(false);

  // Landing page - no layout wrapper
  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.layout}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button 
          className={styles.menuBtn}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <span className={styles.menuIcon}>☰</span>
        </button>
        <Link href="/" className={styles.mobileLogo}>
          <span className={styles.logoIcon}>🌐</span>
          <span>LinguaLive</span>
        </Link>
        <button 
          className={styles.themeBtn}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo} onClick={closeSidebar}>
            <span className={styles.logoIcon}>🌐</span>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>LinguaLive</span>
              <span className={styles.logoSub}>Real-time Captions</span>
            </div>
          </Link>
          <button 
            className={styles.closeBtn}
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${router.pathname === item.href ? styles.navActive : ''}`}
              onClick={closeSidebar}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <div className={styles.navText}>
                <span className={styles.navLabel}>{item.label}</span>
                <span className={styles.navDesc}>{item.desc}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.themeToggle} onClick={toggleTheme}>
            <span>{isDark ? '☀️' : '🌙'}</span>
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <Link href="/" className={styles.homeLink}>
            ← Back to Home
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}

export { Layout };
