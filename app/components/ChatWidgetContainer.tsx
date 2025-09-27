'use client';

import ChatWidget from './ChatWidget';
import { usePathname } from 'next/navigation';

export default function ChatWidgetContainer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/signin')) return null;
  return <ChatWidget />;
}