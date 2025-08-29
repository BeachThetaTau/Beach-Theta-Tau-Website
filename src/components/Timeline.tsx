// TODO: Update the time, location, and venue details for upcoming events

import "./Timeline.css";

const RushTimeline = () => {
  return (
    <div id="timeline-container">
      <div className="inner-container">
        <ul className="timeline">
          <li className="event" data-date="2/3 - 7:00 PM">
            <p className="event-name">INFO NIGHT</p>
            <p className="event-date">9/8 - 7:00 PM</p>
            <p className="event-location">TBD</p>
            <p className="event-description">
              Discover the gateway to exploring the opportunities and benefits
              offered by Theta Tau. Join us to learn more about our community,
              programs, and how you can become a part of it!
            </p>
          </li>

          <li className="event" data-date="2/4 - 7:00 PM">
            <p className="event-name">ENGINEERING NIGHT</p>
            <p className="event-date">9/9 - 7:00 PM</p>
            <p className="event-location">TBD</p>
            <p className="event-description">
              Connect with fellow rushees and collaborate alongside our
              brothers, showcasing your engineering skills and expertise.
            </p>
          </li>

          <li className="event" data-date="2/5 - 7:00 PM">
            <p className="event-name">PROFFESSIONAL NIGHT</p>
            <p className="event-date">9/10 - 7:00 PM</p>
            <p className="event-location">TBD</p>
            <p className="event-description">
              Dress in your professional attire for a series of friendly speed
              interviews and uncover how Theta Tau has empowered our alumni in
              their professional journeys. Engage in interactive sessions where
              we will impart essential professional skills to enhance your
              career readiness.
            </p>
          </li>

          <li className="event" data-date="2/6 - 7:00 PM">
            <p className="event-name">GAME NIGHT</p>
            <p className="event-date">9/11 - 7:00 PM</p>
            <p className="event-location">Horn Center</p>
            <p className="event-description">
              Unwind with an exciting evening filled with board games, card
              games, and interactive activities. Meet our members in a relaxed,
              fun atmosphere and build friendships through friendly competition
              and teamwork.
            </p>
          </li>

          <li className="event" data-date="2/7 - 7:00 PM">
            <p className="event-name">SOCIAL NIGHT</p>
            <p className="event-date">9/12 - 7:00 PM</p>
            <p className="event-location">TBD</p>
            <p className="event-description">
              Indulge in an afternoon of socializing with the members of Theta
              Tau while sharing a meal together.
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RushTimeline;
