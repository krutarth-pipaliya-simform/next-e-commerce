import Link from 'next/link';
import { HomeSection } from '@/components/home/home-section';
import { SectionHeading } from '@/components/home/section-heading';

const colours = [
  { name: 'Tangerine', hex: '#FF6A2B' },
  { name: 'Bubblegum', hex: '#FF5DA2' },
  { name: 'Cobalt', hex: '#2747D9' },
  { name: 'Mint', hex: '#3FC9A0' },
  { name: 'Sunflower', hex: '#F5C242' },
  { name: 'Lilac', hex: '#A98BF0' },
  { name: 'Black', hex: '#1B1C1F' },
  { name: 'White', hex: '#F4F4F2' },
];

/**
 * Colour swatches. Each one opens the shop filtered to that colour
 * (matched against variant colours by the listing page).
 */
export function ColourShelf() {
  return (
    <HomeSection id="colour-heading">
      <SectionHeading
        id="colour-heading"
        title="Shop by colour"
        aside={
          <p className="max-w-[420px] text-[15px] leading-relaxed text-body">
            Pick a colour to see everything that comes in that shade.
          </p>
        }
      />
      <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-2">
        {colours.map(({ name, hex }) => (
          <li key={name}>
            <Link
              href={`/products?color=${name.toLowerCase()}`}
              className="group flex w-24 flex-col items-center gap-3 rounded-control py-2"
            >
              <span
                aria-hidden="true"
                className="size-16 rounded-full shadow-[inset_0_0_0_1px_rgb(17_18_20/0.08)] transition-shadow group-hover:shadow-[0_0_0_2px_var(--color-ground),0_0_0_4px_var(--color-ink)]"
                style={{
                  background: `radial-gradient(circle at 34% 28%, rgb(255 255 255 / 0.6) 0%, rgb(255 255 255 / 0) 42%), ${hex}`,
                }}
              />
              <span className="text-sm">{name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
