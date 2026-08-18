import { db } from '../src/lib/db';

async function main() {
  console.log('Testing Cart Database Relationships...');

  // 1. Get or create a User
  let user = await db.user.findFirst({ where: { role: 'CUSTOMER' } });
  if (!user) {
    user = await db.user.create({
      data: {
        email: `test_cart_${Date.now()}@example.com`,
        name: 'Cart Tester',
        role: 'CUSTOMER',
      },
    });
  }

  // 2. Create a Store, Category, and Product to test with
  const store = await db.store.upsert({
    where: { slug: 'test-store' },
    update: {},
    create: {
      name: 'Test Store',
      slug: 'test-store',
      ownerId: user.id, // For simplicity, using same user as owner
      isApproved: true,
    },
  });

  const category = await db.category.upsert({
    where: { slug: 'test-category' },
    update: {},
    create: {
      name: 'Test Category',
      slug: 'test-category',
    },
  });

  const product = await db.product.upsert({
    where: { slug: 'test-product' },
    update: {},
    create: {
      storeId: store.id,
      categoryId: category.id,
      name: 'Test Product',
      slug: 'test-product',
      description: 'A product for testing the cart',
      price: 19.99,
      isPublished: true,
    },
  });

  // 3. Test Cart Creation
  let cart = await db.cart.findUnique({ where: { userId: user.id } });
  if (!cart) {
    cart = await db.cart.create({ data: { userId: user.id } });
  }

  // 4. Test Adding an Item to Cart
  const cartItem = await db.cartItem.create({
    data: {
      cartId: cart.id,
      productId: product.id,
      quantity: 2,
    },
  });
  console.log(`Added 2x ${product.name} to cart.`);

  // 5. Test Fetching Cart with Details
  const fetchedCart = await db.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: { include: { store: true } },
        },
      },
    },
  });

  console.log('\nFetched Cart Details:');
  console.log(JSON.stringify(fetchedCart, null, 2));

  // 6. Cleanup Cart Item
  await db.cartItem.delete({ where: { id: cartItem.id } });
  console.log('\nCleaned up cart item successfully.');
}

main()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
