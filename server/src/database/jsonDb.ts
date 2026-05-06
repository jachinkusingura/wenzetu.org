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

    // SELECT COUNT(*) as count FROM users
    if (normalizedSql.includes('select count(*)') && normalizedSql.includes('from users')) {
      return [{ count: this.data.users.length }];
    }

    // SELECT COUNT(*) as count FROM clinics WHERE is_verified = 1
    if (normalizedSql.includes('select count(*)') && normalizedSql.includes('from clinics') && normalizedSql.includes('where is_verified = 1')) {
      return [{ count: this.data.clinics.filter(c => c.is_verified === 1 || c.is_verified === true).length }];
    }

    // SELECT COUNT(*) as count FROM clinics
    if (normalizedSql.includes('select count(*)') && normalizedSql.includes('from clinics')) {
      return [{ count: this.data.clinics.length }];
    }

    // UPDATE clinics SET is_verified = 1 WHERE id = ?
    if (normalizedSql.includes('update clinics set is_verified = 1') && normalizedSql.includes('where id =')) {
      const id = values[0];
      const clinic = this.data.clinics.find(c => c.id === id);
      if (clinic) {
        clinic.is_verified = 1;
        this.save(this.data);
        return { changedRows: 1 };
      }
      return { changedRows: 0 };
    }

    // SELECT * FROM clinics WHERE owner_id = ?
    if (normalizedSql.includes('from clinics') && normalizedSql.includes('where owner_id =')) {
      return this.data.clinics.filter(c => c.owner_id === values[0]);
    }

    // SELECT * FROM clinics LIMIT 1
    if (normalizedSql.includes('from clinics') && normalizedSql.includes('limit 1')) {
      return this.data.clinics.slice(0, 1);
    }

    // SELECT name FROM services WHERE clinic_id = ?
    if (normalizedSql.includes('from services') && normalizedSql.includes('where clinic_id =')) {
      return this.data.services.filter(s => s.clinic_id === values[0]);
    }

    // Medicine Inventory JOIN
    if (normalizedSql.includes('from medicine_inventory') && normalizedSql.includes('join medicines')) {
      const clinicId = values[0];
      return this.data.medicine_inventory
        .filter(mi => mi.clinic_id === clinicId)
        .map(mi => {
          const med = this.data.medicines.find(m => m.id === mi.medicine_id);
          return { name: med ? med.name : 'Unknown', status: mi.status };
        });
    }

    // UPDATE clinics
    if (normalizedSql.includes('update clinics set name =')) {
      const id = values[4];
      const clinic = this.data.clinics.find(c => c.id === id);
      if (clinic) {
        clinic.name = values[0];
        clinic.phone = values[1];
        clinic.opening_time = values[2];
        clinic.closing_time = values[3];
        this.save(this.data);
        return { changedRows: 1 };
      }
      return { changedRows: 0 };
    }

    // INSERT INTO services
    if (normalizedSql.includes('insert into services')) {
      const newService = {
        id: this.data.services.length + 1,
        clinic_id: values[0],
        name: values[1]
      };
      this.data.services.push(newService);
      this.save(this.data);
      return { insertId: newService.id };
    }

    // SELECT id FROM medicines WHERE name = ?
    if (normalizedSql.includes('from medicines') && normalizedSql.includes('where name =')) {
      return this.data.medicines.filter(m => m.name.toLowerCase() === values[0].toLowerCase());
    }

    // INSERT INTO medicines
    if (normalizedSql.includes('insert into medicines')) {
      const newMed = { id: this.data.medicines.length + 1, name: values[0] };
      this.data.medicines.push(newMed);
      this.save(this.data);
      return { insertId: newMed.id };
    }

    // Medicine Inventory check/update
    if (normalizedSql.includes('from medicine_inventory') && normalizedSql.includes('where clinic_id =') && normalizedSql.includes('medicine_id =')) {
      return this.data.medicine_inventory.filter(mi => mi.clinic_id === values[0] && mi.medicine_id === values[1]);
    }

    if (normalizedSql.includes('update medicine_inventory set status =')) {
      const id = values[1];
      const mi = this.data.medicine_inventory.find(item => item.id === id);
      if (mi) {
        mi.status = values[0];
        this.save(this.data);
        return { changedRows: 1 };
      }
      return { changedRows: 0 };
    }

    if (normalizedSql.includes('insert into medicine_inventory')) {
      const newItem = {
        id: this.data.medicine_inventory.length + 1,
        clinic_id: values[0],
        medicine_id: values[1],
        status: values[2]
      };
      this.data.medicine_inventory.push(newItem);
      this.save(this.data);
      return { insertId: newItem.id };
    }

    // Add more patterns as needed by the controllers...
    console.warn('Unhandled SQL query in JsonDb:', sql, values);
    return [];
  }
}

export const jsonDb = new JsonDb();
