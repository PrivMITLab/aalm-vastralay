import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import { getSellerContext } from "@/lib/seller";
import ProductForm from "@/components/seller/ProductForm";
import { loadCategoryOptions } from "@/lib/catalog";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { store } = await getSellerContext();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.storeId, store.id)))
    .limit(1);
  if (!product) notFound();
  const variants = await db.select().from(productVariants).where(eq(productVariants.productId, product.id));
  const options = await loadCategoryOptions();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold text-maroon-900">Edit product</h1>
        <p className="line-clamp-1 text-sm text-slate-600">{product.title}</p>
      </div>
      <ProductForm categories={options} product={{ ...product, variants }} />
    </div>
  );
}
