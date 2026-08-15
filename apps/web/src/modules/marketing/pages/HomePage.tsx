import { Link } from "react-router-dom";
import HeroParallax from "../components/HeroParallax/HeroParallax";
import { PillarsSection } from "../components/PillarsSection/PillarsSection";
import ResponsiveButton from "@/shared/ui/ResponsiveButton/ResponsiveButton";
import { assetUrl } from "@/shared/lib/assets";

const achievements = [
  { stat: "1st", label: "Engineering fraternity at CSULB" },
  { stat: "1st", label: "Chapter in a California State University" },
  { stat: "1 yr", label: "To install the Xi Epsilon Chapter" },
] as const;

export function HomePage() {
  return (
    <>
      <HeroParallax />

      {/* Purpose */}
      <section className="section-muted section">
        <div className="container-narrow text-center">
          <p className="eyebrow">Our Purpose</p>
          <p className="mt-4 text-balance text-2xl font-semibold leading-snug text-ink sm:text-3xl">
            To develop and maintain a high standard of professional interest among its members, and
            to unite them in a{" "}
            <span className="text-gold-ink">strong bond of fraternal fellowship</span>.
          </p>
        </div>
      </section>

      {/* Who we are */}
      <section className="section">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <p className="eyebrow">Who we are</p>
            <p className="prose-body">
              Welcome to Theta Tau at Long Beach, a co-ed professional engineering fraternity
              committed to building a strong community of engineers and students across the nation.
              Through unity, diversity, and dedication, we foster fraternal fellowship, support
              professional growth, and serve our communities.
            </p>
            <Link to="/about" target="_top" className="no-underline">
              <ResponsiveButton />
            </Link>
          </div>
          <img
            src={assetUrl("WhoAreWe.jpg")}
            alt="Members of Theta Tau at Long Beach"
            className="h-full w-full rounded-lg object-cover shadow-card"
          />
        </div>
      </section>

      {/* Achievements */}
      <section className="bg-brand text-white">
        <div className="container-page section-tight">
          <p className="eyebrow eyebrow-invert text-center">Our Achievements</p>
          <ul className="mt-8 grid list-none grid-cols-1 gap-8 p-0 text-center sm:grid-cols-3">
            {achievements.map((item) => (
              <li key={item.label} className="flex flex-col items-center gap-2">
                <span className="text-6xl font-extrabold uppercase tracking-tight text-white">
                  {item.stat}
                </span>
                <span className="max-w-[16rem] text-lg text-white/90">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PillarsSection />

      <img
        src={assetUrl("FillerPic.jpg")}
        alt="Theta Tau members together"
        className="block h-[100dvh] w-full object-cover"
      />
    </>
  );
}

export default HomePage;
