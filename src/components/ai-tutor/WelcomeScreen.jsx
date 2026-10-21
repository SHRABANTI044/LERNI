import React from 'react';

const WelcomeScreen = () => (
  <section className="at-welcome">
    <div className="at-welcome-icon" aria-hidden="true">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#5b61f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        <circle cx="12" cy="9" r="2" />
      </svg>
    </div>
    <div>
      <h2 className="at-welcome-heading">What are you working on?</h2>
      <p className="at-welcome-support">Ask a question or choose a starting point below.</p>
    </div>
  </section>
);

export default WelcomeScreen;
