import React from 'react';
import { Clinic } from '../../types';
import Icon from '../shared/Icon';

interface ClinicCardProps {
  clinic: Clinic & { distance?: number };
  onQuickBook: (clinic: Clinic & { distance?: number }) => void;
}

const ClinicCard: React.FC<ClinicCardProps> = ({ clinic, onQuickBook }) => {
  return (
    <div className="clinic-card">
      {clinic.image_url && (
        <div className="clinic-image">
          <img src={clinic.image_url} alt={clinic.name} />
        </div>
      )}

      <div className="clinic-content">
        <div className="clinic-header">
          <h3>{clinic.name}</h3>
          {clinic.distance && (
            <span className="distance-badge">{clinic.distance.toFixed(1)} km away</span>
          )}
        </div>

        <p className="clinic-description">{clinic.description}</p>

        <div className="clinic-info">
          <div className="info-item">
            <span className="label flex items-center gap-1"><Icon name="map-pin" size={14} /> Address:</span>
            <span className="value">{clinic.address}</span>
          </div>
          <div className="info-item">
            <span className="label flex items-center gap-1"><Icon name="phone" size={14} /> Phone:</span>
            <a href={`tel:${clinic.phone}`} className="value phone-link">
              {clinic.phone}
            </a>
          </div>
          <div className="info-item">
            <span className="label">Rating:</span>
            <span className="value">
              <Icon name="star" size={14} className="text-yellow-400 inline-block align-text-bottom mr-1" /> {clinic.rating}/5
            </span>
          </div>
        </div>

        <button
          className="quick-book-btn-primary"
          onClick={() => onQuickBook(clinic)}
        >
          Quick Book Appointment
        </button>
      </div>
    </div>
  );
};

export default ClinicCard;
