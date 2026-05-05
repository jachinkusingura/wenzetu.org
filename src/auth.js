// src/auth.js
import { getUsers, saveUsers, getClinics, saveClinics, setCurrentUser } from './data.js';

export function renderAuthScreen(appElement, onLoginSuccess, showLogin = true) {
    if (showLogin) {
        appElement.innerHTML = `
            <div class="auth-screen">
                <div class="auth-card">
                    <h2>🏥 Welcome to HealthBridge</h2>
                    <div id="loginForm">
                        <div class="form-group">
                            <label>Username</label>
                            <input type="text" id="loginUsername" placeholder="Enter username">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="loginPassword" placeholder="Password">
                        </div>
                        <button class="btn btn-primary" id="loginBtn">Login</button>
                        <div class="switch-link">
                            Don't have an account? <a href="#" id="switchToRegister">Register</a>
                        </div>
                        <div id="loginError" class="error-msg"></div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('loginBtn').addEventListener('click', () => handleLogin(onLoginSuccess));
        document.getElementById('switchToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            renderAuthScreen(appElement, onLoginSuccess, false);
        });

    } else {
        appElement.innerHTML = `
            <div class="auth-screen">
                <div class="auth-card">
                    <h2>Create Account</h2>
                    <div id="registerForm">
                        <div class="form-group"><label>Full Name</label><input id="regFullName" placeholder="Full name"></div>
                        <div class="form-group"><label>Username</label><input id="regUsername" placeholder="Username"></div>
                        <div class="form-group"><label>Email</label><input id="regEmail" placeholder="Email"></div>
                        <div class="form-group"><label>Phone</label><input id="regPhone" placeholder="Phone"></div>
                        <div class="form-group"><label>Password</label><input type="password" id="regPassword" placeholder="Password"></div>
                        <div class="form-group"><label>Role</label>
                            <select id="regRole">
                                <option value="community">Community Member</option>
                                <option value="clinic_admin">Clinic Administrator</option>
                                <option value="healthbridge_admin">HealthBridge Administrator</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" id="registerBtn">Register</button>
                        <div class="switch-link">
                            Already have an account? <a href="#" id="switchToLogin">Login</a>
                        </div>
                        <div id="registerError" class="error-msg"></div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('registerBtn').addEventListener('click', () => handleRegister(appElement, onLoginSuccess));
        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            renderAuthScreen(appElement, onLoginSuccess, true);
        });
    }
}

function handleLogin(onLoginSuccess) {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = getUsers();
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        document.getElementById('loginError').innerText = 'Invalid username or password';
        return;
    }
    
    const currentUser = { id: user.id, username: user.username, role: user.role, clinicId: user.clinicId };
    setCurrentUser(currentUser);
    onLoginSuccess();
}

function handleRegister(appElement, onLoginSuccess) {
    const fullName = document.getElementById('regFullName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    
    if (!username || !password || !fullName) {
        document.getElementById('registerError').innerText = 'Please fill all required fields (Name, Username, Password)';
        return;
    }
    
    let users = getUsers();
    if (users.find(u => u.username === username)) {
        document.getElementById('registerError').innerText = 'Username already exists';
        return;
    }
    
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    let clinicId = null;
    
    if (role === 'clinic_admin') {
        const clinicsData = getClinics();
        const availableClinic = clinicsData.find(c => c.assignedClinicAdminId === null && !c.sensitive);
        
        if (availableClinic) {
            clinicId = availableClinic.id;
            availableClinic.assignedClinicAdminId = newId;
            saveClinics(clinicsData);
        } else {
            clinicId = 2; // Fallback
        }
    }
    
    const newUser = { id: newId, username, password, role, fullName, email, phone, clinicId };
    users.push(newUser);
    saveUsers(users);
    
    alert('Registration successful! Please login.');
    renderAuthScreen(appElement, onLoginSuccess, true);
}
