-- Safe extension and spatial column handling
DO $$ 
BEGIN
    -- Try to enable PostGIS
    BEGIN
        CREATE EXTENSION IF NOT EXISTS postgis;
        CREATE EXTENSION IF NOT EXISTS postgis_topology;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'PostGIS extension not available. Spatial features will be disabled.';
    END;
END $$;

-- Create ENUM types safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('patient', 'clinic_owner', 'clinic_admin', 'hb_admin', 'sys_admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'cancelled', 'completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'specialization_type') THEN
        CREATE TYPE specialization_type AS ENUM ('cardiology', 'neurology', 'orthopedics', 'pediatrics', 'dermatology', 'psychiatry', 'urology', 'oncology', 'general_practice', 'surgery');
    END IF;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  profile_image_url VARCHAR(500),
  clinic_id INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON users(clinic_id);

-- Clinics table (Core columns)
CREATE TABLE IF NOT EXISTS clinics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(500) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  website VARCHAR(500),
  image_url VARCHAR(500),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  opening_time TIME,
  closing_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Safely add PostGIS columns if extension is available
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'location') THEN
            ALTER TABLE clinics ADD COLUMN location GEOGRAPHY(POINT, 4326);
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_clinics_location ON clinics USING GIST(location)';
        END IF;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_clinics_owner_id ON clinics(owner_id);
CREATE INDEX IF NOT EXISTS idx_clinics_city ON clinics(city);
CREATE INDEX IF NOT EXISTS idx_clinics_verified ON clinics(is_verified);
CREATE INDEX IF NOT EXISTS idx_clinics_active ON clinics(is_active);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_clinic_id ON services(clinic_id);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  dosage VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);

-- Medicine Inventory table
CREATE TABLE IF NOT EXISTS medicine_inventory (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  stock_quantity INTEGER DEFAULT 0,
  expiry_date DATE,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(clinic_id, medicine_id)
);

CREATE INDEX IF NOT EXISTS idx_medicine_inventory_clinic_id ON medicine_inventory(clinic_id);
CREATE INDEX IF NOT EXISTS idx_medicine_inventory_medicine_id ON medicine_inventory(medicine_id);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER,
  status appointment_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_patient_id ON reviews(patient_id);
CREATE INDEX IF NOT EXISTS idx_reviews_clinic_id ON reviews(clinic_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Saved Clinics table
CREATE TABLE IF NOT EXISTS saved_clinics (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(patient_id, clinic_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_clinics_patient_id ON saved_clinics(patient_id);
CREATE INDEX IF NOT EXISTS idx_saved_clinics_clinic_id ON saved_clinics(clinic_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Specializations table
CREATE TABLE IF NOT EXISTS specializations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  type specialization_type,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_specializations_name ON specializations(name);
CREATE INDEX IF NOT EXISTS idx_specializations_type ON specializations(type);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  license_number VARCHAR(255) UNIQUE NOT NULL,
  years_experience INTEGER,
  bio TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_license_number ON doctors(license_number);

-- Doctor Specializations junction table
CREATE TABLE IF NOT EXISTS doctor_specializations (
  id SERIAL PRIMARY KEY,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialization_id INTEGER NOT NULL REFERENCES specializations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, specialization_id)
);

CREATE INDEX IF NOT EXISTS idx_doctor_specializations_doctor_id ON doctor_specializations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_specializations_specialization_id ON doctor_specializations(specialization_id);

-- Clinic Services Specializations (clinics can offer specialized services)
CREATE TABLE IF NOT EXISTS clinic_service_specializations (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  specialization_id INTEGER NOT NULL REFERENCES specializations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service_id, specialization_id)
);

CREATE INDEX IF NOT EXISTS idx_clinic_service_specializations_service_id ON clinic_service_specializations(service_id);
CREATE INDEX IF NOT EXISTS idx_clinic_service_specializations_specialization_id ON clinic_service_specializations(specialization_id);

-- Service Medicines junction table
CREATE TABLE IF NOT EXISTS service_medicines (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service_id, medicine_id)
);

CREATE INDEX IF NOT EXISTS idx_service_medicines_service_id ON service_medicines(service_id);
CREATE INDEX IF NOT EXISTS idx_service_medicines_medicine_id ON service_medicines(medicine_id);
