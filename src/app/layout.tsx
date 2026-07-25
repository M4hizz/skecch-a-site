import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Napkin-to-App (Vibe Studio)',
  description: 'Convert hand-drawn napkin wireframes into functional apps instantly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
