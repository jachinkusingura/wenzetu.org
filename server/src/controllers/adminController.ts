import * as db from '../database/connection.js';

export async function getStats() {
  const usersCount = await db.queryOne('SELECT COUNT(*) as count FROM users');
  const clinicsCount = await db.queryOne('SELECT COUNT(*) as count FROM clinics');
  const verifiedClinicsCount = await db.queryOne('SELECT COUNT(*) as count FROM clinics WHERE is_verified = 1');
  
  return {
    totalUsers: usersCount?.count || 0,
    totalClinics: clinicsCount?.count || 0,
    verifiedClinics: verifiedClinicsCount?.count || 0
  };
}

export async function getClinics() {
  return await db.query('SELECT * FROM clinics');
}

export async function verifyClinic(id: number) {
  return await db.execute('UPDATE clinics SET is_verified = 1 WHERE id = ?', [id]);
}
