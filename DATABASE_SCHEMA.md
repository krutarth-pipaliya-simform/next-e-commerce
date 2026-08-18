# Database Schema Documentation

This document serves as the source of truth for all database models and their fields used in the Next.js E-Commerce platform.

> **Important Convention:** Whenever a change is made to `prisma/schema.prisma` (adding a model, adding a field, or changing a relationship), this documentation **must be updated simultaneously** to reflect the current state of the database.

---

## 1. NextAuth Core & Users

### `Account`

Links a user to an OAuth provider (e.g., Google, GitHub).

- `userId`: Foreign key linking to the `User` who owns this account.
- `type`, `provider`, `providerAccountId`: Identifiers and types provided by the OAuth provider.
- `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state`: OAuth tokens and metadata needed to maintain the session.

### `Session`

Stores active login sessions for users.

- `sessionToken`: The unique token (Primary Key) used to validate a user's session via cookies.
- `userId`: Foreign key linking to the `User` this session belongs to.
- `expires`: The expiration date/time of the session.

### `User`

The central model for all human actors in the system (Customers, Sellers, Admins).

- `id`: Unique identifier for the user.
- `name`, `email`, `emailVerified`, `image`: Basic profile information (often populated by OAuth).
- `hashedPassword`: Stored securely for users who sign up with traditional Email/Password instead of OAuth.
- `role`: Enum (`CUSTOMER`, `SELLER`, `SUPER_ADMIN`) defining the user's permissions on the platform.

### `VerificationToken`

Used for magic link logins or email verification flows.

- `identifier`: Typically the user's email address.
- `token`: The secure, random token sent to the user.
- `expires`: When the token becomes invalid.

---

## 2. Marketplace: Stores & Products

### `Store`

Created by a `SELLER` to list their own products independently in the marketplace.

- `id`: Unique identifier for the store.
- `ownerId`: Links to the `User` (Seller) who owns the store.
- `name`, `slug`, `description`, `logo`: Public-facing store branding.
- `isApproved`: Boolean. Must be true (set by SUPER_ADMIN) before a store is visible to the public.
- `isSuspended`: Boolean. Allows admins to temporarily hide a store without deleting it.

### `Category`

Categories for products (e.g., Electronics, Clothing).

- `id`: Unique identifier.
- `name`, `slug`, `description`: Public-facing category details.
- `parentId`: Allows for nested sub-categories (e.g., Electronics -> Laptops).

### `Product`

The base item being sold by a Store.

- `id`: Unique identifier.
- `storeId`: Links to the `Store` selling this product.
- `categoryId`: Links to the `Category` this product belongs to.
- `name`, `slug`, `description`: Product details.
- `price`: The base price (can be modified by variants).
- `isPublished`: Allows sellers to save drafts before making them live.
- `isFeatured`: For highlighting products on the homepage.

### `ProductImage`

Images associated with a product.

- `id`: Unique identifier.
- `productId`: Links to the parent `Product`.
- `url`, `altText`: Image source and accessibility text.
- `isPrimary`: Denotes which image should be the main thumbnail.

### `ProductVariant`

Specific variations of a product (e.g., Red / Large).

- `id`: Unique identifier.
- `productId`: Links to the parent `Product`.
- `size`, `color`: Specific variant attributes.
- `sku`: Stock Keeping Unit (unique identifier for warehouse tracking).
- `stock`: Current inventory count for this specific variant.
- `priceDiff`: Price adjustment from the base product price (+/-).

### `Review`

Customer feedback on a product.

- `productId`: The product being reviewed.
- `userId`: The customer leaving the review.
- `rating`: Integer from 1 to 5.
- `comment`: Optional text feedback.

---

## 3. Cart & Multi-Vendor Orders

### `Address`

Saved shipping addresses for users.

- `id`: Unique identifier.
- `userId`: Links to the `User` who saved the address.
- `label`: E.g., "Home", "Office".
- `street`, `city`, `state`, `zipCode`, `country`: Physical location details.
- `isDefault`: Whether this should be auto-selected at checkout.

### `Cart` & `CartItem`

The active shopping session before checkout.

- `Cart.id`: Unique identifier.
- `Cart.userId`: Links to the `User` who owns the cart.
- `CartItem.cartId`: Links to the parent `Cart`.
- `CartItem.productId`: The product added to the cart.
- `CartItem.productVariantId`: (Optional) The specific variant chosen.
- `CartItem.quantity`: How many of this item are in the cart.

### `Order` (Parent Order)

The overarching receipt representing a single customer checkout, which may contain items from multiple different Sellers/Stores.

- `id`: Unique identifier.
- `userId`: The customer who placed the order.
- `totalAmount`: The grand total paid by the customer.
- `paymentStatus`: E.g., PENDING, PAID, FAILED.
- `shippingName`, `shippingStreet`, etc.: Snapshots of the shipping address at the time of checkout. We do not use foreign keys here so that if a user deletes their saved address, historical orders are not broken.

### `StoreOrder` (Seller's Portion)

Because this is a multi-vendor platform, a single `Order` is split into multiple `StoreOrder`s, one for each Seller involved. Sellers only see their own `StoreOrder`.

- `id`: Unique identifier.
- `orderId`: Links to the parent `Order`.
- `storeId`: Links to the `Store` that needs to fulfill this part of the order.
- `status`: E.g., PENDING, SHIPPED, DELIVERED. Allows each seller to ship at their own pace.
- `subTotal`: The amount of money owed to this specific store.
- `couponId`: Links to any store-specific discount used.

### `OrderItem`

The actual products purchased within a `StoreOrder`.

- `id`: Unique identifier.
- `storeOrderId`: Links to the parent `StoreOrder`.
- `productVariantId`: Live reference to the variant (can become null if the seller deletes the variant).
- `name`, `price`, `quantity`, `size`, `color`, `sku`: Snapshots of the product details at the exact moment of purchase. This ensures the receipt remains accurate even if the seller changes the product price or name later.

---

## 4. Extras (Wishlist & Coupons)

### `Wishlist` & `WishlistItem`

Saved items a user wants to buy later.

- `Wishlist.id`: Unique identifier.
- `Wishlist.userId`: The owner of the wishlist.
- `WishlistItem.wishlistId`: Links to the parent `Wishlist`.
- `WishlistItem.productId`: The product saved for later.

### `Coupon`

Discounts created by Sellers (for their own store) or Super Admins (for the whole platform).

- `id`: Unique identifier.
- `code`: The string a customer types in at checkout (e.g., "SUMMER20").
- `storeId`: (Optional) If null, it's a global platform coupon. If set, it only applies to that specific store's items.
- `discountType`: PERCENTAGE or FIXED_AMOUNT.
- `discountValue`: The amount to deduct.
- `validUntil`: Expiration date.
- `usageLimit`: Max number of times it can be used globally.
- `usedCount`: Tracks how many times it has been used.
- `isActive`: Allows manually turning the coupon on or off.
