"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Command, Bell, ChevronDown } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isBoard = pathname === "/board";
  const isNotes = pathname === "/notes";
  const isSettings = pathname === "/settings";

  return (
    <div className="flex flex-col h-screen w-full bg-background font-body overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border bg-background z-20">
        <div className="flex items-center gap-3 truncate">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
            D
          </div>
          <span className="font-semibold text-foreground text-base hidden sm:inline-block">Delusional</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 bg-secondary text-muted-foreground px-4 py-2 rounded-full border border-border/50 text-sm">
            <Search className="h-4 w-4" />
            <span className="w-24 lg:w-32">Search</span>
            <div className="flex items-center gap-0.5 opacity-50 ml-4 lg:ml-6">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-full font-medium text-xs sm:text-sm transition-transform hover:scale-105">
              New Task
            </button>
            <Bell className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors hidden sm:block" />
            <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xs cursor-pointer flex-shrink-0">
              USR
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-56 lg:w-64 border-r border-border bg-background/50 p-4 h-full overflow-y-auto">
          
          <div className="mb-3 px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Workspace
          </div>
          <div className="flex flex-col gap-1.5 text-sm mb-8">
            <Link href="/" className={`flex items-center px-3 py-2.5 rounded-lg font-medium transition-all ${isHome ? 'bg-secondary text-secondary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
              Home
            </Link>
            <Link href="/board" className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${isBoard ? 'bg-secondary text-secondary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
              <div className="flex items-center gap-2.5">
                <span className="text-lg leading-none opacity-80">▦</span>
                <span>Tasks</span>
              </div>
              <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">10</span>
            </Link>
            <Link href="/notes" className={`flex items-center px-3 py-2.5 rounded-lg font-medium transition-all ${isNotes ? 'bg-secondary text-secondary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
              <div className="flex items-center gap-2.5">
                <span className="text-lg leading-none opacity-80">◈</span>
                <span>Notes</span>
              </div>
            </Link>
          </div>

          <div className="mb-3 px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            Finance
            <span className="text-[9px] bg-secondary/80 text-foreground/50 px-1.5 py-0.5 rounded-md normal-case font-medium">Soon</span>
          </div>
          <div className="flex flex-col gap-1 text-sm opacity-50 mb-6">
            <div className="flex items-center justify-between px-3 py-2 text-muted-foreground cursor-not-allowed">
              <span>Transactions</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-muted-foreground cursor-not-allowed">
              <span>Payments</span>
              <ChevronDown className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-muted-foreground cursor-not-allowed">
              <span>Cards</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-muted-foreground cursor-not-allowed">
              <span>Accounts</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-1 text-sm">
            <Link href="/settings" className={`flex items-center px-3 py-2.5 rounded-lg font-medium transition-all ${isSettings ? 'bg-secondary text-secondary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
              <div className="flex items-center gap-2.5">
                <span className="text-lg leading-none opacity-80">⚙</span>
                <span>Settings</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-secondary/30 p-4 md:p-8 overflow-y-auto w-full relative">
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
