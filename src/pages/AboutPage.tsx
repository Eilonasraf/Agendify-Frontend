import "../styles/about.css";
import teamImage from "../assets/meeting.jpg";
import agendaImage from "../assets/agenda.jpg";

const AboutPage = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About Us</h1>
      <p className="about-description">
        Welcome to Agendify, a platform powered by AI and automation to help you create and amplify agendas effortlessly on Twitter.
      </p>
      <p className="about-description">
        We empower individuals and organizations with smart tools, unique strategies, and exclusive website deals to make every message impactful.
      </p>

      <div className="about-images">
        <img src={teamImage} alt="Team Discussion" />
        <img src={agendaImage} alt="Agenda Blocks" />
      </div>
    </div>
  );
};

export default AboutPage;