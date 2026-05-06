const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'healthbridge.sqlite');
const db = new sqlite3.Database(dbPath);

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT,
            username TEXT UNIQUE,
            email TEXT,
            phone TEXT,
            password TEXT,
            role TEXT,
            clinicId INTEGER
        )`);

        // Clinics Table
        db.run(`CREATE TABLE IF NOT EXISTS clinics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            lat REAL,
            lng REAL,
            district TEXT,
            parish TEXT,
            phone TEXT,
            opening TEXT,
            closing TEXT,
            verified BOOLEAN,
            sensitive BOOLEAN,
            assignedClinicAdminId INTEGER
        )`);

        // Services Table (Many-to-Many)
        db.run(`CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clinic_id INTEGER,
            name TEXT
        )`);

        // Medicines Table (Many-to-Many)
        db.run(`CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clinic_id INTEGER,
            name TEXT,
            status TEXT DEFAULT 'In Stock'
        )`);

        // Articles Table
        db.run(`CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            category TEXT,
            content TEXT,
            sensitive BOOLEAN
        )`);

        seedDatabase();
    });
}

function seedDatabase() {
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (row && row.count === 0) {
            console.log("Seeding database...");
            const hash = bcrypt.hashSync('pass123', 10);
            
            // Seed Users
            const insertUser = db.prepare(`INSERT INTO users (fullName, username, password, role, clinicId) VALUES (?, ?, ?, ?, ?)`);
            insertUser.run("John Doe", "community1", hash, "community", null);
            insertUser.run("Dr. Sarah", "clinic_admin", hash, "clinic_admin", 2);
            insertUser.run("Admin User", "healthbridge_admin", hash, "healthbridge_admin", null);
            insertUser.finalize();

            // Seed Clinics
            const clinics = [
                { id: 1, name: "Ruharo Mission Hospital", lat: -0.6072, lng: 30.6545, district: "Mbarara", parish: "Ruharo", phone: "+256 700 123456", opening: "07:00", closing: "22:00", verified: true, sensitive: false, assignedClinicAdminId: null, services: ["Maternity", "General Consultation", "Pharmacy", "HIV/AIDS"], medicines: ["Amoxicillin", "Paracetamol", "Artemether"] },
                { id: 2, name: "TASO Mbarara", lat: -0.6100, lng: 30.6500, district: "Mbarara", parish: "Kamukuzi", phone: "+256 700 789012", opening: "08:00", closing: "17:00", verified: true, sensitive: false, assignedClinicAdminId: 2, services: ["HIV/AIDS", "Pharmacy", "Counseling"], medicines: ["ARVs", "Paracetamol"] },
                { id: 3, name: "Good Samaritan Clinic", lat: -0.5950, lng: 30.6600, district: "Mbarara", parish: "Katete", phone: "+256 700 555666", opening: "09:00", closing: "18:00", verified: false, sensitive: false, assignedClinicAdminId: null, services: ["General Consultation", "Pharmacy"], medicines: ["Paracetamol", "Ibuprofen"] },
                { id: 4, name: "Kampala General Hospital", lat: 0.3136, lng: 32.5811, district: "Kampala", parish: "Central", phone: "+256 312 123456", opening: "00:00", closing: "23:59", verified: true, sensitive: false, assignedClinicAdminId: null, services: ["Maternity", "Dental", "Emergency"], medicines: ["Amoxicillin", "Ciprofloxacin"] },
                { id: 5, name: "Nsambya Hospital", lat: 0.2925, lng: 32.5850, district: "Kampala", parish: "Nsambya", phone: "+256 414 123456", opening: "07:30", closing: "21:00", verified: true, sensitive: false, assignedClinicAdminId: null, services: ["Maternity", "Paediatrics"], medicines: ["Paracetamol"] },
                { id: 6, name: "Gulu Regional Hospital", lat: 2.7750, lng: 32.2980, district: "Gulu", parish: "Gulu City", phone: "+256 471 432111", opening: "00:00", closing: "23:59", verified: true, sensitive: false, assignedClinicAdminId: null, services: ["General Consultation", "Surgery", "HIV/AIDS"], medicines: ["Artemether", "ARVs"] },
                { id: 7, name: "Lacor Hospital", lat: 2.7500, lng: 32.2800, district: "Gulu", parish: "Lacor", phone: "+256 392 123456", opening: "08:00", closing: "18:00", verified: true, sensitive: false, assignedClinicAdminId: null, services: ["Maternity", "Pharmacy"], medicines: ["Amoxicillin"] },
                { id: 8, name: "Jinja Regional Hospital", lat: 0.4346, lng: 33.2049, district: "Jinja", parish: "Jinja Central", phone: "+256 434 123456", opening: "07:00", closing: "22:00", verified: true, sensitive: false, assignedClinicAdminId: null, services: ["Maternity", "General Consultation"], medicines: ["Paracetamol", "Quinine"] },
                { id: 9, name: "Mental Health Center - Butabika", lat: 0.3333, lng: 32.6333, district: "Kampala", parish: "Butabika", phone: "+256 414 123789", opening: "08:00", closing: "17:00", verified: true, sensitive: true, assignedClinicAdminId: null, services: ["Mental Health", "Counseling"], medicines: ["Antidepressants", "Antipsychotics"] },
                { id: 10, name: "STD Clinic - Mulago", lat: 0.3391, lng: 32.5765, district: "Kampala", parish: "Mulago", phone: "+256 414 123000", opening: "09:00", closing: "16:00", verified: true, sensitive: true, assignedClinicAdminId: null, services: ["STD Testing", "Treatment"], medicines: ["Antibiotics", "Antivirals"] }
            ];

            clinics.forEach(c => {
                db.run(`INSERT INTO clinics (name, lat, lng, district, parish, phone, opening, closing, verified, sensitive, assignedClinicAdminId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [c.name, c.lat, c.lng, c.district, c.parish, c.phone, c.opening, c.closing, c.verified ? 1 : 0, c.sensitive ? 1 : 0, c.assignedClinicAdminId], function(err) {
                    if (err) return console.error(err);
                    const cid = this.lastID;
                    c.services.forEach(s => db.run(`INSERT INTO services (clinic_id, name) VALUES (?, ?)`, [cid, s]));
                    c.medicines.forEach(m => db.run(`INSERT INTO medicines (clinic_id, name) VALUES (?, ?)`, [cid, m]));
                });
            });

            // Seed Articles
            const articles = [
                { title: "Malaria Prevention", category: "Prevention", content: "Sleep under nets, clear standing water.", sensitive: false },
                { title: "Mental Health Awareness", category: "Mental Health", content: "It's okay to seek help. Call helpline 0800 123 456.", sensitive: true },
                { title: "HIV Treatment & Support", category: "HIV", content: "ART is free at government facilities.", sensitive: true },
                { title: "STD Prevention", category: "STD", content: "Use protection and get tested regularly.", sensitive: true }
            ];
            const insertArticle = db.prepare(`INSERT INTO articles (title, category, content, sensitive) VALUES (?, ?, ?, ?)`);
            articles.forEach(a => insertArticle.run(a.title, a.category, a.content, a.sensitive ? 1 : 0));
            insertArticle.finalize();
        }
    });
}

initDb();

module.exports = db;
