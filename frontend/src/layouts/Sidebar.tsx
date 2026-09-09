"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileStack, MessagesSquare, LogOut } from "lucide-react";
import { cn, initials } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { href: "/chat", label: "Chat", icon: MessagesSquare },
  { href: "/documents", label: "Documents", icon: FileStack },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-60 flex-col justify-between border-r border-line bg-paper-dim px-4 py-6">
      <div>
        <Link href="/chat" className="block px-2 font-serif text-lg font-semibold text-ink">
          DocuMind
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = (pathname ?? "").startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-ink text-paper"
                    : "text-ink-dim hover:bg-paper-inset hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-paper-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mark">
            <Avatar>
              <AvatarFallback>{initials(user.email)}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm text-ink-dim">{user.email}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
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
    </aside>
  );
}
