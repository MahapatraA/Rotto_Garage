import type { Metadata } from 'next';
import '../styles/globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Rotto Garage',
  description: 'Car Service Booking Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
