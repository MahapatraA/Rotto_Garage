'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Booking } from '@/types';

interface Stats {
  totalCars: number;
  totalBookings: number;
  pendingBookings: number;
  upcomingBooking: Booking | null;
}

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    upcomingBooking: null,
  });
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // TODO: fetch stats from /api/cars and /api/bookings/my
    const fetchStats = async () => {
      setIsFetching(false);
    };

    fetchStats();
  }, [isAuthenticated]);

  if (isLoading || isFetching) return <div className="rt-loading">Loading dashboard...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="rt-page">
      <h1 className="rt-page-title">Hello, {user?.name} 👋</h1>

      <div className="rt-stats-grid">
        <div className="rt-stat-card">
          <span className="rt-stat-card__value">{stats.totalCars}</span>
          <span className="rt-stat-card__label">My Cars</span>
        </div>
        <div className="rt-stat-card">
          <span className="rt-stat-card__value">{stats.totalBookings}</span>
          <span className="rt-stat-card__label">Total Bookings</span>
        </div>
        <div className="rt-stat-card">
          <span className="rt-stat-card__value">{stats.pendingBookings}</span>
          <span className="rt-stat-card__label">Pending</span>
        </div>
      </div>

      {stats.upcomingBooking && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Upcoming Service
          </h2>
          <div className="rt-booking-card" style={{ maxWidth: '400px' }}>
            <p className="rt-booking-card__service">
              {stats.upcomingBooking.serviceType.replace(/-/g, ' ')}
            </p>
            <p className="rt-booking-card__date">
              {new Date(stats.upcomingBooking.scheduledDate).toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
            <span className={`rt-booking-status rt-booking-status--${stats.upcomingBooking.status}`}>
              {stats.upcomingBooking.status}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/cars" className="rt-btn rt-btn--primary">Manage Cars</Link>
        <Link href="/bookings" className="rt-btn rt-btn--secondary">View Bookings</Link>
      </div>
    </div>
  );
}
