import React, { useState, useEffect } from 'react';
import { createPaymentOrder, verifyPayment, handlePaymentFailure } from '../api/payment';
import TestPaymentInfo from './TestPaymentInfo';
import './Payment.css';

const PaymentModal = ({ booking, onSuccess, onClose, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🧪 TEST MODE: Initiating Razorpay payment for booking:', booking._id);

      // Create payment order
      const orderData = await createPaymentOrder(booking._id);
      
      console.log('🧪 TEST MODE: Payment order created:', orderData);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_WZ4f4HELxyaDr3', // Test key
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'UrbanEase (Test Mode)',
        description: `Payment for ${orderData.booking.serviceName}`,
        order_id: orderData.order.id,
        prefill: {
          name: booking.customerName,
          email: booking.customerEmail,
          contact: booking.customerPhone || ''
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          escape: false,
          animation: true,
          ondismiss: function() {
            setLoading(false);
          }
        },
        retry: {
          enabled: true,
          max_count: 1
        },
        handler: async function(response) {
          try {
            // Verify payment on backend
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id
            };

            const result = await verifyPayment(verificationData);
            
            if (result.success) {
              onSuccess(result);
            } else {
              onError('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            onError(error.message || 'Payment verification failed');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', async function(response) {
        try {
          await handlePaymentFailure(booking._id, response.error);
          onError(`Payment failed: ${response.error.description}`);
        } catch (error) {
          onError('Payment failed');
        }
      });

      razorpay.open();
      
    } catch (error) {
      console.error('Payment initialization error:', error);
      setError(error.message || 'Failed to initialize payment');
      onError(error.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h3>Complete Payment</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="payment-modal-body">
          <div className="payment-summary">
            <div className="service-info">
              <h4>{booking.serviceName}</h4>
              <p>Provider: {booking.providerName}</p>
              <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
            </div>

            <div className="amount-info">
              <div className="amount-row">
                <span>Service Charge:</span>
                <span>₹{booking.totalAmount || booking.servicePrice}</span>
              </div>
              <div className="amount-row total">
                <span>Total Amount:</span>
                <span>₹{booking.totalAmount || booking.servicePrice}</span>
              </div>
            </div>
          </div>

          {/* Test Payment Information */}
          <TestPaymentInfo />

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="payment-actions">
            <button 
              className="cancel-button" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="pay-button" 
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Processing...
                </>
              ) : (
                `Pay ₹${booking.totalAmount || booking.servicePrice}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
