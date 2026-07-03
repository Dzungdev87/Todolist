'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, Clock, BarChart2, List } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/doing', label: 'Đang làm', icon: Clock },
  { href: '/completed', label: 'Đã xong', icon: CheckSquare },
  { href: '/stats', label: 'Thống kê', icon: BarChart2 },
  { href: '/lists', label: 'Lists', icon: List },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 glass border-t border-[var(--color-border)] safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] ${
                active
                  ? 'text-[var(--color-brand-400)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  active ? 'bg-[var(--color-brand-500)]/20' : ''
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.75}
                  className={`transition-all duration-200 ${active ? 'scale-105' : ''}`}
                />
                {active && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--color-brand-400)] rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
