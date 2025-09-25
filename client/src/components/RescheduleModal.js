import { useState } from 'react';

import PropTypes from 'prop-types';

import { rescheduleBooking } from '../api/services';
import './RescheduleModal.css';

const RescheduleModal = ({ booking, isOpen, onClose, onSuccess }) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newDate || !newTime) {
      setError('Please select both date and time');
      return;
    }

    // Check if new date/time is different from current
    const currentDate = new Date(booking.date);
    const selectedDateTime = new Date(`${newDate}T${newTime}`);

    if (selectedDateTime <= currentDate) {
      setError('Please select a future date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const rescheduleData = {
        newDate: `${newDate}T${newTime}`,
        reason: 'Rescheduled by customer',
      };

      await rescheduleBooking(booking.id || booking._id, rescheduleData);
      onSuccess && onSuccess();
      onClose();

      // Reset form
      setNewDate('');
      setNewTime('');
    } catch (err) {
      console.error('Reschedule error:', err);
      setError(err.response?.data?.message || 'Failed to reschedule booking');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewDate('');
    setNewTime('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  return (
    <div className="modal-overlay">
      <div className="reschedule-modal">
        <div className="modal-header">
          <h3>Reschedule Booking</h3>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="booking-info">
            <h4>Current Booking Details:</h4>
            <p>
              <strong>Service:</strong> {booking.service?.title || booking.serviceName}
            </p>
            <p>
              <strong>Current Date:</strong> {new Date(booking.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Current Time:</strong> {new Date(booking.date).toLocaleTimeString()}
            </p>
            <p>
              <strong>Provider:</strong> {booking.provider?.name || booking.providerName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="reschedule-form">
            <div className="form-group">
              <label htmlFor="new-date">New Date:</label>
              <input
                type="date"
                id="new-date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={minDate}
                required
                className="date-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-time">New Time:</label>
              <input
                type="time"
                id="new-time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
                className="time-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={handleClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="reschedule-btn" disabled={loading}>
                {loading ? 'Rescheduling...' : 'Reschedule Booking'}
              </button>
            </div>
          </form>

          <div className="reschedule-note">
            <p>
              <strong>Note:</strong> Your reschedule request will be sent to the provider for
              confirmation. You will receive a notification once it's approved or declined.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;

RescheduleModal.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    service: PropTypes.shape({ title: PropTypes.string }),
    provider: PropTypes.shape({ name: PropTypes.string }),
    serviceName: PropTypes.string,
    providerName: PropTypes.string,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
