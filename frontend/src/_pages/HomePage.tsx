import Link from "next/link";
import { ArrowRight, FileStack, Globe2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="studio-mesh flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="font-serif text-xl font-semibold tracking-tight text-ink">
          DocuMind
        </span>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="mark" asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </nav>
      </header>

      <section className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-16 pt-10 text-center sm:px-10">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-72 w-full max-w-3xl rounded-full bg-gradient-to-b from-mark/15 via-glow/10 to-transparent blur-3xl"
          aria-hidden
        />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mark-strong panel-enter">
          AI document studio
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-6xl panel-enter">
          DocuMind
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-dim panel-enter">
          Choose your sources. Ask grounded questions. Bring in the web when you need
          it — a NotebookLM-style studio for your own knowledge base.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 panel-enter">
          <Button size="lg" variant="mark" asChild>
            <Link href="/register">
              Open your studio <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-line/80 bg-surface/70 px-6 py-16 backdrop-blur-sm sm:px-10">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {[
            {
              icon: FileStack,
              title: "Pick your sources",
              body: "Select exactly which documents the assistant can search — nothing else.",
            },
            {
              icon: Globe2,
              title: "Web when you need it",
              body: "Toggle open-web access or pin specific URLs alongside your library.",
            },
            {
              icon: Quote,
              title: "Cited answers",
              body: "Every reply links back to passages so you can verify what you read.",
            },
          ].map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="panel-enter"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-glow">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
