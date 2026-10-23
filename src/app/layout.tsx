import type { Metadata } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { Toaster } from 'sonner';
import { RecoveryLinkHandler } from '@/src/components/auth/RecoveryLinkHandler';
import './globals.css';

export const metadata: Metadata = {
  title: 'Taskly',
  description: 'Tasks management application.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <RecoveryLinkHandler />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
