import Link from "next/link";
import { ArrowRight, FileSearch, Layers, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";

const PIPELINE = [
  {
    step: "01",
    title: "Upload",
    body: "Drop in contracts, reports, or notes as PDF, DOCX, or HTML.",
  },
  {
    step: "02",
    title: "Index",
    body: "Each file is chunked, embedded, and stored as searchable vectors.",
  },
  {
    step: "03",
    title: "Ask",
    body: "Ask a question in plain language, the way you'd ask a colleague.",
  },
  {
    step: "04",
    title: "Answer",
    body: "DocuMind retrieves the relevant passages and grounds its answer in them.",
  },
];

const FEATURES = [
  {
    icon: FileSearch,
    title: "Semantic search",
    body: "Find what you mean, not just the words you typed — matching is done on meaning, not keywords.",
  },
  {
    icon: Layers,
    title: "Multi-agent reasoning",
    body: "A router hands your question to a research, summarizer, or action agent depending on what you're asking for.",
  },
  {
    icon: MessageSquareText,
    title: "Traceable answers",
    body: "Every response links back to the exact document and passage it came from, so you can verify it yourself.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-line px-6 py-4 sm:px-10">
        <span className="font-serif text-lg font-semibold text-ink">DocuMind</span>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="mark" asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-20 text-center sm:px-10">
        <h1 className="font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Turn your documents into a knowledge base you can talk to.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-dim">
          Upload your contracts, reports, and research. Ask questions in plain
          language. DocuMind finds the passage that answers you and shows you
          exactly where it came from.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button size="lg" variant="mark" asChild>
            <Link href="/register">
              Create your knowledge base <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-line bg-paper-dim px-6 py-16 sm:px-10">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((item) => (
            <div key={item.step} className="rounded-lg border border-line bg-paper p-5">
              <span className="font-mono text-xs text-mark-strong">{item.step}</span>
              <h3 className="mt-2 font-serif text-lg font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-mark-dim-2">
                <Icon className="h-5 w-5 text-mark-strong" />
              </div>
              <h3 className="mt-3 font-serif text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-sm text-ink-dim sm:px-10">
        DocuMind — turn your documents into an intelligent knowledge base.
      </footer>
    </div>
  );
}
