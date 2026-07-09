"use client";

import Image from "next/image";
import { Clock, MapPin, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkshopExperience, WorkshopTagIcon } from "@/app/crystal-workshop/workshop-model";

const tagIcons: Record<WorkshopTagIcon, typeof MapPin> = {
  location: MapPin,
  people: Users,
  duration: Clock
};

export function WorkshopTabs({ experiences }: { experiences: WorkshopExperience[] }) {
  if (!experiences.length) return null;

  return (
    <Tabs className="flex flex-col gap-8" defaultValue={experiences[0].id}>
      <TabsList className="h-auto w-full flex-wrap justify-start gap-x-6 gap-y-3 rounded-none border-y border-crystal-line bg-transparent p-0 py-4">
        {experiences.map((experience) => (
          <TabsTrigger
            className="h-auto rounded-none border-b border-transparent bg-transparent px-1 pb-2 text-xs text-crystal-muted shadow-none transition hover:border-crystal-gold hover:text-crystal-ink data-[state=active]:border-crystal-gold data-[state=active]:bg-transparent data-[state=active]:text-crystal-ink"
            key={experience.id}
            value={experience.id}
          >
            {experience.title}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="hero-stage relative isolate overflow-hidden rounded-md border border-crystal-champagne/60 bg-crystal-pearl/50 p-6 md:p-12">
        <div className="hero-ambient" aria-hidden="true">
          <span className="hero-veil hero-veil-one" />
          <span className="hero-veil hero-veil-two" />
          <span className="hero-lattice" />
          <span className="hero-cut hero-cut-one" />
          <span className="hero-cut hero-cut-two" />
        </div>

        {experiences.map((experience) => (
          <TabsContent
            className="tab-panel-reveal relative z-10 grid gap-10 outline-none lg:grid-cols-[0.85fr_1.15fr] lg:items-start"
            key={experience.id}
            value={experience.id}
          >
            <div className="mx-auto w-full max-w-sm lg:mx-0">
              <div className="rotate-[-1.5deg] rounded-sm border border-crystal-line bg-white p-3 pb-8 shadow-soft transition duration-500 hover:rotate-0">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2px]">
                  <Image
                    alt={experience.image.alt}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 32vw, 90vw"
                    src={experience.image.src}
                  />
                </div>
                <p className="mt-4 text-center font-serif text-sm text-crystal-muted">{experience.image.caption}</p>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-semibold text-crystal-ink md:text-3xl">{experience.title}</h3>
              {experience.description ? (
                <p className="mt-3 max-w-xl text-sm leading-7 text-crystal-muted">{experience.description}</p>
              ) : null}

              {experience.tags.length ? (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {experience.tags.map((tag) => {
                    const Icon = tagIcons[tag.icon];
                    return (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-crystal-line bg-white/80 px-3 py-1.5 text-[11px] font-medium text-crystal-muted"
                        key={tag.label}
                      >
                        <Icon className="text-crystal-gold" size={13} />
                        {tag.label}
                      </span>
                    );
                  })}
                </div>
              ) : null}

              <p className="mt-8 text-sm font-semibold text-crystal-ink">{experience.highlightsTitle}</p>
              <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {experience.highlights.map((item) => (
                  <div className="flex items-start gap-2 text-sm leading-6 text-crystal-muted" key={item}>
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-crystal-rose" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {experience.pricing ? (
                <div className="mt-8 rounded-md border border-crystal-gold/30 bg-white/85 p-5 shadow-soft backdrop-blur">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-crystal-muted">課程費用 Pricing</p>
                      <p className="mt-2 font-serif text-3xl font-semibold text-crystal-rose">
                        {experience.pricing.price}
                        {experience.pricing.note ? (
                          <span className="ml-2 text-xs font-sans font-normal text-crystal-muted">（{experience.pricing.note}）</span>
                        ) : null}
                      </p>
                    </div>
                    {experience.pricing.groupDiscounts?.length ? (
                      <div className="text-right text-xs leading-6 text-crystal-muted">
                        <p className="font-bold text-crystal-ink">多人同行優惠</p>
                        <p>{experience.pricing.groupDiscounts.join(" ｜ ")}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <a
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#06c755] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(6,199,85,0.28)] transition hover:brightness-105"
                href={experience.cta.href}
                rel="noreferrer"
                target="_blank"
              >
                {experience.cta.label}
              </a>
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
