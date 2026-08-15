import { Link } from "react-router-dom";
import { assetUrl } from "@/shared/lib/assets";
import Button from "@/shared/ui/Button/Button";

const pillars = [
  {
    title: "Philanthropy",
    image: "PhilanthrophyIcon.png",
    route: "/service",
    description:
      "We encourage members to give back to their communities through volunteer activities, philanthropic initiatives, and service projects.",
  },
  {
    title: "Professionalism",
    image: "ProfessionalismIcon.png",
    route: "/professionalism",
    description:
      "Members uphold high standards of ethics, integrity, and responsibility in academic, personal, and professional work.",
  },
  {
    title: "Brotherhood",
    image: "BrotherhoodIcon.png",
    route: "/social",
    description:
      "We cultivate strong friendships and a supportive environment where members connect, collaborate, and grow together.",
  },
] as const;

export function PillarsSection() {
  return (
    <section className="section-muted section">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Our Pillars</p>
          <h2 className="section-title mt-3">
            Three pillars carry the core values and principles of our chapter.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="card flex flex-col items-start gap-4 p-8">
              <img src={assetUrl(pillar.image)} alt="" className="h-16 w-16 object-contain" />
              <h3 className="subsection-title">{pillar.title}</h3>
              <p className="prose-body flex-1">{pillar.description}</p>
              <Link to={pillar.route} target="_top" className="no-underline">
                <Button text="Learn More" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PillarsSection;
