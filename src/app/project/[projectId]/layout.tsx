import type { ReactNode } from 'react';
import CreateTaskModalProvider from '@/src/context/CreateTaskModalContext';

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return <CreateTaskModalProvider>{children}</CreateTaskModalProvider>;
}
