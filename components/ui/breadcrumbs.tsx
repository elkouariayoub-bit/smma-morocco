import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-slate-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <Link href={item.href} className="transition-base hover:text-slate-900">
                {item.label}
              </Link>
            ) : (
              <span className={cn('capitalize', isLast ? 'text-slate-700 font-medium' : undefined)}>{item.label}</span>
            )}
            {!isLast && <span className="text-slate-300">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
