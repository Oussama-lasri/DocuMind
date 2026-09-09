import Link from "next/link";

const CARD_LINES = [
  ["w-4/5", "w-3/5", "w-full", "w-2/3"],
  ["w-full", "w-1/2", "w-3/4"],
  ["w-2/3", "w-full", "w-1/3", "w-3/5"],
];

function IndexCards() {
  return (
    <div className="relative h-64 w-64">
      {CARD_LINES.map((lines, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-md border border-paper/15 bg-[#212b39] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
          style={{
            transform: `rotate(${(i - 1) * 7}deg) translateY(${i * 6}px)`,
          }}
        >
          <div className="flex flex-col gap-2.5">
            {lines.map((w, j) => (
              <span
                key={j}
                className={`h-2 rounded-sm bg-paper/20 ${w} ${
                  i === 1 && j === 1 ? "!bg-mark/70" : ""
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink px-14 py-12 text-paper lg:flex">
        <Link href="/" className="font-serif text-xl font-semibold">
          DocuMind
        </Link>

        <div className="flex items-center justify-center py-10">
          <IndexCards />
        </div>

        <div className="max-w-md">
          <h1 className="font-serif text-3xl font-semibold leading-tight text-paper">
            {headline}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-paper/70">{body}</p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 block font-serif text-xl font-semibold lg:hidden">
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
