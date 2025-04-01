import "../styles/pricing.css";

const PricingPage = () => {
  return (
    <div className="pricing-page">
      <h1 className="pricing-title">Choose Your Plan</h1>
      <div className="pricing-grid">
        {/* FREE */}
        <div className="pricing-card">
          <h2 className="plan-title">FREE</h2>
          <ul className="plan-features">
            <li>✔ Start for free</li>
            <li>✔ Features: 3 posts, basic Support.</li>
            <li>✔ <strong>User Dashboard</strong></li>
          </ul>
          <button className="plan-button">Start for free</button>
        </div>

        {/* BASIC */}
        <div className="pricing-card">
          <h2 className="plan-title">Basic</h2>
          <ul className="plan-features">
            <li>✔ Scalable Engagement: Pay-as-you-go model for flexibility.</li>
            <li>✔ Fetch: $0.05/request (e.g. retrieving tweets)</li>
            <li>✔ Post: $0.01/request (e.g. creating tweets)</li>
            <li>✔ Use with Agendify X accounts</li>
          </ul>
          <button className="plan-button">Get Basic</button>
        </div>

        {/* PREMIUM */}
        <div className="pricing-card">
          <h2 className="plan-title">Premium</h2>
          <ul className="plan-features">
            <li>✔ Up to 15,000 tweet actions/month</li>
            <li>✔ Post up to 40,000 tweets/month</li>
            <li>✔ Using Company X account</li>
            <li><strong>✔ Seamless integration with Company X</strong></li>
            <li>✔ 300$ monthly</li>
          </ul>
          <button className="plan-button">Get Premium</button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;