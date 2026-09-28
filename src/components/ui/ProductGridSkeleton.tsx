/**
 * ProductGridSkeleton.tsx
 * Full responsive grid of ProductCardSkeletons.
 * - Same grid classes as actual product listing pages
 * - Staggered animation delay for natural feel
 * - count prop se kitne cards dikhane hain control karo
 * Rules.md Section 4.4: CLS = 0 skeleton contract.
 */
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";

interface ProductGridSkeletonProps {
  /** Kitne skeleton cards render karne hain — default 8 */
  count?: number;
}

export default function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Products load ho rahe hain..."
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          // Staggered delay: har card thoda baad fade aata hai — natural feel
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}
