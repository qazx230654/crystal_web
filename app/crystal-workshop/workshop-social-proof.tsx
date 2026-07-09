import { Star } from "lucide-react";
import { popularExperienceSpotlight, workshopTestimonials } from "@/app/crystal-workshop/workshop-model";

export function WorkshopSocialProof() {
  return (
    <section className="home-panel home-panel-ink relative isolate mt-16 overflow-hidden py-16 text-white md:py-20">
      <div className="home-panel-ambient" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <p className="luxury-eyebrow text-crystal-champagne">{popularExperienceSpotlight.eyebrow}</p>
        <h3 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">
          {popularExperienceSpotlight.emoji} {popularExperienceSpotlight.title}
        </h3>
        <p className="mt-5 leading-8 text-white/75">{popularExperienceSpotlight.description}</p>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          {popularExperienceSpotlight.highlights.map((item) => (
            <div className="flex items-start gap-2 text-sm leading-6 text-white/80" key={item}>
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-crystal-champagne" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-14 px-6">
        <p className="luxury-eyebrow text-center text-crystal-champagne">✦ 學員好評 ✦</p>
        <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-3">
          {workshopTestimonials.map((testimonial) => (
            <div
              className="rounded-md border border-white/12 bg-white/[0.04] p-6 backdrop-blur transition duration-300 hover:border-crystal-gold/50 hover:bg-white/[0.07]"
              key={testimonial.name}
            >
              <div className="flex gap-0.5 text-crystal-gold">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star fill="currentColor" key={index} size={13} strokeWidth={0} />
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-white/80">「{testimonial.quote}」</p>
              <p className="mt-4 text-xs font-semibold text-crystal-champagne">
                — {testimonial.name} · {testimonial.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
