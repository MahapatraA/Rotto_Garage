import type { Booking, Car } from '@/types';

interface BookingCardProps {
  booking: Booking;
  onStatusChange?: (id: string, status: Booking['status']) => void;
}

const getCar = (booking: Booking): Car | null => {
  if (booking.carId && typeof booking.carId === 'object') {
    return booking.carId as Car;
  }
  return null;
};

const STATUS_LABELS: Record<Booking['status'], string> = {
  pending:      'Pending',
  confirmed:    'Confirmed',
  'in-progress': 'In Progress',
  completed:    'Completed',
  cancelled:    'Cancelled',
};

export default function BookingCard({ booking, onStatusChange }: BookingCardProps) {
  const car = getCar(booking);

  const formattedService = booking.serviceType.replace(/-/g, ' ');

  const formattedDate = new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });

  return (
    <div className="rt-booking-card">
      <div className="rt-booking-card__header">
        <div>
          <p className="rt-booking-card__service">{formattedService}</p>
          <p className="rt-booking-card__date">{formattedDate}</p>
        </div>
        <span className={`rt-booking-status rt-booking-status--${booking.status}`}>
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      {car && (
        <p className="rt-booking-card__car">
          {car.year} {car.make} {car.model} — {car.registrationNumber}
        </p>
      )}

      {booking.estimatedCost > 0 && (
        <p className="rt-booking-card__cost">
          Est. cost: ₹{booking.estimatedCost.toLocaleString('en-IN')}
        </p>
      )}

      {booking.notes && (
        <p className="rt-booking-card__cost" style={{ marginTop: '0.25rem' }}>
          {booking.notes}
        </p>
      )}

      {onStatusChange && booking.status !== 'completed' && booking.status !== 'cancelled' && (
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {booking.status === 'pending' && (
            <>
              <button
                className="rt-btn rt-btn--primary"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                onClick={() => onStatusChange(booking._id, 'confirmed')}
              >
                Confirm
              </button>
              <button
                className="rt-btn rt-btn--danger"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                onClick={() => onStatusChange(booking._id, 'cancelled')}
              >
                Cancel
              </button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <>
              <button
                className="rt-btn rt-btn--primary"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                onClick={() => onStatusChange(booking._id, 'in-progress')}
              >
                Start
              </button>
              <button
                className="rt-btn rt-btn--danger"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                onClick={() => onStatusChange(booking._id, 'cancelled')}
              >
                Cancel
              </button>
            </>
          )}
          {booking.status === 'in-progress' && (
            <>
              <button
                className="rt-btn rt-btn--primary"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                onClick={() => onStatusChange(booking._id, 'completed')}
              >
                Mark Complete
              </button>
              <button
                className="rt-btn rt-btn--danger"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                onClick={() => onStatusChange(booking._id, 'cancelled')}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}