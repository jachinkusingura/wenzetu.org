import apiClient from './apiClient';

export interface DashboardResponse {
  user: any;
  stats: {
    upcomingAppointments: number;
    savedClinics: number;
    reviewsWritten: number;
  };
  appointments: any[];
  savedClinics: any[];
}

export interface AppointmentBooking {
  clinic_id: number;
  service_id?: number;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

export const patientService = {
  async getDashboard(): Promise<DashboardResponse> {
    const response = await apiClient.get<DashboardResponse>('/api/patient/dashboard');
    return response.data;
  },

  async getAppointments() {
    const response = await apiClient.get('/api/patient/appointments');
    return response.data;
  },

  async bookAppointment(data: AppointmentBooking) {
    const response = await apiClient.post('/api/patient/appointments', data);
    return response.data;
  },

  async getSavedClinics() {
    const response = await apiClient.get('/api/patient/saved-clinics');
    return response.data;
  },

  async saveClinic(clinicId: number) {
    const response = await apiClient.post('/api/patient/save-clinic', { clinic_id: clinicId });
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get('/api/patient/profile');
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await apiClient.put('/api/patient/profile', data);
    return response.data;
  }
};
