import React, { useState } from 'react';
import './TestPaymentInfo.css';

const TestPaymentInfo = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const testCards = [
    {
      type: 'Success Card',
      number: '4111 1111 1111 1111',
      cvv: 'Any 3 digits',
      expiry: 'Any future date',
      result: '✅ Payment Success'
    },
    {
      type: 'Failure Card',
      number: '4000 0000 0000 0002',
      cvv: 'Any 3 digits', 
      expiry: 'Any future date',
      result: '❌ Payment Failure'
    },
    {
      type: 'Insufficient Balance',
      number: '4000 0000 0000 9995',
      cvv: 'Any 3 digits',
      expiry: 'Any future date', 
      result: '⚠️ Insufficient Balance'
    }
  ];

  return (
    <div className="test-payment-info">
      <button 
        className="test-info-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        🧪 Test Payment Cards {isExpanded ? '▼' : '▶'}
      </button>
      
      {isExpanded && (
        <div className="test-cards-container">
          <div className="test-mode-badge">
            <span className="badge-icon">🧪</span>
            <span>TEST MODE - Use these cards for testing</span>
          </div>
          
          <div className="test-cards-grid">
            {testCards.map((card, index) => (
              <div key={index} className="test-card">
                <div className="test-card-header">
                  <h4>{card.type}</h4>
                  <span className="test-result">{card.result}</span>
                </div>
                <div className="test-card-details">
                  <div className="detail-row">
                    <span className="label">Card Number:</span>
                    <span className="value">{card.number}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">CVV:</span>
                    <span className="value">{card.cvv}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Expiry:</span>
                    <span className="value">{card.expiry}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="test-info-note">
            <p><strong>Note:</strong> These are Razorpay test cards. No real money will be charged.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPaymentInfo;
