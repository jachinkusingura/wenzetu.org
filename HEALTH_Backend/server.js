const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const JWT_SECRET = 'healthbridge_secret_123'; // In production, use env var

// Middleware to check JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

function requireRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role && req.user.role !== 'healthbridge_admin') {
            return res.status(403).json({ error: "Access denied" });
        }
        next();
    };
}

// --- AUTH API ---
app.post('/api/auth/register', (req, res) => {
    const { fullName, username, email, phone, password, role } = req.body;
    if (!username || !password || !fullName || !role) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, row) => {
        if (row) return res.status(400).json({ error: "Username already exists" });

        const hash = bcrypt.hashSync(password, 10);
        let clinicId = null;

        if (role === 'clinic_admin') {
            // Assign to first unassigned non-sensitive clinic (for demo purposes)
            db.get(`SELECT id FROM clinics WHERE assignedClinicAdminId IS NULL AND sensitive = 0 LIMIT 1`, (err, clinic) => {
                clinicId = clinic ? clinic.id : 2; // Fallback to TASO
                insertUser(clinicId);
            });
        } else {
            insertUser(null);
        }

        function insertUser(cId) {
            db.run(`INSERT INTO users (fullName, username, email, phone, password, role, clinicId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [fullName, username, email, phone, hash, role, cId], function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    const userId = this.lastID;
                    if (cId) {
                        db.run(`UPDATE clinics SET assignedClinicAdminId = ? WHERE id = ?`, [userId, cId]);
                    }
                    res.json({ message: "Registration successful" });
            });
        }
    });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password, role } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        // Verify role selection matches DB
        if (role && user.role !== role) {
             return res.status(403).json({ error: "Selected role does not match user account" });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role, clinicId: user.clinicId, fullName: user.fullName }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, clinicId: user.clinicId, fullName: user.fullName } });
    });
});

// --- CLINICS API ---
app.get('/api/clinics', authenticateToken, (req, res) => {
    let query = `SELECT * FROM clinics`;
    if (req.user.role === 'community') {
        query += ` WHERE sensitive = 0`;
    }
    
    db.all(query, (err, clinics) => {
        if (err) return res.status(500).json({ error: err.message });
        
        let processed = 0;
        if (clinics.length === 0) return res.json([]);
        
        clinics.forEach(clinic => {
            clinic.verified = clinic.verified === 1;
            clinic.sensitive = clinic.sensitive === 1;
            
            db.all(`SELECT name FROM services WHERE clinic_id = ?`, [clinic.id], (err, services) => {
                clinic.services = services.map(s => s.name);
                db.all(`SELECT name, status FROM medicines WHERE clinic_id = ?`, [clinic.id], (err, medicines) => {
                    // Just return names for frontend compatibility, though status is stored
                    clinic.medicines = medicines.map(m => m.name);
                    processed++;
                    if (processed === clinics.length) res.json(clinics);
                });
            });
        });
    });
});

app.put('/api/clinics/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    if (req.user.role === 'clinic_admin' && req.user.clinicId !== id) {
        return res.status(403).json({ error: "Not authorized to edit this clinic" });
    }
    
    const { name, phone, opening, closing, services } = req.body;
    db.run(`UPDATE clinics SET name=?, phone=?, opening=?, closing=? WHERE id=?`,
        [name, phone, opening, closing, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Handle newly added services
            if (services && services.length > 0) {
                 db.run(`DELETE FROM services WHERE clinic_id = ?`, [id], () => {
                     const insert = db.prepare(`INSERT INTO services (clinic_id, name) VALUES (?, ?)`);
                     services.forEach(s => insert.run(id, s));
                     insert.finalize();
                 });
            }
            res.json({ message: "Clinic updated" });
    });
});

app.post('/api/clinics/:id/verify', authenticateToken, requireRole('healthbridge_admin'), (req, res) => {
    db.run(`UPDATE clinics SET verified = 1 WHERE id = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Clinic verified" });
    });
});

app.post('/api/clinics/:id/stock', authenticateToken, requireRole('clinic_admin'), (req, res) => {
    const id = parseInt(req.params.id);
    if (req.user.clinicId !== id) return res.status(403).json({ error: "Access denied" });
    
    const { medicineName, status } = req.body;
    db.run(`UPDATE medicines SET status = ? WHERE clinic_id = ? AND name = ?`, [status, id, medicineName], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Stock updated" });
    });
});

// --- ARTICLES API ---
app.get('/api/articles', authenticateToken, (req, res) => {
    let query = `SELECT * FROM articles`;
    if (req.user.role === 'community') query += ` WHERE sensitive = 0`;
    
    db.all(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        rows.forEach(r => r.sensitive = r.sensitive === 1);
        res.json(rows);
    });
});

app.post('/api/articles', authenticateToken, requireRole('healthbridge_admin'), (req, res) => {
    const { title, category, content, sensitive } = req.body;
    db.run(`INSERT INTO articles (title, category, content, sensitive) VALUES (?, ?, ?, ?)`,
        [title, category, content, sensitive ? 1 : 0], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
    });
});

app.delete('/api/articles/:id', authenticateToken, requireRole('healthbridge_admin'), (req, res) => {
    db.run(`DELETE FROM articles WHERE id = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted" });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
