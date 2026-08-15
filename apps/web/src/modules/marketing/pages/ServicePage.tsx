import PageHero from "@/shared/ui/PageHero/PageHero";
import { assetUrl } from "@/shared/lib/assets";

const empowerCards = [
  {
    image: "Volunteering.jpg",
    title: "Volunteer",
    body: "Through collaborative efforts with fellow volunteers, we directly uplift the lives of those in our community who need support the most.",
  },
  {
    image: "Donation.jpg",
    title: "Donating Meals",
    body: "Our meal-donation initiatives make a tangible impact on individuals and families in need, fostering a healthier, more resilient community.",
  },
  {
    image: "Conservation.jpg",
    title: "Conservation Efforts",
    body: "Alongside passionate volunteers, we contribute to preserving and protecting the environment for future generations.",
  },
];

const spotlights = [
  {
    image: "BeachCleanUp.jpg",
    title: "Beach Clean-Up",
    body: "Teaming up with our local USC chapter, we combed the shores together — restoring the coastline's beauty and showing the power of small actions in preserving nature.",
  },
  {
    image: "MesaDay.jpg",
    title: "Mesa Day",
    body: "As part of the Nu class's process, they fully engage in Mesa Day — supporting logistics, mentoring, and cheering on teams, fostering academic excellence and collaboration.",
  },
  {
    image: "SoupKitchen.jpg",
    title: "Soup Kitchen",
    body: "We volunteered at a soup kitchen as part of our commitment to community engagement, reflecting our values of compassion, dedication, and impact.",
  },
];

export function ServicePage() {
  return (
    <>
      <PageHero fileName="Service.jpg" title="Service" eyebrow="Philanthropy" />

      {/* Intro */}
      <section className="section-muted section">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="section-title">Strengthen our community through service</h2>
            <div className="prose-body">
              <p>
                Our organization brings together people from diverse backgrounds to work toward
                common goals, fostering unity and mutual understanding. Through community service
                projects, we build a stronger, more cohesive community while developing leadership,
                teamwork, and communication.
              </p>
              <p>
                Each action contributes to personal growth and creates a positive impact on both
                individuals and the community. Together we&rsquo;re building a future where everyone
                feels connected and empowered — one project at a time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src={assetUrl("Food.jpg")}
              alt="Food drive"
              className="aspect-square w-full rounded-lg object-cover shadow-card"
            />
            <img
              src={assetUrl("Prepping.jpg")}
              alt="Preparing donations"
              className="aspect-square w-full rounded-lg object-cover shadow-card"
            />
            <img
              src={assetUrl("Cooking.jpg")}
              alt="Cooking for the community"
              className="col-span-2 aspect-[2/1] w-full rounded-lg object-cover shadow-card"
            />
          </div>
        </div>
      </section>

      {/* Empower */}
      <section className="section">
        <div className="container-page">
          <h2 className="section-title">Together we can empower our community</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {empowerCards.map((card) => (
              <div key={card.title} className="card flex flex-col overflow-hidden">
                <img
                  src={assetUrl(card.image)}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                <div className="flex flex-col gap-2 p-6">
                  <h3 className="subsection-title">{card.title}</h3>
                  <p className="prose-body">{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spotlights */}
      <section className="section-muted section">
        <div className="container-page">
          <p className="eyebrow">In the field</p>
          <h2 className="section-title mt-3">Impact Spotlights</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {spotlights.map((card) => (
              <div key={card.title} className="card flex flex-col overflow-hidden">
                <img
                  src={assetUrl(card.image)}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                <div className="flex flex-col gap-2 p-6">
                  <h3 className="subsection-title">{card.title}</h3>
                  <p className="prose-body">{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default ServicePage;
