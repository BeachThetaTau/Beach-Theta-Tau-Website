import PageHero from "@/shared/ui/PageHero/PageHero";
import ResponsiveButton from "@/shared/ui/ResponsiveButton/ResponsiveButton";
import MajorBreakdownChart from "../components/MajorBreakdownChart/MajorBreakdownChart";
import { assetUrl } from "@/shared/lib/assets";
import { siteLinks } from "../content/site-content";

export function AboutPage() {
  return (
    <>
      <PageHero fileName="About.jpg" title="About" eyebrow="Xi Epsilon Chapter" />

      {/* Motto */}
      <section className="section">
        <div className="container-narrow flex flex-col items-center text-center">
          <img
            src={assetUrl("Hammer-and-tongs.png")}
            alt="Theta Tau hammer and tongs emblem"
            className="h-auto w-full max-w-[26rem]"
          />
          <p className="eyebrow mt-6">Our Motto</p>
          <blockquote className="mt-4 text-3xl font-medium italic leading-snug text-ink sm:text-4xl">
            &ldquo;Whatsoever thy hand findeth to do, do it with thy might&rdquo;
          </blockquote>
          <cite className="mt-4 text-xl not-italic font-semibold text-gold-ink">
            — Ecclesiastes 9:10
          </cite>
        </div>
      </section>

      {/* National org */}
      <section className="section-muted section">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 className="subsection-title">Theta Tau</h2>
            <p className="prose-body">
              Theta Tau stands as the premier fraternity for engineers, boasting a rich legacy as
              the oldest and largest of its kind. Established in 1904 at the University of
              Minnesota, it has welcomed over 40,000 brothers into its esteemed ranks. Upholding a
              commitment to excellence and fostering a robust fraternal spirit, Theta Tau maintains
              chapters exclusively at ABET-accredited schools, underscoring its dedication to
              quality education and engineering principles.
            </p>
            <a
              href={siteLinks.nationalOrganization}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline"
            >
              <ResponsiveButton />
            </a>
          </div>
          <img
            src={assetUrl("TTFounders.jpg")}
            alt="Theta Tau national founders"
            className="h-full w-full rounded-lg object-cover shadow-card"
          />
        </div>
      </section>

      {/* Chapter */}
      <section className="section">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <img
            src={assetUrl("Founders.jpg")}
            alt="Xi Epsilon founders"
            className="order-last h-full w-full rounded-lg object-cover shadow-card lg:order-first"
          />
          <div className="flex flex-col items-start gap-5">
            <h2 className="subsection-title">Our Chapter: Xi Epsilon</h2>
            <p className="prose-body">
              In the autumn of 2017, students within CSULB&rsquo;s College of Engineering recognized
              a notable absence of engineering presence within the campus&rsquo;s Greek community.
              In response, nine visionary individuals embarked on the journey to establish a chapter
              of the nation&rsquo;s most established and expansive professional engineering
              fraternity at CSULB. Their efforts culminated on October 13th, 2018, with the official
              installation of CSULB as the Xi Epsilon Chapter of Theta Tau.
            </p>
          </div>
        </div>
      </section>

      <MajorBreakdownChart />
    </>
  );
}

export default AboutPage;
