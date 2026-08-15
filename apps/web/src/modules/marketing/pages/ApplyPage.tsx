import PageHero from "@/shared/ui/PageHero/PageHero";
import RushTimeline from "../components/RushTimeline/RushTimeline";
import OutlinedButton from "@/shared/ui/OutlinedButton/OutlinedButton";
import { recruitmentTerm, siteLinks } from "../content/site-content";

const eligibility = [
  "Enrolled in the CSULB College of Engineering",
  "Cumulative GPA of 2.5 or above",
  "At least two semesters remaining at CSULB",
];

const attire = [
  {
    label: "Tops",
    text: "Men: collared shirts such as button-downs, polos, or sweaters; turtlenecks are also acceptable. Women: blouses, collared shirts, sweaters, cardigans, or tailored tops. Sleeveless tops should have a modest neckline.",
  },
  {
    label: "Bottoms",
    text: "Men: dress slacks, khakis, chinos, or tailored trousers — avoid cargo pants, jeans, or overly casual styles. Women: dress pants, khakis, chinos, tailored skirts, or dresses at or below the knee.",
  },
  {
    label: "Footwear",
    text: "Closed-toe shoes such as loafers, dress shoes, flats, or boots. Avoid sneakers, flip-flops, or overly casual footwear.",
  },
  {
    label: "Accessories",
    text: "Keep accessories simple and professional. Belts should match your shoes, and jewelry should be understated.",
  },
  {
    label: "Outerwear",
    text: "Blazers, sport coats, or professional cardigans can be worn over tops. Avoid hoodies, denim jackets, or casual outerwear indoors.",
  },
];

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 flex-none text-gold"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 0 1.42l-7.5 7.5a1 1 0 0 1-1.42 0l-3.5-3.5a1 1 0 1 1 1.42-1.42l2.79 2.79 6.79-6.79a1 1 0 0 1 1.42 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ApplyPage() {
  return (
    <>
      <PageHero
        fileName="MeetUs.jpg"
        title="Recruitment"
        eyebrow={`Join Theta Tau · ${recruitmentTerm}`}
      />

      {/* Intro + eligibility */}
      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          <div>
            <p className="eyebrow">Recruitment</p>
            <h2 className="section-title mt-3">Become part of the next class</h2>
            <div className="prose-body mt-5 max-w-2xl">
              <p>
                Theta Tau is recruiting driven individuals to join our upcoming class. We welcome
                applicants at any stage of their academic or professional journey — what matters is
                the commitment to grow as an engineer and a leader.
              </p>
              <p>
                Keep an eye out for application resources, including those on our{" "}
                <a
                  href={siteLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gold-ink underline decoration-gold/50 underline-offset-2"
                >
                  Instagram
                </a>{" "}
                stories and highlighted takeovers.
              </p>
            </div>
            <a
              href={siteLinks.applicationForm}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex no-underline"
            >
              <OutlinedButton text="Start Application" fontSize="1rem" />
            </a>
          </div>

          <aside className="card h-fit p-7 lg:p-8">
            <span className="accent-bar" />
            <h3 className="subsection-title mt-4">Eligibility</h3>
            <ul className="mt-5 list-none space-y-4 p-0">
              {eligibility.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckIcon />
                  <span className="prose-body">{item}</span>
                </li>
              ))}
            </ul>
            <hr className="rule my-6" />
            <p className="text-sm leading-relaxed text-muted">
              Exchange and study-abroad students are not eligible to apply.
            </p>
          </aside>
        </div>
      </section>

      {/* Rushing */}
      <section className="section-muted section">
        <div className="container-page">
          <p className="eyebrow">The process</p>
          <h2 className="section-title mt-3">Rushing</h2>
          <p className="prose-body mt-4 max-w-3xl">
            Rush is your chance to explore Theta Tau further. It includes events designed to give
            insight into our values and assess mutual fit. At the conclusion of rush, we extend a
            select number of interviews and bids. If you receive a bid, you choose whether to
            pledge.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-panel px-4 py-2 text-sm font-semibold text-brand">
            Rushing is entirely free and carries no obligations.
          </p>

          <h3 className="subsection-title mt-12">Rush Timeline</h3>
          <RushTimeline />
        </div>
      </section>

      {/* Attire */}
      <section id="attire-guidelines" className="section">
        <div className="container-page">
          <p className="eyebrow">What to wear</p>
          <h2 className="section-title mt-3">Attire Guidelines</h2>
          <p className="lead mt-2">Business casual for all recruitment events.</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {attire.map((item) => (
              <div key={item.label} className="card flex flex-col gap-2 p-6">
                <span className="accent-bar" />
                <h3 className="subsection-title mt-3">{item.label}</h3>
                <p className="prose-body">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-brand text-white">
        <div className="container-page section text-center">
          <p className="eyebrow eyebrow-invert">We&rsquo;re here to help</p>
          <h2 className="section-title mt-3 text-white">Questions before you apply?</h2>
          <p className="lead mx-auto mt-4 max-w-2xl text-white/85">
            Thank you for your interest in Theta Tau. Our brothers are happy to answer your
            questions and help you through the process whenever you need it.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={siteLinks.applicationForm}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-3 font-semibold text-ink no-underline transition-colors duration-200 hover:bg-white"
            >
              Start Application
            </a>
            <a
              href={`mailto:${siteLinks.contactEmail}`}
              className="inline-flex items-center justify-center rounded-full border-2 border-white/70 px-7 py-3 font-semibold text-white no-underline transition-colors duration-200 hover:bg-white/10"
            >
              {siteLinks.contactEmail}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default ApplyPage;
