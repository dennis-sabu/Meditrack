'use client';

import ChatWidget from './ChatWidget';
import { usePathname } from 'next/navigation';

export default function ChatWidgetContainer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/auth')) return null;
  return <ChatWidget />;
}