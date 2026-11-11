import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export default function ProductNotFound() {
  return (
    <Container className="flex flex-col items-start gap-5 py-24 sm:py-32">
      <p className="text-sm font-medium text-muted">Product not found</p>
      <h1 className="max-w-[18ch] font-display text-[clamp(40px,6vw,72px)] leading-none tracking-[-0.02em]">
        This product isn&apos;t on Daylight right now
      </h1>
      <p className="max-w-[52ch] text-base leading-[1.6] text-body">
        The store may have taken it down, or the link may be wrong. Plenty more
        from verified stores is waiting in the shop.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/products" className={buttonClasses()}>
          Browse the shop
        </Link>
        <Link href="/" className={buttonClasses({ variant: 'secondary' })}>
          Go home
        </Link>
      </div>
    </Container>
  );
}
