import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import Icon from '../../components/shared/Icon';

const PatientSavedClinicsView: React.FC = () => {
  const [savedClinics, setSavedClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedClinics = async () => {
      try {
        setLoading(true);
        const clinics = await patientService.getSavedClinics();
        setSavedClinics(clinics || []);
      } catch (err: any) {
        console.error('Failed to fetch saved clinics:', err);
        setError(err.message || 'Failed to load saved clinics');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedClinics();
  }, []);

  const filteredClinics = savedClinics
    .filter(clinic => 
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.city.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0);
      if (sortBy === 'reviews') return (b.review_count || 0) - (a.review_count || 0);
      return 0;
    });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading saved clinics...</p></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Saved Clinics</h1>
        <p className="text-neutral-600">Your favorite clinics for quick access and easy booking</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Filter/Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search clinics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="rating">Sort by: Rating</option>
          <option value="reviews">Most Reviewed</option>
          <option value="recent">Recently Added</option>
        </select>
      </div>

      {/* Clinics Grid */}
      {filteredClinics.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredClinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Clinic Header Image */}
              <div className="h-48 bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center relative">
                <div className="text-white">
                  <Icon name="hospital" size={64} />
                </div>
                <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform text-primary-600 shadow-md">
                  <Icon name="heart" size={20} />
                </button>
              </div>

              {/* Clinic Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-1">{clinic.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  {clinic.avg_rating && (
                    <>
                      <Icon name="star" size={16} className="text-yellow-400" />
                      <span className="font-semibold text-neutral-900">{clinic.avg_rating?.toFixed(1)}</span>
                      <span className="text-neutral-600 text-sm">({clinic.review_count || 0} reviews)</span>
                    </>
                  )}
                </div>

                {/* Address & Info */}
                <div className="space-y-2 mb-4 text-sm text-neutral-600">
                  <p className="flex items-center gap-2"><Icon name="map-pin" size={14} /> {clinic.address}</p>
                  <p className="flex items-center gap-2"><Icon name="navigation" size={14} /> {clinic.city}</p>
                  {clinic.opening_time && clinic.closing_time && (
                    <p className="flex items-center gap-2"><Icon name="clock" size={14} /> {clinic.opening_time} - {clinic.closing_time}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate(`/clinic/${clinic.id}`)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-purple text-white font-bold shadow-md shadow-purple-100 hover:shadow-lg transition-all active:scale-95"
                  >
                    Book Now
                  </button>
                  <button 
                    onClick={() => navigate(`/clinic/${clinic.id}`)}
                    className="flex-1 py-3 px-4 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-bold transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-neutral-50 rounded-xl border border-dashed border-neutral-300 p-12 text-center">
          <div className="text-primary-600 mb-4 flex justify-center">
            <Icon name="heart" size={64} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">No Saved Clinics Yet</h2>
          <p className="text-neutral-600 mb-6">
            Start exploring clinics and save your favorites for easy access
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="px-8 py-3 rounded-lg bg-gradient-purple text-white font-semibold hover:shadow-lg transition-all"
          >
            Discover Clinics
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientSavedClinicsView;
