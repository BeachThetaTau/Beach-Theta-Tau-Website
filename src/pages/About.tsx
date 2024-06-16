import "./About.css";
import NavBar from "../components/NavBar";
import HamburgerMenu from "../components/HamburgerMenu";
import GenerateParallax from "../components/PillarsParallax";
import ResponsiveButton from "../components/ResponsiveButton";
import Footer from "../components/Footer";


function About() {
  return (
    <>
      <HamburgerMenu/>
      <NavBar />
      <GenerateParallax 
      fileName="About.png" 
      title="About" />

      <div className="our-moto">
        <img src="Hammer-and-tongs.png" alt="" className="our-moto-img" />
        <p className="our-moto-heading">OUR MOTO</p>
        <p className="our-moto-verse">
          "Whatsoever thy hand findeth to do, do it with thy might something"
        </p>
        <p className="our-motto-cite">- Ecclesiastes 9:10</p>
      </div>

      <div className="theta-tau-container">
        <div className="theta-tau-info">
          <p className="theta-tau-header">Theta Tau</p>
          <p className="theta-tau-txt">
            Theta Tau stands as the premier fraternity for engineers, boasting a
            rich legacy as the oldest and largest of its kind. Established in
            1904 at the University of Minnesota, it has welcomed over 40,000
            brothers into its esteemed ranks. Upholding a commitment to
            excellence and fostering a robust fraternal spirit, Theta Tau
            maintains chapters exclusively at ABET accredited schools,
            underscoring its dedication to quality education and engineering
            principles.
          </p>
          <ResponsiveButton />
        </div>
        <img src="TTFounders.png" alt="" className="founders-img" />
      </div>

      <div className="xi-epsilon-container">
        <div className="xi-epsilon-info">
          <p className="xi-epsilon-heading">Our Chapter: Xi Epsilon</p>
          <p className="xi-epsilon-txt">
            In the autumn of 2017, students within CSULB's College of
            Engineering recognized a notable absence of engineering presence
            within the campus's Greek community. In response, nine visionary
            individuals embarked on the journey to establish a chapter of the
            nation's most established and expansive professional engineering
            fraternity at CSULB. Their efforts culminated on October 13th, 2018,
            with the official installation of CSULB as the Xi Epsilon Chapter of
            Theta Tau.
          </p>
        </div>
        <img src="Founders.png" alt="founders picture" className="founders" />
      </div>

      <Footer />
    </>
  );
}

export default About;
