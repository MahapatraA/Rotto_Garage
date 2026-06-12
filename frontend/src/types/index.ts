// ─── Domain types ─────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Car {
  _id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  createdAt: string;
  updatedAt: string;
}

export type ServiceType =
  | 'oil-change'
  | 'tire-rotation'
  | 'brake-inspection'
  | 'full-service'
  | 'battery-check';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export interface Booking {
  _id: string;
  userId: string | User;
  carId: string | Car;
  serviceType: ServiceType;
  scheduledDate: string;
  status: BookingStatus;
  notes?: string;
  estimatedCost: number;
  createdAt: string;
  updatedAt: string;
}

// ─── API response envelope ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Form types ───────────────────────────────────────────────────────────────

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export interface CarForm {
  make: string;
  model: string;
  year: string;
  registrationNumber: string;
  fuelType: Car['fuelType'] | '';
}

export interface BookingForm {
  carId: string;
  serviceType: ServiceType | '';
  scheduledDate: string;
  notes: string;
  estimatedCost: string;
}
