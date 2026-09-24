import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, ChevronRight, Clock, Sparkles } from "lucide-react";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Ethnic Gazette & Style Journal – Aalm Vastralay",
  description: "Read curated articles on bridal fashion trends, Banarasi silk care, groom styling tips, and Indian handloom heritage from Aalm Vastralay.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const others = posts.slice(1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
        <Link href="/" className="hover:text-[color:var(--brand)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-[color:var(--text)]">Journal & Blog</span>
      </nav>

      {/* Header */}
      <header className="mb-10 text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-2)] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)]">
          <BookOpen className="h-3.5 w-3.5 text-[color:var(--accent)]" /> The Ethnic Gazette
        </span>
        <h1 className="font-display text-3xl font-extrabold sm:text-5xl text-[color:var(--brand)]">
          Stories, Styling & Heritage Crafts
        </h1>
        <p className="text-sm text-[color:var(--text-soft)] max-w-xl mx-auto">
          Insights into Indian wedding traditions, handloom weaving techniques, bridal silhouettes, and timeless textile preservation.
        </p>
      </header>

      {/* Featured Article Hero */}
      {featured && (
        <article className="mb-12 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--accent)]/50 transition-all shadow-sm">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.coverImage}
                alt={featured.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-bold text-slate-950 uppercase tracking-wider shadow-md">
                  Featured Story
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 sm:p-10 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-[color:var(--text-soft)]">
                  <span className="font-semibold text-[color:var(--brand)]">{featured.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {featured.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {featured.readingTime}
                  </span>
                </div>

                <h2 className="font-display text-xl sm:text-2xl font-bold text-[color:var(--text)] leading-snug">
                  <Link href={`/blog/${featured.slug}`} className="hover:text-[color:var(--brand)] transition-colors">
                    {featured.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-[color:var(--text-soft)] leading-relaxed">
                  {featured.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-[color:var(--border)] flex items-center justify-between">
                <span className="text-xs font-medium text-[color:var(--text-soft)]">By {featured.author}</span>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="btn-gold px-4 py-2 text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-1.5"
                >
                  Read Story <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Grid of Other Articles */}
      <div className="grid gap-6 sm:grid-cols-2">
        {others.map((post) => (
          <article
            key={post.slug}
            className="group card overflow-hidden border border-[color:var(--border)] hover:border-[color:var(--brand)]/40 transition-all flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {post.category}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-[color:var(--text-soft)]">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readingTime}</span>
                </div>
                <h3 className="font-display text-base font-bold text-[color:var(--text)] group-hover:text-[color:var(--brand)] transition-colors leading-snug">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-xs text-[color:var(--text-soft)] line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-[color:var(--border)] mt-4 flex items-center justify-between">
              <span className="text-[11px] text-[color:var(--text-soft)]">By {post.author}</span>
              <Link
                href={`/blog/${post.slug}`}
                className="text-xs font-bold text-[color:var(--brand)] group-hover:text-[color:var(--accent)] transition-colors inline-flex items-center gap-1"
              >
                Read Article <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
