import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoleGuard } from './hooks/useRoleGuard';

// Views
import HomeView from './views/shared/HomeView';
import LoginView from './views/auth/LoginView';
import RegisterView from './views/auth/RegisterView';
import SearchView from './views/shared/SearchView';
import PatientDashboardView from './views/patient/PatientDashboardView';
import PatientAppointmentsView from './views/patient/PatientAppointmentsView';
import PatientSavedClinicsView from './views/patient/PatientSavedClinicsView';
import PatientProfileView from './views/patient/PatientProfileView';

// Layouts
import PatientLayout from './views/layouts/PatientLayout';
import AuthLayout from './views/layouts/AuthLayout';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomeView />} />
          <Route path="/search" element={<SearchView />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<AuthLayout><LoginView /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><RegisterView /></AuthLayout>} />
          
          {/* Patient routes */}
          <Route
            path="/patient/*"
            element={
              <RoleGuard allowedRoles={['patient']}>
                <PatientLayout />
              </RoleGuard>
            }
          >
            <Route index element={<PatientDashboardView />} />
            <Route path="dashboard" element={<PatientDashboardView />} />
            <Route path="appointments" element={<PatientAppointmentsView />} />
            <Route path="saved-clinics" element={<PatientSavedClinicsView />} />
            <Route path="profile" element={<PatientProfileView />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
