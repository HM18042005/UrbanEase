import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create payment order
export const createPaymentOrder = async (bookingId) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/create-order`,
      { bookingId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create payment order' };
  }
};

// Verify payment
export const verifyPayment = async (paymentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/verify`,
      paymentData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Payment verification failed' };
  }
};

// Handle payment failure
export const handlePaymentFailure = async (bookingId, error) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/failure`,
      { bookingId, error },
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to handle payment failure' };
  }
};

// Get payment details
export const getPaymentDetails = async (bookingId) => {
  try {
    const response = await axios.get(
      `${API_URL}/payments/${bookingId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get payment details' };
  }
};
