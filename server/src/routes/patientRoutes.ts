import express, { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import * as patientController from '../controllers/patientController.js';

const router: Router = express.Router();

// All patient routes require authentication and patient role
router.use(authMiddleware);
router.use(requireRole(['patient']));

// Dashboard
router.get('/dashboard', patientController.getDashboard);

// Appointments
router.get('/appointments', patientController.getAppointments);
router.post('/appointments', patientController.bookAppointment);

// Saved Clinics
router.get('/saved-clinics', patientController.getSavedClinics);
router.post('/save-clinic', patientController.saveClinic);

// Profile
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);

export default router;
