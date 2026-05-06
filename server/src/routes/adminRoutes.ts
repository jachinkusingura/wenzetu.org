import express, { Router, Request, Response } from 'express';
import * as adminController from '../controllers/adminController.js';

const router: Router = express.Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await adminController.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/clinics', async (req: Request, res: Response) => {
  try {
    const clinics = await adminController.getClinics();
    res.json(clinics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/clinics/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await adminController.verifyClinic(parseInt(id));
    res.json({ message: 'Clinic verified successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
