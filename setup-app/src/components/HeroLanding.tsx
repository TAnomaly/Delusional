"use client";

import { motion } from "framer-motion";
import { Play, ChevronDown, Search, Bell, Command, Plus, MoreVertical } from "lucide-react";
import Link from "next/link";

export function HeroLanding() {
  return (
    <div className="relative z-10 flex flex-col items-center w-full px-4 pt-20 pb-32">
      {/* 1. Badge */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground font-body mb-6"
      >
        <span>Now with GPT-5 support ✨</span>
      </motion.div>

      {/* 2. Headline */}
      <motion.h1
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center font-display text-5xl md:text-6xl lg:text-[5rem] leading-[0.95] tracking-tight text-foreground max-w-xl"
      >
        The Future of <span className="font-display italic">Smarter</span> Automation
      </motion.h1>

      {/* 3. Subheadline */}
      <motion.p
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-4 text-center text-base md:text-lg text-muted-foreground max-w-[650px] leading-relaxed font-body"
      >
        Automate your busywork with intelligent agents that learn, adapt, and execute—so your team can focus on what matters most.
      </motion.p>

      {/* 4. CTA Buttons */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 flex items-center gap-3"
      >
        <button className="rounded-full px-6 py-4 bg-primary text-primary-foreground text-sm font-medium font-body transition-transform hover:scale-105 shadow-xl">
          Book a demo
        </button>
        <button className="flex items-center justify-center h-12 w-12 rounded-full border-0 bg-background shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:bg-background/80 transition-transform hover:scale-105">
          <Play className="h-4 w-4 fill-foreground text-foreground" />
        </button>
      </motion.div>

      {/* 5. Dashboard Preview */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-16 w-full max-w-5xl"
      >
        <div
          className="rounded-2xl overflow-hidden p-3 md:p-4 backdrop-blur-xl"
          style={{
            background: "rgba(255, 255, 255, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "var(--shadow-dashboard)",
          }}
        >
          {/* Dashboard Internals */}
          <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden flex flex-col font-body text-[11px] select-none w-full h-[540px]">
            
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <div className="flex items-center gap-3 truncate">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
                  N
                </div>
                <span className="font-semibold text-foreground text-sm">Nexora</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-secondary text-muted-foreground px-3 py-1.5 rounded-full border border-border/50">
                  <Search className="h-3 w-3" />
                  <span>Search</span>
                  <div className="flex items-center gap-0.5 opacity-50 ml-6">
                    <Command className="h-3 w-3" />
                    <span>K</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full font-medium">
                    Move Money
                  </button>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-[10px]">
                    JB
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-48 border-r border-border bg-background/50 p-3 h-full overflow-y-auto">
                
                <div className="mb-2 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Workspace
                </div>
                <div className="flex flex-col gap-1 text-[11px] mb-5">
                  <div className="flex items-center px-2 py-1.5 rounded-md font-medium text-muted-foreground hover:bg-secondary/50">
                    Home
                  </div>
                  <Link href="/board" className="flex items-center justify-between px-2 py-1.5 rounded-md font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all cursor-pointer relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm leading-none opacity-80">▦</span>
                      <span>Tasks</span>
                    </div>
                    <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full font-bold">10</span>
                  </Link>
                  <Link href="/notes" className="flex items-center px-2 py-1.5 rounded-md font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all cursor-pointer relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm leading-none opacity-80">◈</span>
                      <span>Notes</span>
                    </div>
                  </Link>
                </div>

                <div className="mb-2 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  Finance
                  <span className="text-[8px] bg-secondary text-foreground/50 px-1 py-0.5 rounded normal-case font-medium">Soon</span>
                </div>
                <div className="flex flex-col gap-0.5 text-[11px] opacity-50 mb-4">
                  <div className="flex items-center justify-between px-2 py-1.5 text-muted-foreground">
                    <span>Transactions</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5 text-muted-foreground">
                    <span>Payments</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5 text-muted-foreground">
                    <span>Cards</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5 text-muted-foreground">
                    <span>Accounts</span>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-1 text-[11px]">
                  <Link href="/settings" className="flex items-center px-2 py-1.5 rounded-md font-medium text-muted-foreground hover:bg-secondary/50 transition-all cursor-pointer relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm leading-none opacity-80">⚙</span>
                      <span>Settings</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 bg-secondary/30 p-6 overflow-y-auto flex flex-col gap-6">
                
                {/* Greeting & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-foreground tracking-tight">Welcome, Jane</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="px-3 py-1.5 bg-accent text-accent-foreground rounded-full font-medium">Send</button>
                    <button className="px-3 py-1.5 bg-background border border-border text-foreground rounded-full hover:bg-secondary">Request</button>
                    <button className="px-3 py-1.5 bg-background border border-border text-foreground rounded-full hover:bg-secondary">Transfer</button>
                    <button className="px-3 py-1.5 bg-background border border-border text-foreground rounded-full hover:bg-secondary">Deposit</button>
                    <button className="px-3 py-1.5 bg-background border border-border text-foreground rounded-full hover:bg-secondary">Pay Bill</button>
                    <button className="px-3 py-1.5 bg-background border border-border text-foreground shadow-sm rounded-full font-medium">Create Invoice</button>
                    <button className="px-3 py-1.5 text-muted-foreground hover:text-foreground">Customize</button>
                  </div>
                </div>

                {/* Cards Row */}
                <div className="flex flex-col md:flex-row gap-4">
                  
                  {/* Balance Card */}
                  <div className="flex-1 basis-0 bg-background border border-border rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-muted-foreground font-medium">Mercury Balance</span>
                      <div className="h-3 w-3 bg-accent rounded-full flex items-center justify-center">
                        {/* Checkmark */}
                        <svg width="6" height="4" viewBox="0 0 6 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0.5 2L2 3.5L5.5 0.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-display font-semibold text-foreground">$8,450,190</span>
                      <span className="text-sm font-medium text-muted-foreground">.32</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mb-6">
                      <span className="text-muted-foreground">Last 30 Days</span>
                      <span className="text-green-500 font-medium">+$1.8M</span>
                      <span className="text-red-500 font-medium">-$900K</span>
                    </div>
                    
                    {/* SVG Chart */}
                    <div className="mt-auto -mx-5 -mb-5 h-24 relative">
                      <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="gradientAccent" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path 
                          d="M0,80 C50,70 80,30 150,40 C220,50 280,20 400,10 L400,100 L0,100 Z" 
                          fill="url(#gradientAccent)" 
                        />
                        <path 
                          d="M0,80 C50,70 80,30 150,40 C220,50 280,20 400,10" 
                          fill="none" 
                          stroke="hsl(var(--accent))" 
                          strokeWidth="2" 
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Accounts Card */}
                  <div className="flex-1 basis-0 bg-background border border-border rounded-xl p-5 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-foreground text-sm">Accounts</span>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Plus className="h-3 w-3" />
                        <MoreVertical className="h-3 w-3" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <span className="text-muted-foreground font-medium">Credit</span>
                        </div>
                        <span className="font-semibold text-foreground">$98,125.50</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          <span className="text-muted-foreground font-medium">Treasury</span>
                        </div>
                        <span className="font-semibold text-foreground">$6,750,200.00</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                          <span className="text-muted-foreground font-medium">Operations</span>
                        </div>
                        <span className="font-semibold text-foreground">$1,592,864.82</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Transactions Table */}
                <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-border">
                    <span className="font-semibold text-foreground text-sm">Recent Transactions</span>
                  </div>
                  <div className="w-full">
                    <div className="grid grid-cols-4 px-5 py-2.5 bg-secondary/30 text-muted-foreground border-b border-border uppercase tracking-wider text-[9px] font-semibold">
                      <div>Date</div>
                      <div className="col-span-1">Description</div>
                      <div>Amount</div>
                      <div>Status</div>
                    </div>
                    
                    <div className="grid grid-cols-4 px-5 py-3 border-b border-border border-dashed items-center text-xs">
                      <div className="text-muted-foreground">Today, 2:45 PM</div>
                      <div className="font-medium text-foreground">AWS Cloud Services</div>
                      <div className="font-semibold">-$5,200.00</div>
                      <div><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Pending</span></div>
                    </div>
                    
                    <div className="grid grid-cols-4 px-5 py-3 border-b border-border border-dashed items-center text-xs">
                      <div className="text-muted-foreground">Yesterday</div>
                      <div className="font-medium text-foreground">Acme Corp Payment</div>
                      <div className="font-semibold text-emerald-600">+$125,000.00</div>
                      <div><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Completed</span></div>
                    </div>
                    
                    <div className="grid grid-cols-4 px-5 py-3 border-b border-border border-dashed items-center text-xs">
                      <div className="text-muted-foreground">Mar 15, 2026</div>
                      <div className="font-medium text-foreground">Gusto Payroll</div>
                      <div className="font-semibold">-$85,450.00</div>
                      <div><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Completed</span></div>
                    </div>

                    <div className="grid grid-cols-4 px-5 py-3 items-center text-xs">
                      <div className="text-muted-foreground">Mar 12, 2026</div>
                      <div className="font-medium text-foreground">WeWork Office</div>
                      <div className="font-semibold">-$1,200.00</div>
                      <div><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Completed</span></div>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
