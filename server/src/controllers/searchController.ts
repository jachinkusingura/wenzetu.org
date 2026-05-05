import { Request, Response } from 'express';
import * as db from '../database/connection.js';

/**
 * Dialect Strategy Interface
 * Defines the database-specific SQL fragments to keep the controller logic clean.
 */
interface DialectStrategy {
  distance: (lat: number, lon: number) => string;
  proximity: (lat: number, lon: number, radius: number) => string;
  like: string;
  supportsJsonAgg: boolean;
  usePlaceholders: boolean;
}

const PostgresPostGISDialect: DialectStrategy = {
  distance: (lat, lon) => `ST_Distance(c.location, ST_Point(${lon}, ${lat})::geography) / 1000`,
  proximity: (lat, lon, rad) => `ST_DWithin(c.location, ST_Point(${lon}, ${lat})::geography, ${rad} * 1000)`,
  like: 'ILIKE',
  supportsJsonAgg: true,
  usePlaceholders: false // ST_Point doesn't play well with ? in some driver versions
};

const PostgresFallbackDialect: DialectStrategy = {
  distance: (lat, lon) => `(6371 * acos(cos(radians(${lat})) * cos(radians(c.latitude)) * cos(radians(c.longitude) - radians(${lon})) + sin(radians(${lat})) * sin(radians(c.latitude))))`,
  proximity: (lat, lon, rad) => `(6371 * acos(cos(radians(${lat})) * cos(radians(c.latitude)) * cos(radians(c.longitude) - radians(${lon})) + sin(radians(${lat})) * sin(radians(c.latitude)))) <= ${rad}`,
  like: 'ILIKE',
  supportsJsonAgg: true,
  usePlaceholders: false
};

const MySQLDialect: DialectStrategy = {
  distance: (lat, lon) => `ST_Distance_Sphere(POINT(c.longitude, c.latitude), POINT(${lon}, ${lat})) / 1000`,
  proximity: (lat, lon, rad) => `ST_Distance_Sphere(POINT(c.longitude, c.latitude), POINT(${lon}, ${lat})) / 1000 <= ${rad}`,
  like: 'LIKE',
  supportsJsonAgg: false,
  usePlaceholders: false
};

/**
 * Returns the best dialect strategy for the current environment
 */
function getActiveDialect(): DialectStrategy {
  const dbType = process.env.DB_TYPE || 'mysql';
  if (dbType === 'postgres') {
    return db.isPostGISAvailable() ? PostgresPostGISDialect : PostgresFallbackDialect;
  }
  return MySQLDialect;
}

export const searchClinics = async (req: Request, res: Response) => {
  try {
    const {
      latitude,
      longitude,
      radius = 10,
      specialization_id,
      medicine_id,
      service_name,
      rating_min,
      is_verified,
      limit = 20,
      offset = 0,
    } = req.query;

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const rad = parseFloat(radius as string);
    const dialect = getActiveDialect();

    let query: string;
    const params: any[] = [];

    // Base query with distance calculation
    const distExpr = (lat && lon) ? dialect.distance(lat, lon) : '0';

    query = `
      SELECT DISTINCT 
        c.*,
        ${distExpr} as distance
      FROM clinics c
      LEFT JOIN services s ON c.id = s.clinic_id
      ${specialization_id ? 'LEFT JOIN clinic_service_specializations css ON s.id = css.service_id' : ''}
      ${medicine_id ? 'LEFT JOIN service_medicines sm ON s.id = sm.service_id' : ''}
      WHERE c.is_active = true
    `;

    // Apply Filters
    if (lat && lon && rad) {
      query += ` AND ${dialect.proximity(lat, lon, rad)}`;
    }

    if (is_verified !== undefined) {
      query += ` AND c.is_verified = ?`;
      params.push(is_verified === 'true');
    }

    if (rating_min) {
      query += ` AND c.rating >= ?`;
      params.push(parseFloat(rating_min as string));
    }

    if (specialization_id) {
      query += ` AND css.specialization_id = ?`;
      params.push(specialization_id);
    }

    if (medicine_id) {
      query += ` AND sm.medicine_id = ?`;
      params.push(medicine_id);
    }

    if (service_name) {
      query += ` AND s.name ${dialect.like} ?`;
      params.push(`%${service_name}%`);
    }

    query += ` ORDER BY distance ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const rows = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Search clinics error:', error);
    res.status(500).json({ error: 'Failed to search clinics' });
  }
};

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { clinic_id, specialization_id, limit = 20, offset = 0 } = req.query;
    const dialect = getActiveDialect();
    
    let query: string;
    const params: any[] = [];

    if (dialect.supportsJsonAgg) {
      // Optimized Postgres query with JSON aggregation
      query = `
        SELECT d.*, u.first_name, u.last_name, u.profile_image_url,
               json_agg(s.*) FILTER (WHERE s.id IS NOT NULL) as specializations
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN doctor_specializations ds ON d.id = ds.doctor_id
        LEFT JOIN specializations s ON ds.specialization_id = s.id
        WHERE d.is_available = true
      `;
      
      if (clinic_id) {
        query += ` AND d.clinic_id = ?`;
        params.push(clinic_id);
      }
      
      if (specialization_id) {
        query += ` AND ds.specialization_id = ?`;
        params.push(specialization_id);
      }
      
      query += ` GROUP BY d.id, u.id`;
    } else {
      // Standard MySQL compatible query
      query = `
        SELECT d.*, u.first_name, u.last_name, u.profile_image_url
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        WHERE d.is_available = true
      `;
      
      if (clinic_id) {
        query += ` AND d.clinic_id = ?`;
        params.push(clinic_id);
      }
      
      if (specialization_id) {
        query += ` AND EXISTS (
          SELECT 1 FROM doctor_specializations 
          WHERE doctor_id = d.id AND specialization_id = ?
        )`;
        params.push(specialization_id);
      }
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const rows = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

export const getSpecializations = async (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM specializations ORDER BY name ASC';
    const rows = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({ error: 'Failed to fetch specializations' });
  }
};

export const quickBook = async (req: Request, res: Response) => {
  try {
    const { clinic_id, service_id, appointment_date, appointment_time } = req.body;
    const patient_id = (req as any).user?.id;

    if (!patient_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate clinic and service exist
    const check = await db.queryOne(
      'SELECT id FROM services WHERE id = ? AND clinic_id = ?',
      [service_id, clinic_id]
    );

    if (!check) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Create appointment
    const result = await db.execute(
      `INSERT INTO appointments (patient_id, clinic_id, service_id, appointment_date, appointment_time, status)
       VALUES (?, ?, ?, ?, ?, 'scheduled')`,
      [patient_id, clinic_id, service_id, appointment_date, appointment_time]
    );

    res.status(201).json({ message: 'Appointment booked successfully', id: (result as any).insertId });
  } catch (error) {
    console.error('Quick book error:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
};
