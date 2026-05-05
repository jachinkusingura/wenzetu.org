import axios from 'axios';
import { SearchFilters, Clinic, Doctor, Specialization, Service } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const searchClinics = async (filters: SearchFilters) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.latitude) params.append('latitude', filters.latitude.toString());
    if (filters.longitude) params.append('longitude', filters.longitude.toString());
    if (filters.radius) params.append('radius', filters.radius.toString());
    if (filters.specialization_id) params.append('specialization_id', filters.specialization_id.toString());
    if (filters.medicine_id) params.append('medicine_id', filters.medicine_id.toString());
    if (filters.service_name) params.append('service_name', filters.service_name);
    if (filters.rating_min) params.append('rating_min', filters.rating_min.toString());
    
    params.append('limit', '50');
    params.append('offset', '0');

    const response = await axios.get(`${API_BASE}/search/clinics?${params.toString()}`);
    return response.data as (Clinic & { distance?: number })[];
  } catch (error) {
    console.error('Error searching clinics:', error);
    throw error;
  }
};

export const getDoctors = async (clinicId?: number, specializationId?: number) => {
  try {
    const params = new URLSearchParams();
    
    if (clinicId) params.append('clinic_id', clinicId.toString());
    if (specializationId) params.append('specialization_id', specializationId.toString());
    
    params.append('limit', '50');
    params.append('offset', '0');

    const response = await axios.get(`${API_BASE}/search/doctors?${params.toString()}`);
    return response.data as Doctor[];
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

export const getSpecializations = async () => {
  try {
    const response = await axios.get(`${API_BASE}/search/specializations`);
    return response.data as Specialization[];
  } catch (error) {
    console.error('Error fetching specializations:', error);
    throw error;
  }
};

export const quickBook = async (clinicId: number, serviceId: number, appointmentDate: string, appointmentTime: string, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}/search/quick-book`,
      {
        clinic_id: clinicId,
        service_id: serviceId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
};

export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
