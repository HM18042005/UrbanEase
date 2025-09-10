import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../../components/Header';
import { api } from '../../api/provider';
import './Dashboard.css';

const ProviderSchedulePage = () => {
  const [schedule, setSchedule] = useState({});
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isGenerallyAvailable, setIsGenerallyAvailable] = useState(true);

  const daysOfWeek = useMemo(() => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], []);
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', 
    '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'
  ];

  const getWeekDates = useCallback((startDate) => {
    const week = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      week.push(date);
    }
    return week;
  }, []);

  const fetchScheduleData = useCallback(async () => {
    try {
      const weekStart = getWeekDates(currentWeek)[0];
      const response = await api.getSchedule({
        date: weekStart.toISOString().split('T')[0],
        view: 'week'
      });
      setAppointments(response.data.bookings || []);
      
      // Initialize default schedule if no custom schedule exists
      const defaultSchedule = {};
      daysOfWeek.forEach(day => {
        defaultSchedule[day] = {
          isAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day),
          startTime: '9:00 AM',
          endTime: '5:00 PM',
          breaks: []
        };
      });
      setSchedule(defaultSchedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setAppointments([]);
    }
  }, [currentWeek, daysOfWeek, getWeekDates]);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  const weekDates = getWeekDates(currentWeek);

  const updateDayAvailability = (day, isAvailable) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isAvailable
      }
    }));
  };

  const updateDayTimes = (day, startTime, endTime) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        startTime,
        endTime
      }
    }));
  };

  const removeBreak = (day, breakIndex) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: prev[day].breaks.filter((_, index) => index !== breakIndex)
      }
    }));
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  return (
    <div className="dashboard-page">
      <Header isLoggedIn={true} userType="provider" />
      <main className="dashboard-main">
        <div className="container-fluid px-3">
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <h1 className="h3 mb-0">Manage Schedule</h1>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isGenerallyAvailable}
                    onChange={(e) => setIsGenerallyAvailable(e.target.checked)}
                    id="availabilitySwitch"
                  />
                  <label className="form-check-label" htmlFor="availabilitySwitch">
                    {isGenerallyAvailable ? '🟢 Available for new bookings' : '🔴 Not accepting new bookings'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <button className="btn btn-outline-primary" onClick={() => navigateWeek(-1)}>
                      ← Previous Week
                    </button>
                    <h4 className="mb-0 text-center">
                      Week of {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                    </h4>
                    <button className="btn btn-outline-primary" onClick={() => navigateWeek(1)}>
                      Next Week →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Calendar */}
            <div className="row">
              {weekDates.map((date, index) => {
                const day = daysOfWeek[index];
                const daySchedule = schedule[day] || {};
                const dayAppointments = getAppointmentsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div key={day} className="col-12 col-md-6 col-lg-4 col-xl mb-3">
                    <div className={`card h-100 ${isToday ? 'border-primary' : ''} ${!daySchedule.isAvailable ? 'bg-light' : ''}`}>
                      <div className="card-header text-center">
                        <h6 className="card-title mb-1">{day}</h6>
                        <small className="text-muted">{formatDate(date)}</small>
                        <div className="form-check form-switch mt-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={daySchedule.isAvailable || false}
                            onChange={(e) => updateDayAvailability(day, e.target.checked)}
                            id={`availability-${day}`}
                          />
                          <label className="form-check-label small" htmlFor={`availability-${day}`}>
                            Available
                          </label>
                        </div>
                      </div>

                      {daySchedule.isAvailable && (
                        <div className="card-body p-3">
                          <div className="mb-3">
                            <label className="form-label small">Start:</label>
                            <select
                              className="form-select form-select-sm"
                              value={daySchedule.startTime || '9:00 AM'}
                              onChange={(e) => updateDayTimes(day, e.target.value, daySchedule.endTime)}
                            >
                              {timeSlots.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label small">End:</label>
                            <select
                              className="form-select form-select-sm"
                              value={daySchedule.endTime || '5:00 PM'}
                              onChange={(e) => updateDayTimes(day, daySchedule.startTime, e.target.value)}
                            >
                              {timeSlots.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>

                          {/* Breaks */}
                          {daySchedule.breaks && daySchedule.breaks.length > 0 && (
                            <div className="mb-3">
                              <label className="form-label small">Breaks:</label>
                              {daySchedule.breaks.map((brk, index) => (
                                <div key={index} className="d-flex justify-content-between align-items-center mb-1 p-2 bg-light rounded">
                                  <small>{brk.start} - {brk.end}</small>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeBreak(day, index)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Appointments */}
                          <div className="mb-3">
                            <label className="form-label small">Appointments ({dayAppointments.length})</label>
                            {dayAppointments.length === 0 ? (
                              <div className="text-center p-3 text-muted">
                                <small>No appointments</small>
                              </div>
                            ) : (
                              <div className="d-flex flex-column gap-2">
                                {dayAppointments.map(appointment => (
                                  <div 
                                    key={appointment.id}
                                    className={`card ${appointment.status === 'confirmed' ? 'border-success' : 'border-warning'}`}
                                  >
                                    <div className="card-body p-2">
                                      <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                          <div className="fw-bold small">{appointment.time}</div>
                                          <div className="text-muted small">{appointment.customerName}</div>
                                          <div className="text-muted small">{appointment.service}</div>
                                          <div className="text-muted small">{appointment.duration}</div>
                                        </div>
                                        <span className={`badge ${appointment.status === 'confirmed' ? 'bg-success' : 'bg-warning'}`}>
                                          {appointment.status}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!daySchedule.isAvailable && (
                        <div className="card-body text-center text-muted">
                          <small>Not available</small>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="row mt-4">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Quick Actions</h5>
                    <div className="d-flex flex-wrap gap-2">
                      <button className="btn btn-primary btn-sm">
                        📅 Block Time Off
                      </button>
                      <button className="btn btn-outline-primary btn-sm">
                        🔄 Copy Last Week
                      </button>
                      <button className="btn btn-outline-secondary btn-sm">
                        ⚙️ Set Default Hours
                      </button>
                      <button className="btn btn-outline-warning btn-sm">
                        🚫 Mark Unavailable
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">This Week</h5>
                    <div className="row text-center">
                      <div className="col-12 mb-2">
                        <div className="h4 mb-0 text-primary">{appointments.length}</div>
                        <small className="text-muted">Appointments</small>
                      </div>
                      <div className="col-6">
                        <div className="h5 mb-0 text-warning">{appointments.filter(a => a.status === 'pending').length}</div>
                        <small className="text-muted">Pending</small>
                      </div>
                      <div className="col-6">
                        <div className="h5 mb-0 text-success">
                          {Object.values(schedule).filter(s => s.isAvailable).length}
                        </div>
                        <small className="text-muted">Available Days</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderSchedulePage;
