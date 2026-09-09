import Link from "next/link";
import { BookOpen } from "lucide-react";

export function AuthShell({
  eyebrowHref,
  eyebrowLabel,
  headline,
  body,
  children,
}: {
  eyebrowHref: string;
  eyebrowLabel: string;
  headline: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink px-12 py-12 text-surface lg:flex">
        <div
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-mark/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-10 left-10 h-56 w-56 rounded-full bg-glow/20 blur-3xl"
          aria-hidden
        />

        <Link href="/" className="relative z-10 flex items-center gap-2.5 font-serif text-xl font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface/10 text-glow">
            <BookOpen className="h-4 w-4" />
          </span>
          DocuMind
        </Link>

        <div className="relative z-10 max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-glow/80">
            Studio
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-surface">
            {headline}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-surface/70">{body}</p>
        </div>

        <p className="relative z-10 text-sm text-surface/45">
          Sources in · grounded answers out.
        </p>
      </div>

      <div className="studio-mesh flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm panel-enter">
          <Link
            href="/"
            className="mb-10 flex items-center gap-2 font-serif text-xl font-semibold lg:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-glow">
              <BookOpen className="h-3.5 w-3.5" />
            </span>
            DocuMind
          </Link>
          {children}
          <p className="mt-8 text-center text-sm text-ink-dim">
            <Link href={eyebrowHref} className="font-medium text-mark-strong hover:underline">
              {eyebrowLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
