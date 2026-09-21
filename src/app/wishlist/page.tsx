import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { db } from "@/db";
import { products, stores, wishlist } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { moveWishlistItemToCart, removeFromWishlist } from "@/actions/cart";
import ProductCard from "@/components/ProductCard";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireUser("/wishlist");
  const rows = await db
    .select({ product: products, storeName: stores.storeName })
    .from(wishlist)
    .innerJoin(products, eq(wishlist.productId, products.id))
    .leftJoin(stores, eq(products.storeId, stores.id))
    .where(eq(wishlist.userId, user.id))
    .orderBy(desc(wishlist.createdAt));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold text-maroon-900">
        Wishlist <span className="text-base font-normal text-slate-500">({rows.length})</span>
      </h1>

      {rows.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center p-12 text-center">
          <Heart className="h-10 w-10 text-maroon-300" />
          <p className="mt-3 font-display text-xl text-maroon-900">Nothing saved yet</p>
          <p className="mt-1 text-sm text-slate-500">Tap the heart on any product to save it here.</p>
          <Link href="/products" className="btn btn-primary mt-5">
            Explore products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {rows.map(({ product, storeName }) => (
            <div key={product.id} className="flex flex-col gap-2">
              <ProductCard product={{ ...product, storeName }} />
              <div className="flex gap-2">
                <form action={moveWishlistItemToCart} className="flex-1">
                  <input type="hidden" name="productId" value={product.id} />
                  <SubmitButton className="w-full" variant="primary" pendingText="Adding…">
                    <ShoppingBag className="h-4 w-4" /> Move to bag
                  </SubmitButton>
                </form>
                <form action={removeFromWishlist}>
                  <input type="hidden" name="productId" value={product.id} />
                  <SubmitButton variant="outline" className="px-3" pendingText="…">
                    <Trash2 className="h-4 w-4" />
                  </SubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
