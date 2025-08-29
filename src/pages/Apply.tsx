import RushTimeline from "../components/Timeline";
import OutlinedButton from "../components/OutlinedButton";

import "./Apply.css";

function Service() {
  return (
    <>
      <div className="recruitment-container-grey">
        <div className="recruitment-heading-container">
          <p className="recruitment-heading">Fall 2025 Recruitment</p>
          {/* TODO: Update this to reflect the semester and year you are recruiting for */}

          <img src="ThetaTau.png" alt="" className="recruitment-img" />
        </div>
        <div className="recruitment-info-container">
          <div className="recruitment-line">
            <p className="recruitment-info-txt">
              Theta Tau is recruiting individuals with at least two semesters
              remaining at CSULB to join the upcoming class. To be eligible,
              students must be enrolled in the CSULB College of Engineering with
              a GPA of 2.5 or above. Please note that exchange or study-abroad
              students are not eligible to apply.
            </p>
            <p className="recruitment-info-txt">
              We welcome applications from individuals at any stage of their
              academic or professional journey. Please keep an eye out for
              application resources, including those currently accessible on our
              <a href="https://www.instagram.com/beachthetatau/" target="blank">
                <span id="Instagram" className="recruitment-info-txt">
                  {" "}
                  Instagram
                </span>
              </a>{" "}
              stories and highlighted takeovers.
            </p>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeSXSPNIAb9oN6wKzl0ozwQtK1sp8ri82g_bn3SfcBPOBS3gA/viewform" // TODO: Update this url its should link to a ggogle form to apply to
              target="blank"
            >
              <OutlinedButton text="Application" fontSize="1.125rem" />
            </a>
          </div>
        </div>
      </div>

      <div className="rushing-container">
        <p className="rushing-heading">Rushing</p>
        <div className="rushing-info">
          <div className="recruitment-line"></div>
          <p className="rushing-txt">
            Rush offers you the chance to explore Theta Tau further. It includes
            various events designed to provide insight into our fraternity's
            values, assess compatibility between you and us, and determine
            mutual fit. At the conclusion of rush, we offer a select number of
            interviews and bids. If you receive a bid, you can then choose
            whether or not to pledge. Rushing is entirely free and carries no
            obligations.
          </p>
        </div>
        <p className="rush-timeline">Rush Timeline</p>
        <RushTimeline />

        <div className="attire-guidelines-container" id="attire-guidelines">
          <p className="attire-guidelines-heading">Attire Guidelines</p>
          <p className="attire-guidelines-subheading">Buisiness Casual</p>

          <p className="clothing">Tops:</p>
          <p className="clothing-requirement">
            Men: Collared shirts such as button-down shirts, polo shirts, or
            sweaters. Turtlenecks are also acceptable. <br /> Women: Blouses,
            collared shirts, sweaters, cardigans, or tailored tops. Sleeveless
            tops should have a modest neckline.
          </p>

          <p className="clothing">Bottoms:</p>
          <p className="clothing-requirement">
            Men: Dress slacks, khakis, chinos, or tailored trousers. Avoid cargo
            pants, jeans or overly casual styles. <br /> Women: Dress pants,
            khakis, chinos, tailored skirts, or dresses that fall at or below
            the knee. Avoid mini-skirts or overly tight-fitting styles.
          </p>

          <p className="clothing">Footwear:</p>
          <p className="clothing-requirement">
            Men and Women: Closed-toe shoes such as loafers, dress shoes, flats,
            or boots. Avoid sneakers, flip-flops, or overly casual footwear.
          </p>

          <p className="clothing">Accessories:</p>
          <p className="clothing-requirement">
            Keep accessories simple and professional. Belts should match the
            color of your shoes. Jewelry should be understated and not overly
            flashy.
          </p>

          <p className="clothing">Outerwear:</p>
          <p className="clothing-requirement">
            Blazers, sports coats, or professional cardigans can be worn over
            tops. Avoid wearing hoodies, denim jackets, or overly casual
            outerwear indoors.
          </p>
        </div>
      </div>

      <div className="recruitment-resources-container">
        <p className="recruitment-resources-heading">Recruitment Resources</p>

        <div className="recruitment-resource-info">
          <div className="recruitment-line"></div>
          <p className="recruitment-resources-txt">
            Thank you for showing interest in Theta Tau. If you have any
            questions about anything, please don't hesitate to reach out to our
            team. We're here to help and support you in any way we can. Our
            dedicated brothers are available to answer your queries and provide
            assistance whenever you need it. Your satisfaction and understanding
            are important to us, so feel free to get in touch with us at any
            time.
            <br />
            <p className="recruitment-contact">
              Theta Tau Xi-Epsilon Email:
              <a
                href="mailto:beachthetatau@gmail.com"
                className="recruitment-contact"
              >
                <strong> beachthetatau@gmail.com</strong>
              </a>
            </p>
          </p>
        </div>
      </div>
    </>
  );
}

export default Service;
