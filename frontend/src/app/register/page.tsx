'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { RegisterForm } from '@/types';

export default function RegisterPage() {
  const { login } = useAuth();
  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ Correctly prevents page refresh
    setError('');
    setIsLoading(true);

    try {
      const data = await api.post('/auth/register', form);
      if (data.success) {
        login(data.data.token, data.data.user);
      } else {
        setError(data.error?.message || 'Registration failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rt-auth-container">
      <div className="rt-auth-card">
        <h1>Create account</h1>
        <p>Sign up to manage your car services</p>

        {error && <div className="rt-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="rt-form">
          <div className="rt-form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              autoComplete="name"
            />
          </div>

          <div className="rt-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="rt-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="rt-btn rt-btn--primary rt-btn--full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="rt-auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
