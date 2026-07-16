"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { workshopExperiences } from "@/app/crystal-workshop/workshop-model";

export default function AdminExperiencesPage() {
  return (
    <section className="container-shell py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-crystal-rose">Admin</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold">預約體驗管理</h1>
          <p className="mt-3 text-sm text-crystal-muted">管理各體驗的價格方案，以及開放預約的場次與名額。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/dashboard">後台總覽</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/bookings">預約列表</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {workshopExperiences.map((experience) => (
          <Link
            className="flex items-center justify-between gap-4 rounded-md border border-crystal-line bg-white/70 p-6 transition hover:border-crystal-rose"
            href={`/admin/experiences/${experience.id}`}
            key={experience.id}
          >
            <div>
              <h2 className="text-lg font-semibold">{experience.title}</h2>
              <p className="mt-1 text-sm text-crystal-muted">管理方案與場次</p>
            </div>
            <ArrowRight className="shrink-0 text-crystal-muted" size={18} />
          </Link>
        ))}
      </div>
    </section>
  );
}
