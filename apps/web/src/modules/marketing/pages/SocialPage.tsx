import type { ReactNode } from "react";
import PageHero from "@/shared/ui/PageHero/PageHero";
import FamilyCarousel from "../components/FamilyCarousel/FamilyCarousel";
import { assetUrl } from "@/shared/lib/assets";

interface Section {
  title: string;
  body: string;
  media: ReactNode;
}

const sections: Section[] = [
  {
    title: "Retreats",
    body: "We prioritize connection and growth beyond campus. Each semester we organize transformative retreats focused on deepening bonds, broadening horizons, and honing life skills. Through team-building and meaningful discussion, our retreats create lasting memories and embrace new perspectives.",
    media: (
      <img
        src={assetUrl("Retreat.jpg")}
        alt="Chapter retreat"
        className="aspect-[4/3] w-full rounded-lg object-cover shadow-card"
      />
    ),
  },
  {
    title: "Regionals",
    body: "Regionals are the pulse of our regional network, bringing chapters together for a weekend of camaraderie, fun, and meaningful connection. Hosted by different chapters, they offer a chance to meet new people, build lasting friendships, and grow professional networks through workshops and competitions.",
    media: (
      <img
        src={assetUrl("Regionals.jpg")}
        alt="Regional conference"
        className="aspect-[4/3] w-full rounded-lg object-cover shadow-card"
      />
    ),
  },
  {
    title: "Intramural Sports",
    body: "We believe in the spirit of healthy competition and teamwork. We come together as a brotherhood to showcase our athletic prowess and sportsmanship — on the field, court, or track — supporting each other every step of the way. Intramural sports aren't just about winning; they're about bonding and having fun.",
    media: (
      <img
        src={assetUrl("IMSports.jpg")}
        alt="Intramural sports"
        className="aspect-[3/4] w-full rounded-lg object-cover shadow-card"
      />
    ),
  },
  {
    title: "Big-Littles",
    body: "We cherish the concept of frat families, where bonds are strengthened for a lifetime. Each member is part of a unique family, fostering belonging, support, and brotherhood. From bigs guiding the way to littles bringing fresh perspectives, frat families are the heart of the Theta Tau experience.",
    media: (
      <div className="overflow-hidden rounded-lg shadow-card">
        <FamilyCarousel />
      </div>
    ),
  },
];

export function SocialPage() {
  return (
    <>
      <PageHero fileName="Social.jpg" title="Social" eyebrow="Brotherhood" />

      <section className="section-muted section-tight">
        <div className="container-narrow text-center">
          <h2 className="section-title">Lasting friendships and lifelong connections</h2>
          <p className="lead mt-4">
            Tap into a thriving community that fosters lifelong friendships. Our supportive
            environment builds relationships that enrich both personal and professional journeys.
          </p>
        </div>
      </section>

      <div className="section">
        <div className="container-page flex flex-col gap-16 md:gap-24">
          {sections.map((section, index) => (
            <div key={section.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
              <div className={index % 2 === 1 ? "md:order-last" : ""}>{section.media}</div>
              <div className="flex flex-col gap-4">
                <h2 className="subsection-title">{section.title}</h2>
                <p className="prose-body">{section.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default SocialPage;
