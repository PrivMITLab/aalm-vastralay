import type { Metadata } from "next";
import { getSellerContext } from "@/lib/seller";
import { loadCategoryOptions } from "@/lib/catalog";
import ProductForm from "@/components/seller/ProductForm";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  await getSellerContext();
  const options = await loadCategoryOptions();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold text-maroon-900">Add a product</h1>
        <p className="text-sm text-slate-600">Great photos and honest descriptions sell best. Listing is free.</p>
      </div>
      <ProductForm categories={options} />
    </div>
  );
}
