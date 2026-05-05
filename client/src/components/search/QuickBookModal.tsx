import React, { useState, useEffect } from 'react';
import { Clinic, Service } from '../../types';
import { quickBook, getDoctors } from '../../services/searchService';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

interface QuickBookModalProps {
  clinic: Clinic & { distance?: number };
  onClose: () => void;
  onBook: () => void;
}

const QuickBookModal: React.FC<QuickBookModalProps> = ({ clinic, onClose, onBook }) => {
  const { user, token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch clinic services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_BASE}/clinic/${clinic.id}/services`);
        setServices(response.data);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load clinic services');
      }
    };
    fetchServices();
  }, [clinic.id, API_BASE]);

  const handleBook = async () => {
    if (!selectedService || !appointmentDate || !appointmentTime || !token) {
      setError('Please fill in all fields');
      return;
    }

    if (!user) {
      setError('You must be logged in to book an appointment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await quickBook(clinic.id, selectedService.id, appointmentDate, appointmentTime, token);
      setSuccess(true);
      setTimeout(() => {
        onBook();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h2>Quick Book Appointment</h2>
        <p className="clinic-name">{clinic.name}</p>

        {success ? (
          <div className="success-message">
            <p>✓ Appointment booked successfully!</p>
            <p>Check your dashboard for details.</p>
          </div>
        ) : (
          <form className="book-form">
            {error && <div className="error-message">{error}</div>}

            {/* Service Selection */}
            <div className="form-group">
              <label>Select Service *</label>
              <select
                value={selectedService?.id || ''}
                onChange={(e) => {
                  const service = services.find((s) => s.id === parseInt(e.target.value));
                  setSelectedService(service || null);
                }}
                className="form-select"
              >
                <option value="">Choose a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                    {service.price && ` - Rs. ${service.price}`}
                    {service.duration_minutes && ` (${service.duration_minutes}min)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="form-group">
              <label>Appointment Date *</label>
              <input
                type="date"
                min={today}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Time Selection */}
            <div className="form-group">
              <label>Appointment Time *</label>
              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="form-input"
              />
            </div>

            {/* User Info Display */}
            {user && (
              <div className="user-info">
                <p>Booking as: <strong>{user.first_name} {user.last_name}</strong></p>
                <p>Email: <strong>{user.email}</strong></p>
              </div>
            )}

            <button
              type="button"
              className="book-submit-btn"
              onClick={handleBook}
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuickBookModal;
