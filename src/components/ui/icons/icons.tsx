import type { SVGProps } from 'react';

/** Any SVG attribute: `width`, `height`, `className`, ... Icons are 20px by default. */
export type IconProps = SVGProps<SVGSVGElement>;

function Stroke({ children, ...props }: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Stroke>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    </Stroke>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Stroke>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </Stroke>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Stroke>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="m6 9 6 6 6-6" />
    </Stroke>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 5v14M5 12h14" />
    </Stroke>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="m10 16-4-4 4-4M6 12h10" />
    </Stroke>
  );
}

/** Verified-store seal. Takes the accent colour by default. */
export function SealIcon({ className, ...props }: IconProps) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className ?? 'text-accent'}
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="m8 12.2 2.6 2.6L16 9.4"
        fill="none"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarIcon({
  filled = true,
  ...props
}: IconProps & {
  /**
   * Solid star when true, outline when false.
   * @default true
   */
  filled?: boolean;
}) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <path
        d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
      <circle cx="7" cy="17.5" r="1.75" />
      <circle cx="17.5" cy="17.5" r="1.75" />
    </Stroke>
  );
}

export function ReturnIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </Stroke>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Stroke>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Stroke>
  );
}

export function GiftIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13" />
      <path d="M12 7c-1.5-3-5-3.5-5-1.25S10 7 12 7Zm0 0c1.5-3 5-3.5 5-1.25S14 7 12 7Z" />
    </Stroke>
  );
}
