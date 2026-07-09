import Image from "next/image";
import { Reveal } from "@/components/reveal";
import type { BrandStorySection } from "@/app/about/brand-story-model";

export function BrandStorySections({ sections }: { sections: BrandStorySection[] }) {
  return (
    <div className="space-y-24 md:space-y-32">
      {sections.map((section) => (
        <Reveal as="div" key={section.id}>
          <div className={`flex ${section.reverse ? "justify-end text-right" : "justify-start text-left"}`}>
            <div>
              <span className="block font-serif text-8xl leading-none text-crystal-gold md:text-9xl">{section.index}</span>
              <span className="mt-3 block text-xs font-semibold uppercase tracking-[0.28em] text-crystal-muted">{section.navLabel}</span>
            </div>
          </div>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <div className={`order-2 ${section.reverse ? "md:order-2" : "md:order-1"}`}>
              <p className="luxury-eyebrow">{section.eyebrow}</p>
              <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight text-crystal-ink md:text-5xl">{section.title}</h2>
              <div className="mt-6 space-y-5 leading-8 text-crystal-muted">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <ul className="mt-8 space-y-3 border-t border-crystal-line pt-6">
                {section.highlights.map((item) => (
                  <li className="flex items-start gap-3 text-sm text-crystal-ink" key={item}>
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-crystal-gold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className={`group order-1 relative aspect-4/5 overflow-hidden rounded-md border border-crystal-line shadow-soft ${
                section.reverse ? "md:order-1" : "md:order-2"
              }`}
            >
              <Image
                alt={section.image.alt}
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                src={section.image.src}
              />
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
