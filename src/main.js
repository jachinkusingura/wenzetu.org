// src/main.js
import './style.css';
import { initUsers, loadClinics, getCurrentUser, setCurrentUser, getClinics } from './data.js';
import { renderAuthScreen } from './auth.js';
import { renderSearchMapPage } from './map.js';
import { renderCommunityHome, handleQuickSearch, handleMyLocation, renderArticlesPage, renderClinicAdminPanel, renderHealthBridgeAdmin } from './dashboard.js';

// Initialize mock data
initUsers();
loadClinics();

const app = document.getElementById('app');

function init() {
    const user = getCurrentUser();
    if (user) {
        renderRoleDashboard(user);
    } else {
        renderAuthScreen(app, () => {
            renderRoleDashboard(getCurrentUser());
        });
    }
}

function renderRoleDashboard(user) {
    if (!user) {
        renderAuthScreen(app, () => renderRoleDashboard(getCurrentUser()));
        return;
    }

    const role = user.role;
    
    // Build navbar
    let navbarHtml = `
        <nav class="navbar">
            <div class="nav-container">
                <div class="logo">🏥 Health<span>Bridge</span></div>
                <div class="nav-links">
                    ${role === 'community' ? `
                        <button id="navHomeBtn">Home</button>
                        <button id="navSearchBtn">Find Clinics</button>
                        <button id="navArticlesBtn">Articles</button>
                    ` : ''}
                    ${role === 'clinic_admin' ? '<button id="navClinicAdminBtn">My Clinic</button>' : ''}
                    ${role === 'healthbridge_admin' ? '<button id="navAdminBtn">Admin Panel</button>' : ''}
                    <button id="logoutBtn" style="background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.5);">Logout</button>
                </div>
            </div>
        </nav>
        <main id="dashboardContent"></main>
        <footer>© ${new Date().getFullYear()} HealthBridge – Privacy-first health locator</footer>
        
        <!-- Global Modal Container -->
        <div id="globalModal" class="modal">
            <div class="modal-content">
                <span class="close-btn" id="closeModalBtn">&times;</span>
                <div id="modalBody"></div>
            </div>
        </div>
    `;
    
    app.innerHTML = navbarHtml;
    
    const content = document.getElementById('dashboardContent');
    
    // Setup modal close
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('globalModal');
        if (e.target === modal) closeModal();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        setCurrentUser(null);
        renderAuthScreen(app, () => renderRoleDashboard(getCurrentUser()));
    });

    // Navigation Events
    if (role === 'community') {
        document.getElementById('navHomeBtn').addEventListener('click', () => renderCommunityHome(content, viewClinicDetails, handleQuickSearch, handleMyLocation));
        document.getElementById('navSearchBtn').addEventListener('click', () => renderSearchMapPage(content, viewClinicDetails));
        document.getElementById('navArticlesBtn').addEventListener('click', () => renderArticlesPage(content));
        
        // Default view
        renderCommunityHome(content, viewClinicDetails, handleQuickSearch, handleMyLocation);
    } else if (role === 'clinic_admin') {
        document.getElementById('navClinicAdminBtn').addEventListener('click', () => renderClinicAdminPanel(content));
        renderClinicAdminPanel(content);
    } else if (role === 'healthbridge_admin') {
        document.getElementById('navAdminBtn').addEventListener('click', () => renderHealthBridgeAdmin(content));
        renderHealthBridgeAdmin(content);
    }
}

// Global Modal Logic
function viewClinicDetails(id) {
    const clinics = getClinics();
    const clinic = clinics.find(c => c.id === id);
    if (!clinic) return;
    
    const modal = document.getElementById('globalModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h2 style="margin-bottom: 15px; color: #1a3c34;">${clinic.name}</h2>
        <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
            <p><strong>📍 Location:</strong> ${clinic.district}, ${clinic.parish}</p>
            <p><strong>📞 Phone:</strong> ${clinic.phone}</p>
            <p><strong>🕒 Hours:</strong> ${clinic.opening} – ${clinic.closing}</p>
        </div>
        <p class="mb-4"><strong>💊 Medicines Available:</strong><br> ${clinic.medicines.map(m => `<span class="service-tag" style="background:#f1f5f9; color:#475569; border-color:#e2e8f0;">${m}</span>`).join('')}</p>
        <p><strong>🏥 Services:</strong><br> ${clinic.services.map(s => `<span class="service-tag">${s}</span>`).join('')}</p>
    `;
    
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('globalModal');
    if (modal) modal.style.display = 'none';
}

// Boot
init();
