'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (href: string) => pathname === href;

  // Don't show nav on auth pages
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="rt-navbar">
      <div className="rt-navbar__inner">
        <Link href="/" className="rt-navbar__logo">
          rotto garage
        </Link>

        {isAuthenticated ? (
          <div className="rt-navbar__nav">
            <Link
              href="/dashboard"
              className={`rt-navbar__link${isActive('/dashboard') ? ' active' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              href="/cars"
              className={`rt-navbar__link${isActive('/cars') ? ' active' : ''}`}
            >
              Cars
            </Link>
            <Link
              href="/bookings"
              className={`rt-navbar__link${isActive('/bookings') ? ' active' : ''}`}
            >
              Bookings
            </Link>
            <span className="rt-navbar__user">{user?.name}</span>
            <button
              onClick={logout}
              className="rt-btn rt-btn--secondary"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="rt-navbar__nav">
            <Link href="/login" className="rt-navbar__link">Sign in</Link>
            <Link href="/register" className="rt-btn rt-btn--primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem', textDecoration: 'none' }}>
              Get started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
