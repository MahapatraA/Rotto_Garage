import type { Car } from '@/types';

interface CarCardProps {
  car: Car;
  onDelete?: (id: string) => void;
  onBook?: (car: Car) => void;
}

const FUEL_COLORS: Record<Car['fuelType'], string> = {
  petrol:   '#ef4444',
  diesel:   '#f97316',
  electric: '#22c55e',
  hybrid:   '#3b82f6',
};

export default function CarCard({ car, onDelete, onBook }: CarCardProps) {
  return (
    <div className="rt-car-card">
      <div className="rt-car-card__header">
        <div>
          <h3>{car.year} {car.make} {car.model}</h3>
          <span className="rt-car-card__reg">{car.registrationNumber}</span>
        </div>
        <span
          className="rt-car-card__fuel"
          style={{ backgroundColor: FUEL_COLORS[car.fuelType] }}
        >
          {car.fuelType}
        </span>
      </div>

      <div className="rt-car-card__actions">
        {onBook && (
          <button className="rt-btn rt-btn--primary" onClick={() => onBook(car)}>
            Book Service
          </button>
        )}
        {onDelete && (
          <button className="rt-btn rt-btn--danger" onClick={() => onDelete(car._id)}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
