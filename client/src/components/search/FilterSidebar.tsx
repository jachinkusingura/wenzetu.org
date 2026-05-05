import React, { useState } from 'react';
import { SearchFilters, Specialization } from '../../types';
import Icon from '../shared/Icon';

interface FilterSidebarProps {
  specializations: Specialization[];
  onFilterChange: (filters: SearchFilters) => void;
  userLocation: { latitude: number; longitude: number } | null;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  specializations,
  onFilterChange,
  userLocation,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
    radius: 10,
    rating_min: 0,
  });

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const radius = parseInt(e.target.value);
    setFilters({ ...filters, radius });
    onFilterChange({ ...filters, radius });
  };

  const handleSpecializationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const specializationId = e.target.value ? parseInt(e.target.value) : undefined;
    setFilters({ ...filters, specialization_id: specializationId });
    onFilterChange({ ...filters, specialization_id: specializationId });
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rating = parseFloat(e.target.value);
    setFilters({ ...filters, rating_min: rating });
    onFilterChange({ ...filters, rating_min: rating });
  };

  const handleServiceSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const serviceName = e.target.value;
    setFilters({ ...filters, service_name: serviceName });
    onFilterChange({ ...filters, service_name: serviceName });
  };

  return (
    <div className="filter-sidebar">
      <h2>Filters</h2>

      {/* Distance Radius */}
      <div className="filter-group">
        <label>Distance Radius (km)</label>
        <input
          type="range"
          min="1"
          max="50"
          value={filters.radius || 10}
          onChange={handleRadiusChange}
          className="range-input"
        />
        <span className="range-value">{filters.radius || 10} km</span>
      </div>

      {/* Service Search */}
      <div className="filter-group">
        <label>Search Service</label>
        <input
          type="text"
          placeholder="e.g., Cardiology, Dental"
          onChange={handleServiceSearch}
          className="text-input"
        />
      </div>

      {/* Specialization */}
      <div className="filter-group">
        <label>Specialization</label>
        <select onChange={handleSpecializationChange} className="select-input">
          <option value="">All Specializations</option>
          {specializations.map((spec) => (
            <option key={spec.id} value={spec.id}>
              {spec.name}
            </option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div className="filter-group">
        <label>Minimum Rating</label>
        <div className="rating-filter">
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.rating_min || 0}
            onChange={handleRatingChange}
            className="range-input"
          />
          <span className="rating-value flex items-center gap-1">
            <Icon name="star" size={14} className="text-yellow-400" /> {filters.rating_min || 0}
          </span>
        </div>
      </div>

      {/* Reset Button */}
      <button
        className="reset-btn"
        onClick={() => {
          const resetFilters = {
            latitude: userLocation?.latitude,
            longitude: userLocation?.longitude,
            radius: 10,
            rating_min: 0,
          };
          setFilters(resetFilters);
          onFilterChange(resetFilters);
        }}
      >
        Reset Filters
      </button>
    </div>
  );
};

export default FilterSidebar;
