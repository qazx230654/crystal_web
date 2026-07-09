import { SectionHeading } from "@/components/section-heading";
import { workshopExperiences } from "@/app/crystal-workshop/workshop-model";
import { WorkshopTabs } from "@/app/crystal-workshop/workshop-tabs";
import { WorkshopSocialProof } from "@/app/crystal-workshop/workshop-social-proof";

export default function WorkshopPage() {
  return (
    <>
      <section className="container-shell py-14">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeading
            body="無論是想開啟一段療癒的時光，或是想將愛好轉化為事業，我們都為您準備了最細緻的引導。"
            eyebrow="Workshop & Course"
            title="在頻率中，遇見更好的自己"
          />
        </div>

        <div className="mt-4">
          <WorkshopTabs experiences={workshopExperiences} />
        </div>
      </section>

      <WorkshopSocialProof />
    </>
  );
}
