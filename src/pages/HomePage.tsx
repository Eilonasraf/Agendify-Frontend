import teamImage from "../assets/team.jpeg";
import "../styles/home.css";

const HomePage = () => {
  return (
    <div className="homepage">
      <div className="homepage-content">
        <div className="text-content">
          <h2><span className="highlight">Your</span> mission, <span className="highlight">Our</span> solution</h2>
          <p>
            Agendify is a Twitter-based project that helps promote specific agendas using the X.<br />
            Enabling users or organizations to advocate for their causes effectively.
          </p>
        </div>
        <div className="image-content">
          <img src={teamImage} alt="Team working" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;