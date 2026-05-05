import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, '..', '..', 'data', 'db.json');

interface DbSchema {
  users: any[];
  clinics: any[];
  services: any[];
  appointments: any[];
  medicines: any[];
  medicine_inventory: any[];
  reviews: any[];
  saved_clinics: any[];
  notifications: any[];
  specializations: any[];
  doctors: any[];
  doctor_specializations: any[];
}

const initialDb: DbSchema = {
  users: [],
  clinics: [],
  services: [],
  appointments: [],
  medicines: [],
  medicine_inventory: [],
  reviews: [],
  saved_clinics: [],
  notifications: [],
  specializations: [],
  doctors: [],
  doctor_specializations: []
};

class JsonDb {
  private data: DbSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DbSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      } catch (e) {
        console.error('Error loading JSON DB:', e);
        return initialDb;
      }
    }
    this.save(initialDb);
    return initialDb;
  }

  private save(data: DbSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Error saving JSON DB:', e);
    }
  }

  public async query(sql: string, values: any[] = []): Promise<any> {
    const normalizedSql = sql.trim().toLowerCase();
    
    // SELECT * FROM users WHERE email = ?
    if (normalizedSql.includes('select') && normalizedSql.includes('from users') && normalizedSql.includes('where email =')) {
      return this.data.users.filter(u => u.email.toLowerCase() === values[0].toLowerCase());
    }

    // SELECT * FROM users WHERE id = ?
    if (normalizedSql.includes('select') && normalizedSql.includes('from users') && normalizedSql.includes('where id =')) {
      return this.data.users.filter(u => u.id === values[0]);
    }

    // INSERT INTO users ...
    if (normalizedSql.includes('insert into users')) {
      const newUser = {
        id: this.data.users.length + 1,
        email: values[0],
        password: values[1],
        first_name: values[2] || '',
        last_name: values[3] || '',
        role: values[4] || 'patient',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.users.push(newUser);
      this.save(this.data);
      return { insertId: newUser.id };
    }

    // SELECT * FROM clinics
    if (normalizedSql.includes('select') && normalizedSql.includes('from clinics')) {
      return this.data.clinics;
    }

    // INSERT INTO appointments ...
    if (normalizedSql.includes('insert into appointments')) {
      const newAppointment = {
        id: this.data.appointments.length + 1,
        patient_id: values[0],
        clinic_id: values[1],
        service_id: values[2],
        appointment_date: values[3],
        appointment_time: values[4],
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.appointments.push(newAppointment);
      this.save(this.data);
      return { insertId: newAppointment.id };
    }

    // SELECT * FROM appointments WHERE patient_id = ?
    if (normalizedSql.includes('select') && normalizedSql.includes('from appointments') && normalizedSql.includes('where patient_id =')) {
      return this.data.appointments.filter(a => a.patient_id === values[0]);
    }

    // Add more patterns as needed by the controllers...
    console.warn('Unhandled SQL query in JsonDb:', sql, values);
    return [];
  }
}

export const jsonDb = new JsonDb();
