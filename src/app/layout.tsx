import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jira Project Dashboard',
  description: 'AI-powered project management dashboard with forecasting',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
