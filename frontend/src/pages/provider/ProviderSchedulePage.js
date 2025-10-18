import { useCallback, useEffect, useState } from 'react';

import { api } from '../../api/provider';
import Header from '../../components/Header';
import './Dashboard.css';

const ProviderSchedulePage = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
        view: 'week',
      });
      setAppointments(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setAppointments([]);
    }
  }, [currentWeek, getWeekDates]);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  const weekDates = getWeekDates(currentWeek);

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt) => apt.date === dateStr);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  return (
    <div className="dashboard-page">
      <Header isLoggedIn={true} userType="provider" />
      <main className="dashboard-main">
        <div className="container-fluid px-3">
          <div className="row mb-4">
            <div className="col-12">
              <h1 className="h3 mb-0">Manage Schedule</h1>
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
                const dayAppointments = getAppointmentsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div key={day} className="col-12 col-md-6 col-lg-4 col-xl mb-3">
                    <div className={`card h-100 ${isToday ? 'border-primary' : ''}`}>
                      <div className="card-header text-center">
                        <h6 className="card-title mb-1">{day}</h6>
                        <small className="text-muted">{formatDate(date)}</small>
                      </div>

                      <div className="card-body p-3">
                        <div className="mb-3">
                          <span className="form-label small">
                            Appointments ({dayAppointments.length})
                          </span>
                          {dayAppointments.length === 0 ? (
                            <div className="text-center p-3 text-muted">
                              <small>No appointments</small>
                            </div>
                          ) : (
                            <div className="d-flex flex-column gap-2">
                              {dayAppointments.map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className={`card ${appointment.status === 'confirmed' ? 'border-success' : 'border-warning'}`}
                                >
                                  <div className="card-body p-2">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <div className="fw-bold small">{appointment.time}</div>
                                        <div className="text-muted small">
                                          {appointment.customerName}
                                        </div>
                                        <div className="text-muted small">
                                          {appointment.service}
                                        </div>
                                        <div className="text-muted small">
                                          {appointment.duration}
                                        </div>
                                      </div>
                                      <span
                                        className={`badge ${appointment.status === 'confirmed' ? 'bg-success' : 'bg-warning'}`}
                                      >
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
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Weekly Summary */}
            <div className="row mt-4">
              <div className="col-md-6 col-lg-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">This Week</h5>
                    <div className="row text-center">
                      <div className="col-12 mb-2">
                        <div className="h4 mb-0 text-primary">{appointments.length}</div>
                        <small className="text-muted">Appointments</small>
                      </div>
                      <div className="col-6">
                        <div className="h5 mb-0 text-warning">
                          {appointments.filter((a) => a.status === 'pending').length}
                        </div>
                        <small className="text-muted">Pending</small>
                      </div>
                      <div className="col-6">
                        <div className="h5 mb-0 text-success">
                          {appointments.filter((a) => a.status === 'confirmed').length}
                        </div>
                        <small className="text-muted">Confirmed</small>
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
