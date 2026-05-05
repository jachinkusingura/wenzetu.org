import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { searchClinics, getCurrentLocation, getSpecializations } from '../../services/searchService';
import { Clinic, SearchFilters, Specialization } from '../../types';
import FilterSidebar from '../../components/search/FilterSidebar';
import ClinicCard from '../../components/search/ClinicCard';
import QuickBookModal from '../../components/search/QuickBookModal';
import '../../styles/search.css';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SearchView: React.FC = () => {
  const [view, setView] = useState<'map' | 'list'>('map');
  const [clinics, setClinics] = useState<(Clinic & { distance?: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<(Clinic & { distance?: number }) | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);

  // Get user location on mount
  useEffect(() => {
    const initLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
        setFilters((prev) => ({
          ...prev,
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 10,
        }));
      } catch (error) {
        console.error('Error getting location:', error);
        // Default to a city center if geolocation fails
        setUserLocation({ latitude: 40.7128, longitude: -74.006 });
      }
    };
    initLocation();
  }, []);

  // Fetch specializations
  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const specs = await getSpecializations();
        setSpecializations(specs);
      } catch (error) {
        console.error('Error loading specializations:', error);
      }
    };
    loadSpecializations();
  }, []);

  // Search clinics when filters change
  useEffect(() => {
    const performSearch = async () => {
      if (!filters.latitude || !filters.longitude) return;

      setLoading(true);
      try {
        const results = await searchClinics(filters);
        setClinics(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [filters]);

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>Find & Book Healthcare Services</h1>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${view === 'map' ? 'active' : ''}`}
            onClick={() => setView('map')}
          >
            Map View
          </button>
          <button
            className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            List View
          </button>
        </div>
      </div>

      <div className="search-content">
        <FilterSidebar
          specializations={specializations}
          onFilterChange={handleFilterChange}
          userLocation={userLocation}
        />

        {view === 'map' ? (
          <div className="map-view">
            {userLocation && (
              // @ts-ignore - react-leaflet types missing for MapContainer
              <MapContainer
                center={[userLocation.latitude, userLocation.longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* User location marker */}
                <Marker position={[userLocation.latitude, userLocation.longitude]}>
                  <Popup>Your Location</Popup>
                </Marker>

                {/* Clinic markers */}
                {clinics.map((clinic) => (
                  <Marker
                    key={clinic.id}
                    position={[clinic.latitude || 0, clinic.longitude || 0]}
                    eventHandlers={{
                      click: () => {
                        setSelectedClinic(clinic);
                        setShowBookModal(true);
                      }
                    }}
                  >
                    <Popup>
                      <div className="clinic-popup">
                        <h4>{clinic.name}</h4>
                        <p>{clinic.address}</p>
                        <p>Rating: {clinic.rating}/5</p>
                        <button
                          className="quick-book-btn"
                          onClick={() => {
                            setSelectedClinic(clinic);
                            setShowBookModal(true);
                          }}
                        >
                          Quick Book
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        ) : (
          <div className="list-view">
            {loading ? (
              <div className="loading">Searching clinics...</div>
            ) : clinics.length > 0 ? (
              <div className="clinic-list">
                {clinics.map((clinic) => (
                  <ClinicCard
                    key={clinic.id}
                    clinic={clinic}
                    onQuickBook={(clinic) => {
                      setSelectedClinic(clinic);
                      setShowBookModal(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No clinics found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showBookModal && selectedClinic && (
        <QuickBookModal
          clinic={selectedClinic}
          onClose={() => {
            setShowBookModal(false);
            setSelectedClinic(null);
          }}
          onBook={() => {
            setShowBookModal(false);
            setSelectedClinic(null);
          }}
        />
      )}
    </div>
  );
};

export default SearchView;
