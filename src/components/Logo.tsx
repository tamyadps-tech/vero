export function LogoMark({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="12" fill="var(--color-primary)" />
      <path
        d="M11 13l9 15 9-15"
        stroke="var(--color-paper)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="29.5" cy="12.5" r="2.5" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="font-display text-[1.75rem] font-semibold leading-none tracking-tight text-ink">
        Vero
      </span>
    </span>
  );
}
