import api from './client';

// Create payment order
export const createPaymentOrder = async (bookingId) => {
  try {
    const response = await api.post('/payments/create-order', { bookingId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create payment order' };
  }
};

// Verify payment
export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Payment verification failed' };
  }
};

// Handle payment failure
export const handlePaymentFailure = async (bookingId, error) => {
  try {
    const response = await api.post('/payments/failure', { bookingId, error });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to handle payment failure' };
  }
};

// Get payment details
export const getPaymentDetails = async (bookingId) => {
  try {
    const response = await api.get(`/payments/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get payment details' };
  }
};
