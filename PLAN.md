## Product Variants Implementation Plan (Decision-Complete)

### Summary
Implement variants as the source of truth for price, stock, and images across admin, storefront, cart, checkout, and payment flows. Keep `Product` as catalog metadata and derive display values from a **primary active variant**.

### Interface & Contract Changes
1. `productSchema` in `lib/zod-schema.ts`
- Replace top-level `images/mrp/sellingPrice/stock` with `variants[]` (`name, sku, images[], mrp, sellingPrice, stock, isActive, sortOrder`).
- Keep `sellingPrice <= mrp` validation per variant.

2. Checkout/order payload contracts
- Add required `variantId` to order item schema (`productId, variantId, name, image, price, quantity`).
- Cart DTO must include `variantId`, `variantName`, variant-derived `price/image/stock`.

3. Server action signatures
- `addToCart(productId, variantId, quantity)` (remove `weight` path entirely).
- `updateStock(variantId, stock)` for admin inventory updates.

### Step-by-Step Implementation

1. **Create shared variant mapping helpers (first)**
- Add a shared mapper utility (new file in `lib` or `utils`) to:
  - pick primary variant: first `isActive=true` by `sortOrder asc, createdAt asc`;
  - derive card/detail fields from selected variant;
  - provide safe fallback when no active variant exists.
- Reason: removes repeated logic and keeps behavior consistent everywhere.

2. **Refactor admin product write path**
- Update `actions/admin/product.actions.ts`:
  - `createProduct`: nested `variants.create`.
  - `updateProduct`: transactional replace/update of variants (delete missing, update existing, create new).
  - `getProduct/getProducts`: include variants and return derived display fields for tables.
  - `updateStock`: target `productVariant`.
- Update `components/admin/products/product-form.tsx`:
  - switch to `useFieldArray` for variants (you can reuse structure ideas from `product-form-old.tsx.backup`);
  - move media/pricing/stock into each variant card.
- Update `components/admin/products/products-table-client.tsx`, `stock-dialog.tsx`, and related table wrappers to render variant-derived fields and update selected variant stock.

3. **Refactor storefront product read path**
- Update `app/(store)/products/[slug]/page.tsx`:
  - fetch `variants` with ordering/filtering;
  - metadata image from primary variant image;
  - pass variant list to `ProductInfo`.
- Update `components/store/products/product-info.tsx`:
  - add variant selector;
  - price/stock/image bound to selected variant;
  - add-to-cart uses `productId + variantId`.
- Keep `ProductImageGallery` input as image array, but feed selected variant images.

4. **Refactor listing/search/category/home surfaces**
- Update product queries in:
  - `app/(store)/products/page.tsx`
  - `app/(store)/categories/[slug]/page.tsx`
  - `app/(store)/categories/page.tsx`
  - `components/store/home/featured-products.tsx`
  - `components/store/products/related-products.tsx`
  - `actions/store/search.actions.ts`
  - `actions/store/wishlist.actions.ts`
- Replace product-level price/stock/image filters/sorts with variant-aware filtering and derived display values.
- Update UI consumers (`modern-product-card`, search dialogs, wishlist cards) to use derived fields + default variant id for quick add-to-cart.

5. **Refactor cart + checkout flow**
- Update `actions/store/cart.actions.ts`:
  - include `variant` relation;
  - cart uniqueness by `@@unique([cartId, variantId])`;
  - remove all `weight` references.
- Update `hooks/use-cart-db.ts`:
  - cart identity by `variantId`;
  - `isInCart(productId, variantId)` behavior;
  - optimistic updates keyed by `variantId`.
- Update `app/(store)/checkout/page.tsx` and `components/store/checkout/checkout-form.tsx`:
  - load variant data from cart;
  - submit order items with `variantId`.

6. **Refactor payment/order stock pipeline**
- Update `actions/payment/initiate-order.ts`:
  - validate against `ProductVariant.stock`;
  - compute subtotal from variant selling price;
  - persist `orderItem.variantId` + `variantDetails` snapshot (`variantName, sku, mrp, sellingPrice, images`).
- Update `utils/order-helpers.ts`:
  - deduct inventory from variants, not product.
  - use atomic stock-safe update pattern (`updateMany where id & stock >= qty`) in transaction.
- Update `actions/payment/confirm-order.ts` and `app/api/webhooks/razorpay/route.ts` to pass/use `variantId`.

7. **Refactor order read models (user + admin)**
- Update `actions/store/order.actions.ts` and `actions/admin/order.actions.ts`:
  - stop selecting `product.images`;
  - include `variant` where needed;
  - display image/name/price from `variantDetails` snapshot first.
- Update order UI components (`orders-list`, `modern-orders-list`, admin order details) to use snapshot data.

8. **Update analytics/dashboard + seed**
- Update `actions/admin/dashboard.actions.ts` top-product rendering image/price to variant-derived source.
- Update `prisma/seed.ts` to create `product.variants[]` (remove obsolete product-level pricing fields).

9. **Quality gates and regression checks**
- Run: `prisma generate`, TypeScript check, lint, and full build.
- Validate end-to-end flows:
  - admin create/edit product with multiple variants;
  - store listing + filters + sort + search;
  - variant selection + add/remove cart;
  - checkout + payment + stock deduction;
  - order history/admin order details snapshot correctness.
- Add/update targeted tests for:
  - variant selection fallback,
  - cart uniqueness by variant,
  - atomic stock deduction under concurrent purchase.

### Assumptions (locked defaults)
- Primary display variant = first active variant by `sortOrder asc`, then `createdAt asc`.
- Storefront shows only products having at least one active variant.
- Wishlist remains product-level (not variant-level).
- Order item snapshot is immutable source for historical display (even if variant later changes).
- Admin stock quick-edit updates a specific variant (default: primary variant unless variant is explicitly selected in UI).
