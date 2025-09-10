import React from 'react';
import './TypingIndicator.css';

const TypingIndicator = ({ users = [] }) => {
  if (users.length === 0) return null;

  const displayText = users.length === 1 
    ? `${users[0]} is typing...`
    : `${users.slice(0, -1).join(', ')} and ${users[users.length - 1]} are typing...`;

  return (
    <div className="typing-indicator">
      <div className="typing-bubble">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div className="typing-text">{displayText}</div>
    </div>
  );
};

export default TypingIndicator;
