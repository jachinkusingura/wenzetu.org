import express, { Router, Request, Response } from 'express';
import * as authController from '../controllers/authController.js';

const router: Router = express.Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const response = await authController.register(req.body);
    res.status(201).json(response);
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(error.status || 400).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const response = await authController.login(req.body);
    res.json(response);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(error.status || 401).json({ error: error.message });
  }
});

export default router;
