'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import CarCard from '@/components/CarCard';
import Modal from '@/components/Modal';
import type { Car, CarForm } from '@/types';

const EMPTY_CAR_FORM: CarForm = {
  make: '', model: '', year: '', registrationNumber: '', fuelType: '',
};

export default function CarsPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CarForm>(EMPTY_CAR_FORM);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login');
  }, [isLoading, isAuthenticated, router]);

  const fetchCars = useCallback(async () => {
    // TODO
    setIsFetching(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchCars();
  }, [isAuthenticated, fetchCars]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO
  };

  const handleDeleteCar = async (id: string) => {
    // TODO
  };

  if (isLoading || isFetching) return <div className="rt-loading">Loading your cars...</div>;

  return (
    <div className="rt-page">
      <div className="rt-page-header">
        <h1 className="rt-page-title" style={{ margin: 0 }}>My Cars</h1>
        <button className="rt-btn rt-btn--primary" onClick={() => setIsModalOpen(true)}>
          + Add Car
        </button>
      </div>

      {error && <div className="rt-error-banner">{error}</div>}

      {cars.length === 0 ? (
        <div className="rt-empty">
          <h3>No cars yet</h3>
          <p>Add your first car to start booking services.</p>
        </div>
      ) : (
        <div className="rt-cars-grid">
          {cars.map((car) => (
            <CarCard key={car._id} car={car} onDelete={handleDeleteCar} />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setForm(EMPTY_CAR_FORM); setFormError(''); }}
        title="Add a car"
      >
        {formError && <div className="rt-error-banner">{formError}</div>}
        <form onSubmit={handleAddCar} className="rt-form">
          <div className="rt-form-row">
            <div className="rt-form-group">
              <label>Make</label>
              <input name="make" value={form.make} onChange={handleFormChange} placeholder="Toyota" required />
            </div>
            <div className="rt-form-group">
              <label>Model</label>
              <input name="model" value={form.model} onChange={handleFormChange} placeholder="Camry" required />
            </div>
          </div>
          <div className="rt-form-row">
            <div className="rt-form-group">
              <label>Year</label>
              <input name="year" type="number" value={form.year} onChange={handleFormChange} placeholder="2020" required />
            </div>
            <div className="rt-form-group">
              <label>Fuel type</label>
              <select name="fuelType" value={form.fuelType} onChange={handleFormChange} required>
                <option value="">Select...</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          <div className="rt-form-group">
            <label>Registration number</label>
            <input name="registrationNumber" value={form.registrationNumber} onChange={handleFormChange} placeholder="TN01AB1234" required style={{ textTransform: 'uppercase' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="rt-btn rt-btn--primary" disabled={isSaving} style={{ flex: 1 }}>
              {isSaving ? 'Saving...' : 'Add Car'}
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
