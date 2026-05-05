import { Request, Response } from 'express';
import * as db from '../database/connection.js';

export async function getDashboard(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const isPostgres = process.env.DB_TYPE === 'postgres';

    // Get user details
    const user = await db.queryOne(
      'SELECT id, email, first_name, last_name, phone FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get upcoming appointments
    const dateFn = isPostgres ? 'CURRENT_DATE' : 'CURDATE()';
    const appointments = await db.query(
      `SELECT a.*, c.name as clinic_name, c.address, c.city, s.name as service_name
       FROM appointments a
       LEFT JOIN clinics c ON a.clinic_id = c.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.patient_id = ? AND a.appointment_date >= ${dateFn} AND a.status IN ('scheduled', 'confirmed')
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT 5`,
      [userId]
    );

    // Get saved clinics
    const savedClinics = await db.query(
      `SELECT c.id, c.name, c.city, c.address, c.rating, c.total_reviews
       FROM saved_clinics sc
       JOIN clinics c ON sc.clinic_id = c.id
       WHERE sc.patient_id = ?
       ORDER BY sc.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Get stats
    const appointmentCount = await db.queryOne(
      `SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND status IN ('scheduled', 'confirmed')`,
      [userId]
    );

    const savedCount = await db.queryOne(
      'SELECT COUNT(*) as count FROM saved_clinics WHERE patient_id = ?',
      [userId]
    );

    const reviewCount = await db.queryOne(
      'SELECT COUNT(*) as count FROM reviews WHERE patient_id = ?',
      [userId]
    );

    res.json({
      user,
      stats: {
        upcomingAppointments: appointmentCount?.count || 0,
        savedClinics: savedCount?.count || 0,
        reviewsWritten: reviewCount?.count || 0
      },
      appointments,
      savedClinics
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

export async function getAppointments(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const appointments = await db.query(
      `SELECT a.*, c.name as clinic_name, c.address, c.city, c.phone, s.name as service_name
       FROM appointments a
       LEFT JOIN clinics c ON a.clinic_id = c.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [userId]
    );

    res.json(appointments);
  } catch (error) {
    console.error('Appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
}

export async function bookAppointment(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { clinic_id, service_id, appointment_date, appointment_time, notes } = req.body;

    // Validation
    if (!clinic_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert appointment
    const result = await db.execute(
      `INSERT INTO appointments (patient_id, clinic_id, service_id, appointment_date, appointment_time, status, notes)
       VALUES (?, ?, ?, ?, ?, 'scheduled', ?)`,
      [userId, clinic_id, service_id || null, appointment_date, appointment_time, notes || null]
    );

    const appointmentId = (result as any).insertId;

    const appointment = await db.queryOne(
      `SELECT a.*, c.name as clinic_name, s.name as service_name
       FROM appointments a
       LEFT JOIN clinics c ON a.clinic_id = c.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`,
      [appointmentId]
    );

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
}

export async function getSavedClinics(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const isPostgres = process.env.DB_TYPE === 'postgres';

    let clinics;
    if (isPostgres) {
      clinics = await db.query(
        `SELECT c.id, c.name, c.address, c.city, c.phone, c.image_url, c.rating, c.total_reviews,
                COUNT(DISTINCT r.id) as review_count, AVG(r.rating) as avg_rating
         FROM saved_clinics sc
         JOIN clinics c ON sc.clinic_id = c.id
         LEFT JOIN reviews r ON c.id = r.clinic_id
         WHERE sc.patient_id = ?
         GROUP BY c.id, c.name, c.address, c.city, c.phone, c.image_url, c.rating, c.total_reviews, sc.created_at
         ORDER BY sc.created_at DESC`,
        [userId]
      );
    } else {
      clinics = await db.query(
        `SELECT c.*, COUNT(DISTINCT r.id) as review_count, AVG(r.rating) as avg_rating
         FROM saved_clinics sc
         JOIN clinics c ON sc.clinic_id = c.id
         LEFT JOIN reviews r ON c.id = r.clinic_id
         WHERE sc.patient_id = ?
         GROUP BY c.id
         ORDER BY sc.created_at DESC`,
        [userId]
      );
    }

    res.json(clinics);
  } catch (error) {
    console.error('Saved clinics error:', error);
    res.status(500).json({ error: 'Failed to fetch saved clinics' });
  }
}

export async function saveClinic(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { clinic_id } = req.body;

    if (!clinic_id) {
      return res.status(400).json({ error: 'Clinic ID is required' });
    }

    // Check if already saved
    const existing = await db.queryOne(
      'SELECT id FROM saved_clinics WHERE patient_id = ? AND clinic_id = ?',
      [userId, clinic_id]
    );

    if (existing) {
      return res.status(400).json({ error: 'Clinic already saved' });
    }

    await db.execute(
      'INSERT INTO saved_clinics (patient_id, clinic_id) VALUES (?, ?)',
      [userId, clinic_id]
    );

    res.json({ message: 'Clinic saved successfully' });
  } catch (error) {
    console.error('Save clinic error:', error);
    res.status(500).json({ error: 'Failed to save clinic' });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const user = await db.queryOne(
      `SELECT id, email, first_name, last_name, phone, profile_image_url, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { first_name, last_name, phone } = req.body;
    const isPostgres = process.env.DB_TYPE === 'postgres';
    const nowFn = isPostgres ? 'CURRENT_TIMESTAMP' : 'NOW()';

    await db.execute(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = ${nowFn} WHERE id = ?`,
      [first_name, last_name, phone, userId]
    );

    const user = await db.queryOne(
      'SELECT id, email, first_name, last_name, phone FROM users WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}
