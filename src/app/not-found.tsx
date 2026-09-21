import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="font-display text-7xl font-semibold text-maroon-200">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-maroon-900">This page has wandered off</h1>
      <p className="mt-2 text-sm text-slate-600">The product or page you&apos;re looking for doesn&apos;t exist or is no longer available.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Go home
        </Link>
        <Link href="/products" className="btn btn-outline">
          Browse products
        </Link>
      </div>
    </div>
  );
}
