"use client";

import { useEffect, useState } from "react";

export function GuideNav({ sections }: { sections: readonly { id: string; title: string }[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      let current = sections[0]?.id;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= scrollPosition) {
          current = section.id;
        }
      }
      setActiveId(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-y border-crystal-line py-4">
      {sections.map((section) => (
        <a
          className={`border-b px-1 pb-2 text-xs transition hover:border-crystal-gold hover:text-crystal-ink ${
            activeId === section.id ? "border-crystal-gold text-crystal-ink" : "border-transparent text-crystal-muted"
          }`}
          href={`#${section.id}`}
          key={section.id}
        >
          {section.title}
        </a>
      ))}
    </nav>
  );
}
