type IconProps = { size?: number; className?: string; filled?: boolean };

export function HeartIcon({ size = 20, className, filled }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

export function ArrowIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function PlusIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className={className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function SearchIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

export function DiscordIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.5 5.34A16.3 16.3 0 0 0 15.44 4l-.5 1.03a15.08 15.08 0 0 0-5.86 0L8.56 4A16.5 16.5 0 0 0 4.5 5.35C1.93 9.16 1.23 12.9 1.58 16.6a16.7 16.7 0 0 0 4.98 2.52l1.2-1.64c-.66-.25-1.3-.56-1.88-.92l.46-.36c3.63 1.68 7.57 1.68 11.16 0l.46.36c-.6.36-1.23.67-1.9.92l1.2 1.64a16.6 16.6 0 0 0 4.98-2.52c.42-4.28-.72-7.98-2.74-11.26ZM8.42 14.38c-1.1 0-2-1-2-2.22s.88-2.22 2-2.22c1.13 0 2.02 1 2 2.22 0 1.22-.88 2.22-2 2.22Zm7.16 0c-1.1 0-2-1-2-2.22s.88-2.22 2-2.22c1.13 0 2.02 1 2 2.22 0 1.22-.87 2.22-2 2.22Z" />
    </svg>
  );
}

export function SparkIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m12 3-1.4 4.2a5 5 0 0 1-3.2 3.2L3 12l4.4 1.6a5 5 0 0 1 3.2 3.2L12 21l1.4-4.2a5 5 0 0 1 3.2-3.2L21 12l-4.4-1.6a5 5 0 0 1-3.2-3.2L12 3Z" />
    </svg>
  );
}
