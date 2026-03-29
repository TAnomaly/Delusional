"use client";

import Link from "next/link";

export function LandingNav() {
  return (
    <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 font-body relative z-50 w-full backdrop-blur-sm bg-background/50 border-b border-border/40">
      <div className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-foreground">
        <span>✦</span>
        <span>Delusional</span>
      </div>
      
      {/* Centered Pill Navigation */}
      <div className="hidden md:flex items-center p-1 bg-secondary/80 backdrop-blur-md rounded-full border border-border/50 absolute left-1/2 -translate-x-1/2">
        <Link href="/" className="px-4 py-1.5 rounded-full text-sm font-medium text-foreground hover:bg-background/80 transition-all">
          Home
        </Link>
        <Link href="/board" className="px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all">
          Tasks
        </Link>
        <Link href="/notes" className="px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all">
          Notes
        </Link>
      </div>

      <div className="flex items-center">
        <Link href="/settings" className="rounded-full px-5 py-2 text-sm font-medium bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform flex-shrink-0">
          Settings ⚙
        </Link>
      </div>
    </nav>
  );
}
