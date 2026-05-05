export type UserRole = 'patient' | 'clinic_owner' | 'clinic_admin' | 'hb_admin' | 'sys_admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_image_url?: string;
  clinic_id?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Clinic {
  id: number;
  name: string;
  description?: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  rating: number;
  image_url?: string;
  latitude?: number;
  longitude?: number;
}

export interface Appointment {
  id: number;
  clinic_id: number;
  appointment_date: Date;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export type SpecializationType = 'cardiology' | 'neurology' | 'orthopedics' | 'pediatrics' | 'dermatology' | 'psychiatry' | 'urology' | 'oncology' | 'general_practice' | 'surgery';

export interface Specialization {
  id: number;
  name: string;
  description?: string;
  type?: SpecializationType;
}

export interface Doctor {
  id: number;
  license_number: string;
  years_experience?: number;
  bio?: string;
  is_available: boolean;
  average_rating: number;
  total_reviews: number;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  specializations?: Specialization[];
}

export interface Service {
  id: number;
  clinic_id: number;
  name: string;
  description?: string;
  duration_minutes?: number;
  price?: number;
}

export interface SearchResult {
  clinic: Clinic & { distance?: number };
  doctors: Doctor[];
  services: Service[];
}

export interface SearchFilters {
  latitude?: number;
  longitude?: number;
  radius?: number;
  specialization_id?: number;
  medicine_id?: number;
  service_name?: string;
  rating_min?: number;
}

export interface QuickBookRequest {
  clinic_id: number;
  service_id: number;
  appointment_date: string;
  appointment_time: string;
}
