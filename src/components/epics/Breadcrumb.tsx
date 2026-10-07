import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const base = 'text-xs leading-4 font-bold tracking-[1.2px] uppercase';

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`items-center gap-2 ${className}`}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={`${base} text-[#737685] hover:underline`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                className={`${base} ${isLast ? 'text-[#003D9B]' : 'text-[#737685]'}`}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <span aria-hidden className={`${base} text-[#737685]`}>
                &gt;
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
