'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import BookingCard from '@/components/BookingCard';
import Modal from '@/components/Modal';
import type { Booking, Car, BookingForm, ServiceType } from '@/types';

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'oil-change', label: 'Oil Change' },
  { value: 'tire-rotation', label: 'Tire Rotation' },
  { value: 'brake-inspection', label: 'Brake Inspection' },
  { value: 'full-service', label: 'Full Service' },
  { value: 'battery-check', label: 'Battery Check' },
];

const EMPTY_FORM: BookingForm = {
  carId: '', serviceType: '', scheduledDate: '', notes: '', estimatedCost: '',
};

export default function BookingsPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login');
  }, [isLoading, isAuthenticated, router]);

  const fetchBookings = useCallback(async () => {
    // TODO
    setIsFetching(false);
  }, [page]);

  const fetchCars = useCallback(async () => {
    // TODO
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
      fetchCars();
    }
  }, [isAuthenticated, fetchBookings, fetchCars]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO
  };

  if (isLoading || isFetching) return <div className="rt-loading">Loading bookings...</div>;

  return (
    <div className="rt-page">
      <div className="rt-page-header">
        <div>
          <h1 className="rt-page-title" style={{ margin: 0 }}>My Bookings</h1>
          {total > 0 && (
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              {total} booking{total !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
        <button className="rt-btn rt-btn--primary" onClick={() => setIsModalOpen(true)}>
          + Book Service
        </button>
      </div>

      {error && <div className="rt-error-banner">{error}</div>}

      {bookings.length === 0 ? (
        <div className="rt-empty">
          <h3>No bookings yet</h3>
          <p>Book a service for one of your cars to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="rt-pagination">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>← Prev</button>
          <span className="rt-pagination__info">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>Next →</button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setForm(EMPTY_FORM); setFormError(''); }}
        title="Book a service"
      >
        {formError && <div className="rt-error-banner">{formError}</div>}
        <form onSubmit={handleCreateBooking} className="rt-form">
          <div className="rt-form-group">
            <label>Car</label>
            <select name="carId" value={form.carId} onChange={handleFormChange} required>
              <option value="">Select a car...</option>
              {cars.map((car) => (
                <option key={car._id} value={car._id}>
                  {car.year} {car.make} {car.model} — {car.registrationNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="rt-form-group">
            <label>Service type</label>
            <select name="serviceType" value={form.serviceType} onChange={handleFormChange} required>
              <option value="">Select service...</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="rt-form-row">
            <div className="rt-form-group">
              <label>Date</label>
              <input name="scheduledDate" type="date" value={form.scheduledDate} onChange={handleFormChange} required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="rt-form-group">
              <label>Est. cost (₹)</label>
              <input name="estimatedCost" type="number" value={form.estimatedCost} onChange={handleFormChange} placeholder="0" min="0" />
            </div>
          </div>
          <div className="rt-form-group">
            <label>Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleFormChange} placeholder="Any special instructions..." rows={2} maxLength={500} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="rt-btn rt-btn--primary" disabled={isSaving} style={{ flex: 1 }}>
              {isSaving ? 'Booking...' : 'Confirm Booking'}
            </button>
            <button type="button" className="rt-btn rt-btn--secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
