import * as db from '../database/connection.js';

export async function getMyClinic(userId: number) {
  // Find the clinic where owner_id matches this user
  // For the sake of this prototype, if no clinic exists, we'll return a default one
  let clinic = await db.queryOne('SELECT * FROM clinics WHERE owner_id = ?', [userId]);
  
  if (!clinic) {
    // Check if there are any clinics at all
    const anyClinic = await db.queryOne('SELECT * FROM clinics LIMIT 1');
    if (anyClinic) {
      clinic = anyClinic;
    } else {
      // Create a dummy clinic if none exist
      return {
        id: 1,
        name: 'Good Samaritan Clinic',
        phone: '+256 700 555666',
        opening_time: '09:00',
        closing_time: '18:00',
        services: [],
        inventory: []
      };
    }
  }

  // Fetch services and inventory
  const services = await db.query('SELECT name FROM services WHERE clinic_id = ?', [clinic.id]);
  const inventory = await db.query('SELECT m.name, mi.status FROM medicine_inventory mi JOIN medicines m ON mi.medicine_id = m.id WHERE mi.clinic_id = ?', [clinic.id]);

  return {
    ...clinic,
    services: services.map(s => s.name),
    inventory: inventory
  };
}

export async function updateClinic(id: number, data: any) {
  return await db.execute(
    'UPDATE clinics SET name = ?, phone = ?, opening_time = ?, closing_time = ? WHERE id = ?',
    [data.name, data.phone, data.opening_time, data.closing_time, id]
  );
}

export async function addService(clinicId: number, serviceName: string) {
  return await db.execute('INSERT INTO services (clinic_id, name) VALUES (?, ?)', [clinicId, serviceName]);
}

export async function updateStock(clinicId: number, medicineName: string, status: string) {
  // Find medicine ID
  const medicine = await db.queryOne('SELECT id FROM medicines WHERE name = ?', [medicineName]);
  if (!medicine) {
    // Create medicine if it doesn't exist
    const result = await db.execute('INSERT INTO medicines (name) VALUES (?)', [medicineName]);
    const medicineId = result.insertId;
    return await db.execute('INSERT INTO medicine_inventory (clinic_id, medicine_id, status) VALUES (?, ?, ?)', [clinicId, medicineId, status]);
  }
  
  // Check if inventory record exists
  const existing = await db.queryOne('SELECT id FROM medicine_inventory WHERE clinic_id = ? AND medicine_id = ?', [clinicId, medicine.id]);
  if (existing) {
    return await db.execute('UPDATE medicine_inventory SET status = ? WHERE id = ?', [status, existing.id]);
  } else {
    return await db.execute('INSERT INTO medicine_inventory (clinic_id, medicine_id, status) VALUES (?, ?, ?)', [clinicId, medicine.id, status]);
  }
}
