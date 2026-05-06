import express, { Router, Request, Response } from 'express';
import * as clinicAdminController from '../controllers/clinicAdminController.js';

const router: Router = express.Router();

router.get('/my-clinic', async (req: Request, res: Response) => {
  try {
    // In a real app, we would get the userId from the JWT token (req.user.id)
    // For this prototype, we'll use a hardcoded ID or let the controller handle it
    const userId = 1; 
    const clinic = await clinicAdminController.getMyClinic(userId);
    res.json(clinic);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/my-clinic/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await clinicAdminController.updateClinic(parseInt(id), req.body);
    res.json({ message: 'Clinic updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/services', async (req: Request, res: Response) => {
  try {
    const { clinicId, serviceName } = req.body;
    await clinicAdminController.addService(clinicId, serviceName);
    res.json({ message: 'Service added successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/medicine-stock', async (req: Request, res: Response) => {
  try {
    const { clinicId, medicineName, status } = req.body;
    await clinicAdminController.updateStock(clinicId, medicineName, status);
    res.json({ message: 'Stock updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
