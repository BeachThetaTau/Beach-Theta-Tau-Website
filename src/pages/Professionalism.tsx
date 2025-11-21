import DisplayCarousel from "../components/ThreeImgCarousel";
import GenerateParallax from "../components/PillarsParallax";
import FadeInList from "../components/FadeInList";
import Logos from "../components/LogoCarousel";
import "./Professionalism.css";

function Professionalism() {
  return (
    <>
      <GenerateParallax
        fileName="Professionalism.jpg"
        title="Professionalism"
      />

      <div className="proff">
        <h2 className="proff-heading">
          Empowering Members: Navigating the Path to Career Success
        </h2>

        <p className="proff-txt">
          We're proud to prepare our members for the job market, offering
          workshops, seminars, and mentorship to develop essential skills like
          communication, teamwork, problem-solving, and leadership. Topics
          include resume building, interview prep, networking strategies, and
          professional etiquette.
        </p>
        <p className="proff-txt">
          Our extensive alumni network provides hands-on experiences via
          internships, tours, job shadowing, and industry partnerships. This
          practical exposure helps members apply skills, gain insights, and
          build professional networks. We're dedicated to empowering members
          with tools and experiences vital for success in today's job market.
        </p>
        <div className="center-div">
          <div className="proff-card">
            <DisplayCarousel
              slides={["CarineGordilloIntern.jpg", "MiaCastroIntern.jpg"]}
            />

            <div>
              <p className="proff-card-txt">
                In the competitive world of engineering internships, Xi Epsilon
                Chapter's professional development committee supports members in
                landing opportunities. We provide resume reviews, mock
                interviews, and encourage LinkedIn presence. Currently, twelve
                active brothers are in co-ops, with others securing summer
                internships.
              </p>
              <p className="proff-card-txt">
                Former regent Adam Bhuiyan credits the committee for internship
                success, citing industry events, resume workshops, and interview
                practice. Carine Gordillo attributes her Microsoft internship to
                Theta Tau's mentorship and skill development. Mia Castro landed
                a Gray Construction internship with support from fellow
                brothers.
              </p>
            </div>
          </div>
        </div>
        <div className="proff-line" />
        <h2 className="proff-subheading">WHERE TT CAN TAKE YOU</h2>
        <FadeInList />
        <Logos />
      </div>

      <div className="offerings">
        <h2 className="offering-headding">
          A strong introduction can transform your career trajectory
        </h2>
        <p className="offering-subtxt">
          Generic job applications often fall flat with top-tier employers. We
          connect you with the opportunities that can shape your professional
          journey by harnessing the strength of personal connections and
          networking advantages.
        </p>

        <div className="offerings-card-container">
          <div className="offerings-card">
            <h3 className="offering-card-heading">Resume Workshop</h3>
            <p className="offering-card-txt">
              We host resume workshops to equip our members with essential
              career-building skills. These workshops are designed to help
              brothers craft impressive resumes that highlight their strengths,
              experiences, and ambitions. We provide guidance on formatting,
              content, and tailoring resumes for specific industries or roles.
            </p>
          </div>

          <div className="offerings-card">
            <h3 className="offering-card-heading">On-Site Tours</h3>
            <p className="offering-card-txt">
              Our alumni network offers frequent on-site tours at various
              workplaces, providing valuable industry insights and networking
              opportunities. These tours deepen our understanding of career
              paths, connect us with professionals, and broaden our perspectives
              on the professional world.
            </p>
          </div>

          <div className="offerings-card">
            <h3 className="offering-card-heading">Mock Interview</h3>
            <p className="offering-card-txt">
              Our brothers' diverse experiences and commitment to growth drive
              us to conduct mock interviews. These simulations mimic real
              interviews, helping us practice answering questions, highlight
              strengths, and enhance communication skills. Valuable feedback
              from experienced members and alumni refines our techniques and
              boosts confidence.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Professionalism;
