"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Sparkles, X } from "lucide-react";
import { parseEthnicQueryDeterministic, type ParsedSearchIntent } from "@/lib/ai/search-parser";
import { formatINR } from "@/lib/utils";
import Image from "next/image";

type Suggestion = { id: string; title: string; slug: string; price: number; image: string; storeName: string | null };

export default function SmartSearchBar({
  initialQuery = "",
  placeholder = "Search sarees, lehengas, 'shaadi ke liye under 5000'...",
  className = "",
  onSelect,
}: {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  onSelect?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live client-side natural language intent parsing
  const intent: ParsedSearchIntent | null = useMemo(() => {
    if (query.trim().length < 4) return null;
    const parsed = parseEthnicQueryDeterministic(query);
    const hasFilter = Boolean(parsed.maxPrice || parsed.minPrice || parsed.occasion || parsed.color || parsed.fabric);
    return hasFilter ? parsed : null;
  }, [query]);

  // Debounced autocomplete suggestions
  useEffect(() => {
    if (query.trim().length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const json = (await res.json()) as { products?: Suggestion[] };
          setSuggestions(json.products ?? []);
          setIsOpen(true);
        }
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const visibleSuggestions = query.trim().length >= 2 ? suggestions : [];

  // Click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    if (onSelect) onSelect();
  }

  function handlePickSuggestion(slug: string) {
    setIsOpen(false);
    router.push(`/products/${slug}`);
    if (onSelect) onSelect();
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0 || intent) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="h-10 w-full rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] pl-10 pr-10 text-xs text-[color:var(--text)] placeholder-[color:var(--text-soft)] transition focus:border-[color:var(--brand)] focus:bg-[color:var(--surface)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand)]"
        />
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[color:var(--text-soft)]" />
        {loading ? (
          <Loader2 className="pointer-events-none absolute right-3.5 h-3.5 w-3.5 animate-spin text-[color:var(--brand)]" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-3.5 text-[color:var(--text-soft)] hover:text-[color:var(--text)]"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </form>

      {/* Live AI Intent pill (under input when typing conversational phrase) */}
      {intent && (
        <div className="mt-1.5 flex items-center gap-1.5 px-2 text-[11px] text-[color:var(--brand)]">
          <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
          <span className="font-semibold text-amber-700 dark:text-amber-300">AI Intent:</span>
          <span className="truncate text-[color:var(--text-soft)]">{intent.explanation}</span>
        </div>
      )}

      {/* Dropdown Suggestions */}
      {isOpen && (visibleSuggestions.length > 0 || intent) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-xl animate-fade-in">
          {/* AI Intent banner inside dropdown if applicable */}
          {intent && (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex w-full items-center justify-between border-b border-[color:var(--border)] bg-amber-50/70 dark:bg-amber-950/30 px-3.5 py-2.5 text-left text-xs transition hover:bg-amber-100/70 dark:hover:bg-amber-900/40"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-200">
                    Smart Search: &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    {intent.explanation}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                Explore →
              </span>
            </button>
          )}

          {/* Autocomplete items */}
          {visibleSuggestions.length > 0 && (
            <ul className="max-h-72 overflow-y-auto divide-y divide-[color:var(--border)]">
              {visibleSuggestions.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handlePickSuggestion(p.slug)}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-[color:var(--surface-2)]"
                  >
                    <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-md bg-[color:var(--surface-2)]">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[color:var(--text)]">
                        {p.title}
                      </p>
                      <p className="text-[11px] font-bold text-[color:var(--brand)]">
                        {formatINR(p.price)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
