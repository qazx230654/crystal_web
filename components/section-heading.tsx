export function SectionHeading({
  eyebrow,
  title,
  body
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mb-8">
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">{eyebrow}</p> : null}
      <h2 className="mt-2 font-serif text-4xl font-semibold text-crystal-ink md:text-5xl">{title}</h2>
      {body ? <p className="mt-4 max-w-2xl text-sm leading-7 text-crystal-muted">{body}</p> : null}
    </div>
  );
}
