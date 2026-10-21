import React from 'react';

const ICONS = {
  book: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h8" />
    </svg>
  ),
  calculator: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="7" y1="7" x2="17" y2="7" /><line x1="7" y1="11" x2="17" y2="11" /><line x1="7" y1="15" x2="17" y2="15" /><line x1="7" y1="19" x2="11" y2="19" />
    </svg>
  ),
  cap: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 22h4l-2-4 2-4M17 22H7l-2-8h14l-2 8" />
    </svg>
  ),
  brain: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 11a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1.51-1V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

const SUGGESTIONS = [
  {
    id: 'explain',
    title: 'Explain a Concept',
    description: 'Understand a difficult topic in simple words.',
    example: 'Explain machine learning with a real-life example.',
    icon: 'book',
  },
  {
    id: 'steps',
    title: 'Step-by-Step Help',
    description: 'Work through a problem one step at a time.',
    example: 'Explain how linear regression works step by step.',
    icon: 'calculator',
  },
  {
    id: 'exams',
    title: 'Exam Preparation',
    description: 'Revise important concepts and practise exam questions.',
    example: 'Help me revise classification algorithms for my exam.',
    icon: 'cap',
  },
  {
    id: 'practice',
    title: 'Practice Questions',
    description: 'Generate questions to check your understanding.',
    example: 'Ask me five questions about neural networks.',
    icon: 'brain',
  },
];

const SuggestedPromptCard = ({ suggestion, onSelect, disabled }) => {
  const icon = ICONS[suggestion.icon];
  const handleClick = () => {
    if (!disabled) onSelect(suggestion.example);
  };

  return (
    <button type="button" className="at-suggest-card" onClick={handleClick} disabled={disabled} aria-label={suggestion.title}>
      <div className="at-suggest-icon">
        {icon}
      </div>
      <div className="at-suggest-body">
        <h3 className="at-suggest-title">{suggestion.title}</h3>
        <p className="at-suggest-description">{suggestion.description}</p>
        <p className="at-suggest-example">“{suggestion.example}”</p>
      </div>
      <span className="at-suggest-arrow" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
    </button>
  );
};

const SuggestedGrid = ({ onSelectPrompt, disabled }) => (
  <div className="at-suggest-grid">
    {SUGGESTIONS.map((suggestion) => (
      <SuggestedPromptCard key={suggestion.id} suggestion={suggestion} onSelect={onSelectPrompt} disabled={disabled} />
    ))}
  </div>
);

export default SuggestedPromptCard;
export { SuggestedGrid };
