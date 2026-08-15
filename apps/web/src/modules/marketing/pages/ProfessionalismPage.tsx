import ImageCarousel from "../components/ImageCarousel/ImageCarousel";
import PageHero from "@/shared/ui/PageHero/PageHero";
import CareerHighlights from "../components/CareerHighlights/CareerHighlights";
import SponsorCarousel from "../components/SponsorCarousel/SponsorCarousel";

const supportCards = [
  {
    title: "Resume Workshop",
    body: "We host resume workshops to equip members with essential career-building skills — guidance on formatting, content, and tailoring resumes for specific industries or roles, so brothers can craft resumes that highlight their strengths and ambitions.",
  },
  {
    title: "On-Site Tours",
    body: "Our alumni network offers frequent on-site tours at various workplaces, providing valuable industry insight and networking opportunities that deepen our understanding of career paths and broaden perspectives on the professional world.",
  },
  {
    title: "Mock Interview",
    body: "Mock interviews simulate the real thing, helping us practice answering questions, highlight strengths, and sharpen communication. Feedback from experienced members and alumni refines our techniques and builds confidence.",
  },
];

export function ProfessionalismPage() {
  return (
    <>
      <PageHero
        fileName="Professionalism.jpg"
        title="Professionalism"
        eyebrow="Career Development"
      />

      <section className="section">
        <div className="container-narrow text-center">
          <h2 className="section-title">Navigating the path to career success</h2>
          <div className="prose-body mx-auto mt-6 text-left">
            <p>
              We prepare our members for the job market with workshops, seminars, and mentorship
              that develop essential skills like communication, teamwork, problem-solving, and
              leadership. Topics include resume building, interview prep, networking strategy, and
              professional etiquette.
            </p>
            <p>
              Our extensive alumni network provides hands-on experience through internships, tours,
              job shadowing, and industry partnerships. This practical exposure helps members apply
              skills, gain insight, and build professional networks — the tools vital for success in
              today&rsquo;s job market.
            </p>
          </div>
        </div>

        <div className="container-page mt-12">
          <div className="panel flex flex-col items-center gap-8 p-6 sm:p-10 lg:flex-row lg:items-start lg:gap-12">
            <div className="shrink-0 overflow-hidden rounded-lg">
              <ImageCarousel slides={["CarineGordilloIntern.jpg", "MiaCastroIntern.jpg"]} />
            </div>
            <div className="prose-body font-medium">
              <p>
                In the competitive world of engineering internships, Xi Epsilon&rsquo;s professional
                development committee supports members in landing opportunities. We provide resume
                reviews, mock interviews, and encourage an active LinkedIn presence. Currently
                twelve active brothers are in co-ops, with others securing summer internships.
              </p>
              <p>
                Former regent Adam Bhuiyan credits the committee for his internship success, citing
                industry events, resume workshops, and interview practice. Carine Gordillo
                attributes her Microsoft internship to Theta Tau&rsquo;s mentorship, and Mia Castro
                landed a Gray Construction internship with support from fellow brothers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-muted section-tight">
        <div className="container-page">
          <p className="eyebrow">Where Theta Tau can take you</p>
          <h2 className="section-title mt-3">Our members work at</h2>
          <div className="mt-10">
            <CareerHighlights />
            <SponsorCarousel />
          </div>
        </div>
      </section>

      <section className="section-muted section">
        <div className="container-page">
          <div className="max-w-3xl">
            <h2 className="section-title">A strong introduction can transform your career</h2>
            <p className="lead mt-4">
              Generic applications often fall flat with top-tier employers. We connect you with the
              opportunities that shape a professional journey by harnessing personal connections and
              networking.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {supportCards.map((card) => (
              <div key={card.title} className="card flex flex-col gap-3 p-8">
                <h3 className="subsection-title">{card.title}</h3>
                <p className="prose-body">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default ProfessionalismPage;
