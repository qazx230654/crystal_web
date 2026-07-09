import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

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
    <div className="mb-10 luxury-reveal">
      {eyebrow ? (
        <AnimatedShinyText className="luxury-eyebrow" shimmerWidth={80}>
          {eyebrow}
        </AnimatedShinyText>
      ) : null}
      <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-crystal-ink md:text-4xl">{title}</h2>
      {body ? <p className="mt-4 max-w-2xl text-sm leading-7 text-crystal-muted">{body}</p> : null}
    </div>
  );
}
