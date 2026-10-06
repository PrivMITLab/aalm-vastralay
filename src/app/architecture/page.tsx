import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Maximize2, ShieldCheck, Layers, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "System Architecture Showcase | Aalm Vastralay",
  description: "Interactive Archify 3.0 visualizer and system architecture blueprint for Aalm Vastralay Indian Ethnic Wear Marketplace.",
};

export default function ArchitectureShowcasePage() {
  return (
    <div className="min-h-screen bg-[#0F0A14] text-white flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-white/10 bg-[#160E1E]/90 backdrop-blur px-4 lg:px-8 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/15 mx-1" />
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-sm font-semibold text-white leading-none">
                Aalm Vastralay Architecture Showcase
              </h1>
              <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                Archify 3.0 Interactive Graph Visualizer · Production Verified
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>40/40 Tests Passing</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-medium">
            <Cpu className="w-3.5 h-3.5" />
            <span>$0/mo Free Tier</span>
          </div>
          <a
            href="/architecture.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 transition-all"
            title="Open Fullscreen in New Tab"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen Standalone</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </header>

      {/* Main Interactive Showcase Iframe Viewport */}
      <main className="flex-1 w-full h-[calc(100vh-3.5rem)] relative bg-[#09050C]">
        <iframe
          src="/architecture.html"
          title="Aalm Vastralay Archify Architecture Showcase"
          className="w-full h-full border-0 absolute inset-0"
          loading="eager"
        />
      </main>
    </div>
  );
}
