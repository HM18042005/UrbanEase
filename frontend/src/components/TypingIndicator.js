import PropTypes from 'prop-types';
import './TypingIndicator.css';

const TypingIndicator = ({ users = [] }) => {
  if (users.length === 0) return null;

  const allStrings = users.every((u) => typeof u === 'string' && u.trim().length > 0);
  const displayText = allStrings
    ? users.length === 1
      ? `${users[0]} is typing...`
      : `${users.slice(0, -1).join(', ')} and ${users[users.length - 1]} are typing...`
    : users.length === 1
      ? 'Someone is typing...'
      : 'People are typing...';

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

TypingIndicator.propTypes = {
  users: PropTypes.arrayOf(PropTypes.string),
};
