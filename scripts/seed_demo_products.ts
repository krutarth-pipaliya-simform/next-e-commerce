/**
 * Demo catalogue: five approved stores and 21 colourful products with
 * variants, photos and reviews, so the storefront has something to show.
 *
 *   npx tsx --env-file=.env scripts/seed_demo_products.ts           # (re)create
 *   npx tsx --env-file=.env scripts/seed_demo_products.ts --remove  # delete it all
 *
 * Writes to the real DATABASE_URL. Everything it creates hangs off users
 * with an @seed.daylight.test email, so re-running first deletes those users
 * (which cascades to their stores, products, reviews and any cart rows or
 * store orders that point at them) and then creates everything again.
 *
 * Photos are links to DummyJSON's free product images
 * (https://dummyjson.com/docs/products), allowed in next.config.ts.
 */
import { db } from '../src/lib/db';

const SEED_DOMAIN = '@seed.daylight.test';
const IMAGE_BASE = 'https://cdn.dummyjson.com/product-images';
const DAY = 24 * 60 * 60 * 1000;

const categories = [
  { slug: 'clothing', name: 'Clothing' },
  { slug: 'shirts', name: 'Shirts', parent: 'clothing' },
  { slug: 'dresses', name: 'Dresses', parent: 'clothing' },
  { slug: 'footwear', name: 'Footwear' },
  { slug: 'sneakers', name: 'Sneakers', parent: 'footwear' },
  { slug: 'heels', name: 'Heels', parent: 'footwear' },
  { slug: 'home-and-kitchen', name: 'Home and kitchen' },
  { slug: 'furniture', name: 'Furniture', parent: 'home-and-kitchen' },
  { slug: 'kitchen', name: 'Kitchen', parent: 'home-and-kitchen' },
  { slug: 'plants', name: 'Plants', parent: 'home-and-kitchen' },
  { slug: 'sports', name: 'Sports' },
  { slug: 'cricket', name: 'Cricket', parent: 'sports' },
  { slug: 'ball-and-racket', name: 'Ball and racket', parent: 'sports' },
  { slug: 'accessories', name: 'Accessories' },
  { slug: 'sunglasses', name: 'Sunglasses', parent: 'accessories' },
  { slug: 'bags', name: 'Bags', parent: 'accessories' },
  { slug: 'jewellery', name: 'Jewellery', parent: 'accessories' },
  { slug: 'beauty', name: 'Beauty' },
  { slug: 'makeup', name: 'Makeup', parent: 'beauty' },
];

const stores = [
  {
    slug: 'studio-loom',
    name: 'Studio Loom',
    owner: 'Nisha Pillai',
    description:
      'Printed shirts and easy dresses in loud colours, cut and sewn in small runs in Jaipur.',
  },
  {
    slug: 'stride-lab',
    name: 'Stride Lab',
    owner: 'Kiran Joshi',
    description:
      'Everyday sneakers and occasion shoes, made in small runs in Chennai.',
  },
  {
    slug: 'kitchen-form',
    name: 'Kitchen Form',
    owner: 'Leah Thomas',
    description:
      'Bright, hard-wearing things for the kitchen and the living room. Everything is designed to be repaired.',
  },
  {
    slug: 'sunday-club',
    name: 'Sunday Club',
    owner: 'Vikram Singh',
    description:
      'Kit for weekend cricket, tennis and the beach, tested on the maidans of Mumbai.',
  },
  {
    slug: 'glint-and-co',
    name: 'Glint & Co.',
    owner: 'Maya Okafor',
    description:
      'Playful sunglasses, bags, jewellery and colour for nails and eyes, picked by a small team in Pune.',
  },
];

type SeedProduct = {
  slug: string;
  name: string;
  store: string;
  category: string;
  price: number;
  description: string;
  /** DummyJSON image folder under product-images/, and how many numbered photos it has. */
  photos: { path: string; count: number };
  /** The colour in the photos. Products sold in one colour still get it as a variant. */
  colour?: string;
  /** Sizes, with an optional price difference. Omit for one-size products. */
  sizes?: { size: string; priceDiff?: number }[];
  /** Stock per size (or under "all" for one-size products); missing ones get 24. */
  stock?: Record<string, number>;
  /** Sold without variants, so it gets Quick add. */
  noVariants?: boolean;
  featured?: boolean;
  /** How long ago it was listed; under 14 days shows "New". */
  daysOld: number;
  /** Star ratings, one per reviewer, in reviewer order. */
  ratings: number[];
};

const shirtSizes = [
  { size: 'S' },
  { size: 'M' },
  { size: 'L' },
  { size: 'XL' },
  { size: 'XXL', priceDiff: 150 },
];
const dressSizes = [
  { size: 'XS' },
  { size: 'S' },
  { size: 'M' },
  { size: 'L' },
];

const products: SeedProduct[] = [
  // Studio Loom
  {
    slug: 'hibiscus-print-shirt',
    name: 'Hibiscus print shirt',
    store: 'studio-loom',
    category: 'shirts',
    price: 1499,
    description:
      'A short-sleeved camp-collar shirt in breezy cotton, printed with oversized hibiscus flowers. Cut straight to wear untucked.',
    photos: { path: 'mens-shirts/man-short-sleeve-shirt', count: 4 },
    colour: 'Blue',
    sizes: shirtSizes,
    stock: { S: 3, XXL: 0 },
    featured: true,
    daysOld: 4,
    ratings: [5, 5, 4, 5, 4, 5, 5],
  },
  {
    slug: 'buffalo-check-shirt',
    name: 'Buffalo check shirt',
    store: 'studio-loom',
    category: 'shirts',
    price: 1799,
    description:
      'A brushed-cotton overshirt in a bold red and black check, with two chest pockets and a curved hem. Warm enough to wear as a light jacket.',
    photos: { path: 'mens-shirts/man-plaid-shirt', count: 4 },
    colour: 'Red',
    sizes: shirtSizes,
    stock: { M: 0 },
    daysOld: 32,
    ratings: [4, 5, 4, 3, 4],
  },
  {
    slug: 'polka-dot-dress',
    name: 'Polka dot dress',
    store: 'studio-loom',
    category: 'dresses',
    price: 2299,
    description:
      'A twirly fit-and-flare dress in soft blue with hand-drawn dots, a fitted bodice and a full skirt that sits just above the knee.',
    photos: { path: 'tops/blue-frock', count: 4 },
    colour: 'Sky',
    sizes: dressSizes,
    stock: { XS: 2 },
    featured: true,
    daysOld: 9,
    ratings: [5, 5, 5, 4],
  },
  {
    slug: 'tiered-mini-dress',
    name: 'Tiered mini dress',
    store: 'studio-loom',
    category: 'dresses',
    price: 2499,
    description:
      'A strapless sage dress with a gathered waist, a soft tie and three tiers of skirt. Lined, with a hidden side zip.',
    photos: { path: 'tops/short-frock', count: 4 },
    colour: 'Sage',
    sizes: dressSizes,
    daysOld: 20,
    ratings: [4, 5, 4],
  },
  // Stride Lab
  {
    slug: 'arrow-court-sneaker',
    name: 'Arrow court sneaker',
    store: 'stride-lab',
    category: 'sneakers',
    price: 4999,
    description:
      'A chunky leather court sneaker with a red arrow on each side, a padded collar and a cupsole that lasts. Runs true to size.',
    photos: { path: 'mens-shoes/sports-sneakers-off-white-red', count: 4 },
    colour: 'White',
    sizes: [
      { size: 'EU 39' },
      { size: 'EU 40' },
      { size: 'EU 41' },
      { size: 'EU 42' },
      { size: 'EU 43' },
      { size: 'EU 44' },
    ],
    stock: { 'EU 39': 0, 'EU 43': 2 },
    featured: true,
    daysOld: 3,
    ratings: [5, 5, 4, 5, 5, 4, 5, 5],
  },
  {
    slug: 'rose-gold-pumps',
    name: 'Rose gold pumps',
    store: 'stride-lab',
    category: 'heels',
    price: 3499,
    description:
      'Pointed metallic pumps on a slim 9 cm heel, with a cushioned footbed for long evenings.',
    photos: { path: 'womens-shoes/golden-shoes-woman', count: 4 },
    colour: 'Rose gold',
    sizes: [
      { size: 'EU 36' },
      { size: 'EU 37' },
      { size: 'EU 38' },
      { size: 'EU 39' },
      { size: 'EU 40' },
    ],
    stock: { 'EU 36': 0, 'EU 40': 1 },
    daysOld: 45,
    ratings: [4, 3, 5],
  },
  // Kitchen Form
  {
    slug: 'tulip-swivel-chair',
    name: 'Tulip swivel chair',
    store: 'kitchen-form',
    category: 'furniture',
    price: 18999,
    description:
      'A sculpted shell chair upholstered in cherry-red wool, on a five-star swivel base with soft casters. Comfortable for long desk days.',
    photos: {
      path: 'furniture/knoll-saarinen-executive-conference-chair',
      count: 3,
    },
    colour: 'Cherry',
    stock: { all: 4 },
    featured: true,
    daysOld: 12,
    ratings: [5, 4, 5, 5, 4, 5],
  },
  {
    slug: 'rattan-egg-chair',
    name: 'Rattan egg chair',
    store: 'kitchen-form',
    category: 'furniture',
    price: 14999,
    description:
      'A hanging egg chair in hand-woven rattan with a deep white cushion, on a steel stand that needs no ceiling hook.',
    photos: { path: 'home-decoration/decoration-swing', count: 3 },
    colour: 'Black',
    daysOld: 60,
    ratings: [5, 4, 4],
  },
  {
    slug: 'mug-tree-stand',
    name: 'Mug tree stand',
    store: 'kitchen-form',
    category: 'kitchen',
    price: 1199,
    description:
      'A black steel mug tree that holds four mugs by their handles and takes up less counter space than a plate. Mugs not included.',
    photos: { path: 'kitchen-accessories/mug-tree-stand', count: 2 },
    noVariants: true,
    daysOld: 6,
    ratings: [5, 4],
  },
  {
    slug: 'citrus-squeezer',
    name: 'Citrus squeezer',
    store: 'kitchen-form',
    category: 'kitchen',
    price: 449,
    description:
      'A sunny yellow reamer on a steel bowl that catches the pips. Squeezes a lemon in two twists.',
    photos: { path: 'kitchen-accessories/citrus-squeezer-yellow', count: 1 },
    noVariants: true,
    daysOld: 25,
    ratings: [4, 5, 4, 4],
  },
  {
    slug: 'serving-tongs',
    name: 'Serving tongs',
    store: 'kitchen-form',
    category: 'kitchen',
    price: 299,
    description:
      'Steel tongs with red silicone tips that grip without scratching non-stick pans. They lock flat for the drawer.',
    photos: { path: 'kitchen-accessories/red-tongs', count: 1 },
    noVariants: true,
    daysOld: 40,
    ratings: [4],
  },
  {
    slug: 'potted-fern',
    name: 'Potted fern',
    store: 'kitchen-form',
    category: 'plants',
    price: 899,
    description:
      'A lush, easy-going fern in a matte charcoal pot. Happy in bright, indirect light with a drink once a week.',
    photos: { path: 'home-decoration/plant-pot', count: 4 },
    noVariants: true,
    daysOld: 2,
    ratings: [],
  },
  // Sunday Club
  {
    slug: 'club-cricket-helmet',
    name: 'Club cricket helmet',
    store: 'sunday-club',
    category: 'cricket',
    price: 2799,
    description:
      'A light sky-blue helmet with a steel grille, a padded liner that lifts out for washing and an adjustable chin strap.',
    photos: { path: 'sports-accessories/cricket-helmet', count: 4 },
    colour: 'Sky',
    sizes: [{ size: 'S' }, { size: 'M' }, { size: 'L' }],
    stock: { L: 0 },
    daysOld: 15,
    ratings: [5, 4, 5, 4, 5],
  },
  {
    slug: 'rally-tennis-racket',
    name: 'Rally tennis racket',
    store: 'sunday-club',
    category: 'ball-and-racket',
    price: 3299,
    description:
      'A forgiving graphite racket with a big sweet spot, strung and ready to play. A good first racket for club players.',
    photos: { path: 'sports-accessories/tennis-racket', count: 1 },
    colour: 'Red',
    sizes: [{ size: 'Grip 2' }, { size: 'Grip 3' }, { size: 'Grip 4' }],
    daysOld: 28,
    ratings: [4, 5, 4],
  },
  {
    slug: 'beach-volleyball',
    name: 'Beach volleyball',
    store: 'sunday-club',
    category: 'ball-and-racket',
    price: 999,
    description:
      'A soft-touch, stitched volleyball that is kind on the forearms. Holds its shape after a whole day on the sand.',
    photos: { path: 'sports-accessories/volleyball', count: 1 },
    noVariants: true,
    daysOld: 8,
    ratings: [5, 4],
  },
  // Glint & Co.
  {
    slug: 'mint-aviator-sunglasses',
    name: 'Mint aviator sunglasses',
    store: 'glint-and-co',
    category: 'sunglasses',
    price: 1299,
    description:
      'Classic aviators with mint-tinted UV400 lenses and a thin black metal frame. Comes with a soft pouch.',
    photos: { path: 'sunglasses/green-and-black-glasses', count: 3 },
    colour: 'Mint',
    stock: { all: 3 },
    featured: true,
    daysOld: 5,
    ratings: [5, 4, 5, 5],
  },
  {
    slug: 'pixel-party-glasses',
    name: 'Pixel party glasses',
    store: 'glint-and-co',
    category: 'sunglasses',
    price: 499,
    description:
      'Pink-lensed pixel glasses for parties, photo booths and pretending you meant it. Real UV protection, too.',
    photos: { path: 'sunglasses/party-glasses', count: 3 },
    noVariants: true,
    daysOld: 18,
    ratings: [5, 5, 4],
  },
  {
    slug: 'navy-tote-bag',
    name: 'Navy tote bag',
    store: 'glint-and-co',
    category: 'bags',
    price: 3999,
    description:
      'A structured tote in deep navy vegan leather, with rolled handles, a zipped inner pocket and room for a 13-inch laptop.',
    photos: { path: "womens-bags/blue-women's-handbag", count: 3 },
    colour: 'Navy',
    daysOld: 35,
    ratings: [4, 5, 5, 4],
  },
  {
    slug: 'monstera-leaf-earrings',
    name: 'Monstera leaf earrings',
    store: 'glint-and-co',
    category: 'jewellery',
    price: 899,
    description:
      'Light, hand-cut monstera leaves in a warm gold tone, on hypoallergenic posts.',
    photos: { path: 'womens-jewellery/tropical-earring', count: 3 },
    noVariants: true,
    daysOld: 10,
    ratings: [5, 4, 5],
  },
  {
    slug: 'cherry-nail-lacquer',
    name: 'Cherry nail lacquer',
    store: 'glint-and-co',
    category: 'makeup',
    price: 349,
    description:
      'A glossy, chip-resistant cherry red that covers in two coats and dries in about five minutes.',
    photos: { path: 'beauty/red-nail-polish', count: 1 },
    colour: 'Cherry',
    stock: { all: 0 },
    daysOld: 22,
    ratings: [5, 4],
  },
  {
    slug: 'sunset-eyeshadow-palette',
    name: 'Sunset eyeshadow palette',
    store: 'glint-and-co',
    category: 'makeup',
    price: 1199,
    description:
      'Eighteen buttery shades from soft peach to deep plum, in matte and shimmer, with a full-size mirror.',
    photos: { path: 'beauty/eyeshadow-palette-with-mirror', count: 1 },
    noVariants: true,
    featured: true,
    daysOld: 7,
    ratings: [5, 5, 4, 5],
  },
];

const reviewers = [
  'Priya Nair',
  'Arjun Mehta',
  'Sara Khan',
  'Rohan Das',
  'Meera Iyer',
  'Kabir Shah',
  'Ananya Rao',
  'Dev Patel',
  'Isha Gupta',
  'Neil Fernandes',
];

/** A comment per star rating; picked in turn so neighbouring reviews differ. */
const comments: Record<number, string[]> = {
  5: [
    'Exactly the colour in the photos. Arrived quickly and well packed.',
    'Better than I expected for the price. I have already ordered a second one as a gift.',
    'Lovely quality, and the colour is even brighter in daylight.',
    'Use it every day. No complaints at all.',
  ],
  4: [
    'Really nice, though it took a few days longer to arrive than promised.',
    'Great colour and feels solid. Took a little getting used to.',
    'Very happy with it. Docking a star only because the box was a bit squashed.',
  ],
  3: [
    'Fine for the price. The colour is slightly darker than on my screen.',
    'Does the job, but I expected it to feel a little more premium.',
  ],
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '.');
}

async function removeSeed() {
  const { count } = await db.user.deleteMany({
    where: { email: { endsWith: SEED_DOMAIN } },
  });
  // Categories go only when nothing else is filed under them: subcategories
  // first, then the top-level ones they emptied.
  const seeded = categories.map((c) => c.slug);
  const empty = {
    slug: { in: seeded },
    products: { none: {} },
    children: { none: {} },
  };
  const leaves = await db.category.deleteMany({ where: empty });
  const parents = await db.category.deleteMany({ where: empty });
  console.log(
    `Removed ${count} seed users (with their stores, products and reviews) and ${leaves.count + parents.count} categories.`,
  );
}

async function seed() {
  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const parentId = category.parent
      ? categoryIds.get(category.parent)
      : undefined;
    const row = await db.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, parentId: parentId ?? null },
      create: { slug: category.slug, name: category.name, parentId },
    });
    categoryIds.set(category.slug, row.id);
  }

  const storeIds = new Map<string, string>();
  for (const store of stores) {
    const row = await db.store.create({
      data: {
        name: store.name,
        slug: store.slug,
        description: store.description,
        isApproved: true,
        owner: {
          create: {
            name: store.owner,
            email: `${slugify(store.owner)}${SEED_DOMAIN}`,
            role: 'SELLER',
          },
        },
      },
    });
    storeIds.set(store.slug, row.id);
  }

  // Reviewers can't sign in: they have no password.
  const reviewerIds: string[] = [];
  for (const name of reviewers) {
    const user = await db.user.create({
      data: { name, email: `${slugify(name)}${SEED_DOMAIN}`, role: 'CUSTOMER' },
    });
    reviewerIds.push(user.id);
  }

  let commentTurn = 0;
  for (const product of products) {
    const createdAt = new Date(Date.now() - product.daysOld * DAY);

    const images = Array.from({ length: product.photos.count }, (_, i) => ({
      url: `${IMAGE_BASE}/${product.photos.path}/${i + 1}.webp`,
      altText: i === 0 ? product.name : `${product.name}, view ${i + 1}`,
      isPrimary: i === 0,
    }));

    const variants = product.noVariants
      ? []
      : (product.sizes ?? [{ size: undefined, priceDiff: 0 }]).map(
          ({ size, priceDiff = 0 }) => ({
            color: product.colour ?? null,
            size: size ?? null,
            priceDiff,
            stock: product.stock?.[size ?? 'all'] ?? 24,
            sku: [product.slug, size?.replace(/\s+/g, '')]
              .filter(Boolean)
              .join('-')
              .toUpperCase(),
          }),
        );

    const row = await db.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        isPublished: true,
        isFeatured: product.featured ?? false,
        createdAt,
        storeId: storeIds.get(product.store)!,
        categoryId: categoryIds.get(product.category)!,
        images: { create: images },
        variants: { create: variants },
      },
    });

    await db.review.createMany({
      data: product.ratings.map((rating, i) => {
        const options = comments[rating] ?? comments[3];
        return {
          productId: row.id,
          userId: reviewerIds[i],
          rating,
          comment: options[commentTurn++ % options.length],
          // Spread between the listing date and now, never in the future.
          createdAt: new Date(
            createdAt.getTime() +
              ((Date.now() - createdAt.getTime()) * (i + 1)) /
                (product.ratings.length + 1),
          ),
        };
      }),
    });

    console.log(
      `  ${product.name}: ${images.length} photos, ${variants.length} variants, ${product.ratings.length} reviews`,
    );
  }
}

async function main() {
  const remove = process.argv.includes('--remove');
  // Product slugs are unique across the table, so a clash with a real
  // product would fail half-way; check before deleting anything.
  const clash = await db.product.findFirst({
    where: {
      slug: { in: products.map((p) => p.slug) },
      store: { owner: { email: { not: { endsWith: SEED_DOMAIN } } } },
    },
    select: { slug: true },
  });
  if (clash)
    throw new Error(`A real product already uses the slug "${clash.slug}".`);

  if (remove) {
    await removeSeed();
    return;
  }

  console.log('Removing any earlier seed data…');
  await db.user.deleteMany({ where: { email: { endsWith: SEED_DOMAIN } } });
  console.log('Seeding the demo catalogue…');
  await seed();
  console.log(`Done: ${stores.length} stores, ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
