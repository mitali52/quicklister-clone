function BaseIcon({
  children,
  className = 'h-5 w-5',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function EyeIcon(props: { className?: string }) {
  return (
    <BaseIcon className={props.className}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </BaseIcon>
  );
}

export function ArrowCircleIcon(props: { className?: string }) {
  return (
    <BaseIcon className={props.className ?? 'h-5 w-5'}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8l4 4-4 4" />
    </BaseIcon>
  );
}

export function CheckCircleIcon(props: { className?: string }) {
  return (
    <BaseIcon className={props.className ?? 'h-5 w-5'}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </BaseIcon>
  );
}

export function MenuIcon(props: { className?: string }) {
  return (
    <BaseIcon className={props.className ?? 'h-7 w-7'}>
      <path d="M4 6h16" />
      <path d="M4 12h10" />
      <path d="M4 18h7" />
    </BaseIcon>
  );
}

export function StarIcon(props: { className?: string }) {
  return (
    <BaseIcon className={props.className ?? 'h-4 w-4'}>
      <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.8 6.2 20.8l1.1-6.4L2.6 9.8l6.5-.9L12 3Z" />
    </BaseIcon>
  );
}
