import { useCallback, useEffect, useState } from 'react';

import { providerAPI } from '../api/services';
import './ProviderSchedulePage.css';

const ProviderSchedulePage = () => {
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState([]);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  // Removed unused selectedDate state

  // Bulk update state
  const [bulkSettings, setBulkSettings] = useState({
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    workingHours: { start: '09:00', end: '17:00' },
    slotDuration: 60,
    breakBetween: 15,
    maxBookingsPerSlot: 1,
  });

  // Availability update state
  const [availabilitySettings, setAvailabilitySettings] = useState({
    scheduleType: 'bulk',
    pattern: 'weekly',
    weeklySchedule: {
      0: { enabled: false, slots: [] }, // Sunday
      1: { enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] }, // Monday
      2: { enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] }, // Tuesday
      3: { enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] }, // Wednesday
      4: { enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] }, // Thursday
      5: { enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] }, // Friday
      6: { enabled: false, slots: [] }, // Saturday
    },
  });

  const getViewStartDate = useCallback(() => {
    const start = new Date(currentDate);
    if (currentView === 'week') {
      start.setDate(start.getDate() - start.getDay());
    } else if (currentView === 'month') {
      start.setDate(1);
    }
    return start;
  }, [currentDate, currentView]);

  const getViewEndDate = useCallback(() => {
    const end = new Date(currentDate);
    if (currentView === 'week') {
      end.setDate(end.getDate() + (6 - end.getDay()));
    } else if (currentView === 'month') {
      end.setMonth(end.getMonth() + 1, 0);
    }
    return end;
  }, [currentDate, currentView]);

  const fetchScheduleData = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();

      const response = await providerAPI.getSchedule({
        date: currentDate.toISOString().split('T')[0],
        view: currentView,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      setScheduleData(response.bookings || []);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to load schedule data');
    }
  }, [getViewEndDate, getViewStartDate, currentDate, currentView]);

  const fetchAvailabilityData = useCallback(async () => {
    try {
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();

      const response = await providerAPI.getAvailability({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        view: currentView,
      });

      setAvailabilityData(response.availability || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability data');
      setLoading(false);
    }
  }, [getViewEndDate, getViewStartDate, currentView]);

  useEffect(() => {
    fetchScheduleData();
    fetchAvailabilityData();
  }, [fetchAvailabilityData, fetchScheduleData]);

  // getViewStartDate and getViewEndDate are memoized above for stable references

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const handleBulkAvailabilityUpdate = async () => {
    try {
      const timeSlots = generateTimeSlots(
        bulkSettings.workingHours,
        bulkSettings.slotDuration,
        bulkSettings.breakBetween
      );

      const availabilityData = {
        startDate: bulkSettings.startDate,
        endDate: bulkSettings.endDate,
        timeSlots: timeSlots.map((slot) => ({
          ...slot,
          maxBookings: bulkSettings.maxBookingsPerSlot,
        })),
        daysOfWeek: bulkSettings.daysOfWeek,
        excludeDates: [],
      };

      await providerAPI.updateAvailability({
        scheduleType: 'bulk',
        availabilityData,
      });

      setShowBulkModal(false);
      fetchAvailabilityData();
      alert('Bulk availability updated successfully!');
    } catch (err) {
      console.error('Error updating bulk availability:', err);
      alert('Failed to update availability');
    }
  };

  const handleRecurringScheduleUpdate = async () => {
    try {
      await providerAPI.updateAvailability({
        scheduleType: 'recurring',
        availabilityData: {
          pattern: availabilitySettings.pattern,
          weeklySchedule: availabilitySettings.weeklySchedule,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days
        },
      });

      setShowAvailabilityModal(false);
      fetchAvailabilityData();
      alert('Recurring schedule updated successfully!');
    } catch (err) {
      console.error('Error updating recurring schedule:', err);
      alert('Failed to update recurring schedule');
    }
  };

  const generateTimeSlots = (workingHours, slotDuration, breakBetween) => {
    const slots = [];
    let currentTime = new Date(`2000-01-01 ${workingHours.start}:00`);
    const endTime = new Date(`2000-01-01 ${workingHours.end}:00`);

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

      if (slotEnd <= endTime) {
        slots.push({
          startTime: currentTime.toTimeString().slice(0, 5),
          endTime: slotEnd.toTimeString().slice(0, 5),
          duration: slotDuration,
        });
      }

      currentTime = new Date(slotEnd.getTime() + breakBetween * 60000);
    }

    return slots;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBookingsForDate = (date) => {
    return scheduleData.filter((booking) => booking.date === date);
  };

  const getAvailabilityForDate = (date) => {
    return availabilityData.find((avail) => avail.date === date);
  };

  const renderCalendarView = () => {
    if (currentView === 'month') {
      return renderMonthView();
    } else if (currentView === 'week') {
      return renderWeekView();
    } else {
      return renderDayView();
    }
  };

  const renderMonthView = () => {
    const startDate = getViewStartDate();
    const daysInView = [];
    const firstDayOfWeek = startDate.getDay();

    // Add days from previous month to fill the week
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(startDate);
      prevDate.setDate(prevDate.getDate() - (i + 1));
      daysInView.push(prevDate);
    }

    // Add days of current month
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      daysInView.push(date);
    }

    // Add days from next month to complete the grid
    while (daysInView.length < 42) {
      const nextDate = new Date(daysInView[daysInView.length - 1]);
      nextDate.setDate(nextDate.getDate() + 1);
      daysInView.push(nextDate);
    }

    return (
      <div className="calendar-grid">
        <div className="calendar-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="calendar-header-cell">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-body">
          {daysInView.map((date, index) => {
            const dateString = date.toISOString().split('T')[0];
            const bookings = getBookingsForDate(dateString);
            const availability = getAvailabilityForDate(dateString);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = dateString === new Date().toISOString().split('T')[0];

            return (
              <button
                type="button"
                key={index}
                className={`calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                aria-label={`Select ${date.toDateString()}`}
              >
                <div className="cell-date">{date.getDate()}</div>
                <div className="cell-content">
                  {availability && (
                    <div className="availability-indicator">
                      <span className="available-slots">{availability.availableSlots} slots</span>
                    </div>
                  )}
                  {bookings.map((booking, idx) => (
                    <div key={idx} className={`booking-item ${booking.status}`}>
                      <span className="booking-time">{booking.time}</span>
                      <span className="booking-service">{booking.service}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = getViewStartDate();
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="week-view">
        <div className="week-header">
          {weekDays.map((day, index) => {
            const dateString = day.toISOString().split('T')[0];
            const bookings = getBookingsForDate(dateString);
            const availability = getAvailabilityForDate(dateString);
            const isToday = dateString === new Date().toISOString().split('T')[0];

            return (
              <div key={index} className={`week-day ${isToday ? 'today' : ''}`}>
                <div className="day-header">
                  <div className="day-name">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="day-date">{day.getDate()}</div>
                </div>
                <div className="day-content">
                  {availability && (
                    <div className="day-availability">
                      <span>{availability.availableSlots} available</span>
                    </div>
                  )}
                  <div className="day-bookings">
                    {bookings.map((booking, idx) => (
                      <div key={idx} className={`week-booking ${booking.status}`}>
                        <div className="booking-time">{booking.time}</div>
                        <div className="booking-details">
                          <div className="booking-service">{booking.service}</div>
                          <div className="booking-customer">{booking.customerName}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dateString = currentDate.toISOString().split('T')[0];
    const bookings = getBookingsForDate(dateString);
    const availability = getAvailabilityForDate(dateString);

    return (
      <div className="day-view">
        <div className="day-view-header">
          <h3>{formatDate(currentDate)}</h3>
          {availability && (
            <div className="day-availability-summary">
              <span>{availability.bookingCount} bookings</span>
              <span>{availability.availableSlots} available slots</span>
            </div>
          )}
        </div>
        <div className="day-view-content">
          <div className="time-slots">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="time-slot">
                <div className="time-label">{String(hour).padStart(2, '0')}:00</div>
                <div className="slot-content">
                  {bookings
                    .filter((booking) => {
                      const bookingHour = new Date(`2000-01-01 ${booking.time}`).getHours();
                      return bookingHour === hour;
                    })
                    .map((booking, idx) => (
                      <div key={idx} className={`day-booking ${booking.status}`}>
                        <div className="booking-time">{booking.time}</div>
                        <div className="booking-service">{booking.service}</div>
                        <div className="booking-customer">{booking.customerName}</div>
                        <div className="booking-status">{booking.status}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="schedule-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-page">
      {/* Header */}
      <div className="schedule-header">
        <div className="schedule-title">
          <h1>Schedule & Calendar</h1>
          <p>Manage your availability and view bookings</p>
        </div>
        <div className="schedule-actions">
          <button className="btn-primary" onClick={() => setShowBulkModal(true)}>
            Bulk Update
          </button>
          <button className="btn-secondary" onClick={() => setShowAvailabilityModal(true)}>
            Set Recurring Schedule
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="schedule-nav">
        <div className="view-controls">
          <button
            className={currentView === 'day' ? 'active' : ''}
            onClick={() => setCurrentView('day')}
          >
            Day
          </button>
          <button
            className={currentView === 'week' ? 'active' : ''}
            onClick={() => setCurrentView('week')}
          >
            Week
          </button>
          <button
            className={currentView === 'month' ? 'active' : ''}
            onClick={() => setCurrentView('month')}
          >
            Month
          </button>
        </div>

        <div className="date-navigation">
          <button onClick={() => navigateDate(-1)}>←</button>
          <span className="current-period">
            {currentView === 'month'
              ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : currentView === 'week'
                ? `Week of ${getViewStartDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : formatDate(currentDate)}
          </span>
          <button onClick={() => navigateDate(1)}>→</button>
          <button onClick={() => setCurrentDate(new Date())}>Today</button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="schedule-content">
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        {renderCalendarView()}
      </div>

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal bulk-modal">
            <div className="modal-header">
              <h3>Bulk Availability Update</h3>
              <button onClick={() => setShowBulkModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <fieldset className="date-range" aria-labelledby="bulkDateRangeLegend">
                  <legend id="bulkDateRangeLegend">Date Range</legend>
                  <div className="date-range-inputs">
                    <input
                      type="date"
                      id="bulkStartDate"
                      value={bulkSettings.startDate}
                      onChange={(e) =>
                        setBulkSettings({ ...bulkSettings, startDate: e.target.value })
                      }
                    />
                    <span>to</span>
                    <input
                      type="date"
                      id="bulkEndDate"
                      value={bulkSettings.endDate}
                      onChange={(e) =>
                        setBulkSettings({ ...bulkSettings, endDate: e.target.value })
                      }
                    />
                  </div>
                </fieldset>
              </div>

              <div className="form-group">
                <fieldset aria-labelledby="daysOfWeekLegend">
                  <legend id="daysOfWeekLegend">Days of Week</legend>
                  <div className="days-selector">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <label key={day} className="day-checkbox">
                        <input
                          type="checkbox"
                          checked={bulkSettings.daysOfWeek.includes(index)}
                          onChange={(e) => {
                            const newDays = e.target.checked
                              ? [...bulkSettings.daysOfWeek, index]
                              : bulkSettings.daysOfWeek.filter((d) => d !== index);
                            setBulkSettings({ ...bulkSettings, daysOfWeek: newDays });
                          }}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="form-group">
                <fieldset className="time-range" aria-labelledby="workingHoursLegend">
                  <legend id="workingHoursLegend">Working Hours</legend>
                  <div className="time-range-inputs">
                    <label htmlFor="workingStart" className="visually-hidden">
                      Start time
                    </label>
                    <input
                      type="time"
                      id="workingStart"
                      value={bulkSettings.workingHours.start}
                      onChange={(e) =>
                        setBulkSettings({
                          ...bulkSettings,
                          workingHours: { ...bulkSettings.workingHours, start: e.target.value },
                        })
                      }
                    />
                    <span>to</span>
                    <label htmlFor="workingEnd" className="visually-hidden">
                      End time
                    </label>
                    <input
                      type="time"
                      id="workingEnd"
                      value={bulkSettings.workingHours.end}
                      onChange={(e) =>
                        setBulkSettings({
                          ...bulkSettings,
                          workingHours: { ...bulkSettings.workingHours, end: e.target.value },
                        })
                      }
                    />
                  </div>
                </fieldset>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="slotDuration">Slot Duration (minutes)</label>
                  <input
                    type="number"
                    id="slotDuration"
                    value={bulkSettings.slotDuration}
                    onChange={(e) =>
                      setBulkSettings({ ...bulkSettings, slotDuration: parseInt(e.target.value) })
                    }
                    min="15"
                    max="240"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="breakBetween">Break Between Slots (minutes)</label>
                  <input
                    type="number"
                    id="breakBetween"
                    value={bulkSettings.breakBetween}
                    onChange={(e) =>
                      setBulkSettings({ ...bulkSettings, breakBetween: parseInt(e.target.value) })
                    }
                    min="0"
                    max="60"
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowBulkModal(false)}>Cancel</button>
              <button onClick={handleBulkAvailabilityUpdate} className="btn-primary">
                Update Availability
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Schedule Modal */}
      {showAvailabilityModal && (
        <div className="modal-overlay">
          <div className="modal recurring-modal">
            <div className="modal-header">
              <h3>Set Recurring Schedule</h3>
              <button onClick={() => setShowAvailabilityModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="weekly-schedule">
                {Object.entries(availabilitySettings.weeklySchedule).map(([dayIndex, dayData]) => {
                  const dayNames = [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                  ];

                  return (
                    <div key={dayIndex} className="day-schedule">
                      <div className="day-header">
                        <label className="day-toggle">
                          <input
                            type="checkbox"
                            checked={dayData.enabled}
                            onChange={(e) => {
                              setAvailabilitySettings({
                                ...availabilitySettings,
                                weeklySchedule: {
                                  ...availabilitySettings.weeklySchedule,
                                  [dayIndex]: { ...dayData, enabled: e.target.checked },
                                },
                              });
                            }}
                          />
                          {dayNames[dayIndex]}
                        </label>
                      </div>
                      {dayData.enabled && (
                        <div className="day-time-slots">
                          {dayData.slots.map((slot, slotIndex) => (
                            <div key={slotIndex} className="time-slot-input">
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => {
                                  const newSlots = [...dayData.slots];
                                  newSlots[slotIndex] = { ...slot, startTime: e.target.value };
                                  setAvailabilitySettings({
                                    ...availabilitySettings,
                                    weeklySchedule: {
                                      ...availabilitySettings.weeklySchedule,
                                      [dayIndex]: { ...dayData, slots: newSlots },
                                    },
                                  });
                                }}
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => {
                                  const newSlots = [...dayData.slots];
                                  newSlots[slotIndex] = { ...slot, endTime: e.target.value };
                                  setAvailabilitySettings({
                                    ...availabilitySettings,
                                    weeklySchedule: {
                                      ...availabilitySettings.weeklySchedule,
                                      [dayIndex]: { ...dayData, slots: newSlots },
                                    },
                                  });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAvailabilityModal(false)}>Cancel</button>
              <button onClick={handleRecurringScheduleUpdate} className="btn-primary">
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSchedulePage;
