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

// TODO: implement this component
// Use the CSS classes in globals.css:
//   .rt-booking-card, .rt-booking-card__header, .rt-booking-card__service,
//   .rt-booking-card__date, .rt-booking-card__car, .rt-booking-status,
//   .rt-booking-status--{pending|confirmed|in-progress|completed|cancelled}
export default function BookingCard({ booking }: BookingCardProps) {
  const car = getCar(booking);

  return (
    <div className="rt-booking-card">
      {/* TODO */}
    </div>
  );
}
