import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ChevronRight, Clock, MessageCircle, Share2, Sparkles } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export const dynamic = "force-static";
export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Article Not Found – Aalm Vastralay" };
  }

  return {
    title: `${post.title} | Aalm Vastralay Journal`,
    description: post.seoDescription,
    openGraph: {
      title: post.title,
      description: post.seoDescription,
      images: [post.coverImage],
      type: "article",
    },
  };
}

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
        <Link href="/" className="hover:text-[color:var(--brand)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="hover:text-[color:var(--brand)]">
          Journal
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-[color:var(--text)] truncate max-w-[200px]">
          {post.title}
        </span>
      </nav>

      {/* Header Info */}
      <header className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-[color:var(--surface-2)] px-3 py-1 font-bold uppercase tracking-wider text-[color:var(--accent)] border border-[color:var(--border)]">
            {post.category}
          </span>
          <span className="text-[color:var(--text-soft)]">•</span>
          <span className="flex items-center gap-1 text-[color:var(--text-soft)]">
            <Calendar className="h-3.5 w-3.5" /> {post.date}
          </span>
          <span className="text-[color:var(--text-soft)]">•</span>
          <span className="flex items-center gap-1 text-[color:var(--text-soft)]">
            <Clock className="h-3.5 w-3.5" /> {post.readingTime}
          </span>
        </div>

        <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[color:var(--brand)] leading-tight">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-[color:var(--text-soft)] leading-relaxed italic border-l-2 border-[color:var(--accent)] pl-4">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[color:var(--border)]">
          <p className="text-xs font-semibold text-[color:var(--text)]">
            Published by <span className="text-[color:var(--brand)]">{post.author}</span>
          </p>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - Read more on Aalm Vastralay`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-1.5 text-xs font-bold text-[color:var(--text)] hover:bg-[color:var(--surface)] transition-colors"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-600" /> Share
          </a>
        </div>
      </header>

      {/* Cover Image */}
      <div className="mb-10 overflow-hidden rounded-2xl border border-[color:var(--border)] shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full aspect-[16/9] object-cover"
        />
      </div>

      {/* Main Content Sections */}
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed text-[color:var(--text)]">
        {post.sections.map((sec, idx) => (
          <section key={idx} className="space-y-3">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[color:var(--brand)] pt-2">
              {sec.heading}
            </h2>
            {sec.paragraphs.map((para, pIdx) => (
              <p key={pIdx} className="text-xs sm:text-sm text-[color:var(--text-soft)] leading-relaxed">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>

      {/* Consultation Banner */}
      <div className="mt-12 rounded-2xl border border-[color:var(--border)] bg-gradient-to-r from-[color:var(--brand)]/10 via-[color:var(--surface)] to-[color:var(--accent)]/10 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--accent)] uppercase tracking-wider">
          <Sparkles className="h-4 w-4 fill-[color:var(--accent)]" /> Handcrafted Heritage
        </div>
        <h3 className="font-display text-lg sm:text-xl font-bold text-[color:var(--brand)]">
          Looking for bespoke wedding attire tailored to your exact measurements?
        </h3>
        <p className="text-xs text-[color:var(--text-soft)] leading-relaxed max-w-xl">
          Consult with our Kalyanipur master artisans to customize your bridal lehenga embroidery, blouse cut, or groom sherwani fabric.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="https://wa.me/918434061342?text=Hello%20Aalm%20Vastralay,%20I%20read%20your%20article%20and%20would%20like%20a%20bridal%20consultation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp Stylist (+91 8434061342)
          </a>
          <Link
            href="/categories"
            className="btn-gold px-4 py-2.5 text-xs font-bold rounded-xl shadow-md"
          >
            Explore Collections
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-2.5 text-xs font-bold text-[color:var(--text)] hover:bg-[color:var(--surface)]"
          >
            <ArrowLeft className="h-4 w-4" /> All Articles
          </Link>
        </div>
      </div>
    </article>
  );
}
