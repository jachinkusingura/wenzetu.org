import { Router, Request, Response } from 'express';
import { searchClinics, getDoctors, getSpecializations, quickBook } from '../controllers/searchController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: import('express').Router = Router();

// Public routes - search doesn't require authentication for browsing
router.get('/clinics', searchClinics);
router.get('/doctors', getDoctors);
router.get('/specializations', getSpecializations);

// Get clinic services by clinic ID
router.get('/clinic/:clinicId/services', async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.params;
    const db = (req as any).db;

    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    const isPostgres = (db as any).query.toString().includes('Promise');

    const query = isPostgres
      ? 'SELECT * FROM services WHERE clinic_id = $1 ORDER BY name ASC'
      : 'SELECT * FROM services WHERE clinic_id = ? ORDER BY name ASC';

    if (isPostgres) {
      const { Pool } = require('pg');
      const result = await (db as any).query(query, [clinicId]);
      return res.json(result.rows);
    } else {
      const [rows] = await (db as any).query(query, [clinicId]);
      return res.json(rows);
    }
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Protected route - booking requires authentication
router.post('/quick-book', authMiddleware, quickBook);

export default router;
