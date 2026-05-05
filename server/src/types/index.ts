export type UserRole = 'patient' | 'clinic_owner' | 'clinic_admin' | 'hb_admin' | 'sys_admin';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed';

export interface User {
  id: number;
  email: string;
  password?: string;
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

export interface Clinic {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  image_url?: string;
  is_verified: boolean;
  is_active: boolean;
  rating: number;
  total_reviews: number;
  opening_time?: string;
  closing_time?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: number;
  clinic_id: number;
  name: string;
  description?: string;
  duration_minutes?: number;
  price?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Appointment {
  id: number;
  patient_id: number;
  clinic_id: number;
  service_id?: number;
  appointment_date: Date;
  appointment_time: string;
  duration_minutes?: number;
  status: AppointmentStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Review {
  id: number;
  patient_id: number;
  clinic_id: number;
  rating: number;
  comment?: string;
  response?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Medicine {
  id: number;
  name: string;
  description?: string;
  dosage?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MedicineInventory {
  id: number;
  clinic_id: number;
  medicine_id: number;
  stock_quantity: number;
  expiry_date?: Date;
  price?: number;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export type SpecializationType = 'cardiology' | 'neurology' | 'orthopedics' | 'pediatrics' | 'dermatology' | 'psychiatry' | 'urology' | 'oncology' | 'general_practice' | 'surgery';

export interface Specialization {
  id: number;
  name: string;
  description?: string;
  type?: SpecializationType;
  created_at: Date;
}

export interface Doctor {
  id: number;
  user_id: number;
  clinic_id: number;
  license_number: string;
  years_experience?: number;
  bio?: string;
  is_available: boolean;
  average_rating: number;
  total_reviews: number;
  created_at: Date;
  updated_at: Date;
  user?: Omit<User, 'password'>;
  specializations?: Specialization[];
}

export interface SearchFilters {
  latitude?: number;
  longitude?: number;
  radius?: number;
  specialization_id?: number;
  doctor_id?: number;
  medicine_id?: number;
  service_name?: string;
  rating_min?: number;
  is_verified?: boolean;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  clinic: Clinic;
  doctors: Doctor[];
  services: Service[];
  distance?: number;
}

export interface QuickBookRequest {
  clinic_id: number;
  service_id: number;
  appointment_date: string;
  appointment_time: string;
  patient_id: number;
}
