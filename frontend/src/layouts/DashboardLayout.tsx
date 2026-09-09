"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Library, LogOut, Sparkles } from "lucide-react";
import { cn, initials } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

const NAV = [
  { href: "/chat", label: "Studio", icon: Sparkles },
  { href: "/documents", label: "Library", icon: Library },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="studio-mesh flex h-screen w-full flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line/80 bg-surface/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/chat" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-glow">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="font-serif text-lg font-semibold tracking-tight text-ink">
                DocuMind
              </span>
            </Link>

            <nav className="hidden items-center gap-1 sm:flex">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = (pathname ?? "").startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-ink text-surface shadow-sm"
                        : "text-ink-dim hover:bg-paper-inset hover:text-ink"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1 pr-3 transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mark">
                <Avatar>
                  <AvatarFallback>{initials(user.email)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[10rem] truncate text-sm text-ink-dim sm:block">
                  {user.email}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  destructive
                  onSelect={() => {
                    logout();
                    router.push("/login");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
