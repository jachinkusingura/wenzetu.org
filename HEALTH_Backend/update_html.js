const fs = require('fs');

const htmlPath = './public/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

const newScript = `
    const API_URL = 'http://localhost:3000/api';
    let currentUser = null;
    let currentMapInstance = null;
    let currentMarkers = [];
    let clinicsData = [];
    let articles = [];

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        };
    }

    function showAuthScreen(showLogin = true) {
        const app = document.getElementById('app');
        if (showLogin) {
            app.innerHTML = \`
                <div class="auth-screen">
                    <div class="auth-card">
                        <h2>🏥 Welcome to HealthBridge</h2>
                        <div id="loginForm">
                            <div class="form-group"><label>Username</label><input type="text" id="loginUsername" placeholder="Enter username"></div>
                            <div class="form-group"><label>Password</label><input type="password" id="loginPassword" placeholder="Password"></div>
                            <div class="form-group"><label>Sign in as</label>
                                <select id="loginRole">
                                    <option value="community">User (Community)</option>
                                    <option value="clinic_admin">Clinic Administrator</option>
                                    <option value="healthbridge_admin">HealthBridge Administrator</option>
                                </select>
                            </div>
                            <button class="btn btn-primary" onclick="handleLogin()">Login</button>
                            <div class="switch-link">Don't have an account? <a onclick="showAuthScreen(false)">Register</a></div>
                            <div id="loginError" class="error-msg"></div>
                        </div>
                    </div>
                </div>
            \`;
        } else {
            app.innerHTML = \`
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
                            <button class="btn btn-primary" onclick="handleRegister()">Register</button>
                            <div class="switch-link">Already have an account? <a onclick="showAuthScreen(true)">Login</a></div>
                            <div id="registerError" class="error-msg"></div>
                        </div>
                    </div>
                </div>
            \`;
        }
    }

    window.handleLogin = async function() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const role = document.getElementById('loginRole').value;
        
        try {
            const res = await fetch(API_URL + '/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            renderRoleDashboard();
        } catch (err) {
            document.getElementById('loginError').innerText = err.message;
        }
    };

    window.handleRegister = async function() {
        const fullName = document.getElementById('regFullName').value;
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;
        
        if (!username || !password || !fullName) {
            document.getElementById('registerError').innerText = 'Please fill all fields';
            return;
        }

        try {
            const res = await fetch(API_URL + '/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, username, email, phone, password, role })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            alert('Registration successful! Please login.');
            showAuthScreen(true);
        } catch (err) {
            document.getElementById('registerError').innerText = err.message;
        }
    };

    async function loadData() {
        if (!currentUser) return;
        try {
            const resC = await fetch(API_URL + '/clinics', { headers: getHeaders() });
            clinicsData = await resC.json();
            
            const resA = await fetch(API_URL + '/articles', { headers: getHeaders() });
            articles = await resA.json();
        } catch(e) { console.error("Error fetching data", e); }
    }

    async function renderRoleDashboard() {
        if (!currentUser) { showAuthScreen(true); return; }
        
        await loadData();
        
        const role = currentUser.role;
        const app = document.getElementById('app');
        // Build navbar
        let navbarHtml = \`
            <nav class="navbar">
                <div class="nav-container">
                    <div class="logo">🏥 Health<span>Bridge</span></div>
                    <div class="nav-links">
                        \${role === 'community' ? '<button id="navHomeBtn">Home</button><button id="navSearchBtn">Find Clinics</button><button id="navArticlesBtn">Health Articles</button>' : ''}
                        \${role === 'clinic_admin' ? '<button id="navClinicAdminBtn">My Clinic Panel</button>' : ''}
                        \${role === 'healthbridge_admin' ? '<button id="navAdminBtn">Admin Panel</button>' : ''}
                        <button id="logoutBtn">Logout</button>
                    </div>
                </div>
            </nav>
            <main id="dashboardContent"></main>
            <footer>© 2025 HealthBridge – Privacy-first health locator</footer>
        \`;
        app.innerHTML = navbarHtml;
        
        setTimeout(() => {
            if (role === 'community') {
                document.getElementById('navHomeBtn')?.addEventListener('click', () => renderCommunityHome());
                document.getElementById('navSearchBtn')?.addEventListener('click', () => renderSearchMapPage());
                document.getElementById('navArticlesBtn')?.addEventListener('click', () => renderArticlesPage());
                renderCommunityHome();
            } else if (role === 'clinic_admin') {
                document.getElementById('navClinicAdminBtn')?.addEventListener('click', () => renderClinicAdminPanel());
                renderClinicAdminPanel();
            } else if (role === 'healthbridge_admin') {
                document.getElementById('navAdminBtn')?.addEventListener('click', () => renderHealthBridgeAdmin());
                renderHealthBridgeAdmin();
            }
            document.getElementById('logoutBtn')?.addEventListener('click', () => {
                currentUser = null;
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                showAuthScreen(true);
            });
        }, 10);
    }

    // ----- COMMUNITY DASHBOARD -----
    function renderCommunityHome() {
        const content = document.getElementById('dashboardContent');
        const featured = clinicsData.filter(c => c.verified && !c.sensitive).slice(0,6);
        const safeArticles = articles.filter(a => !a.sensitive);
        content.innerHTML = \`
            <div class="container">
                <div class="hero">
                    <h1>🏥 Find Safe, Verified Health Services</h1>
                    <div class="search-box">
                        <input type="text" id="homeLocation" placeholder="District (e.g., Mbarara)">
                        <select id="homeService"><option value="">All Services</option><option>Maternity</option><option>General Consultation</option><option>Pharmacy</option><option>HIV/AIDS</option><option>Mental Health</option><option>STD Testing</option></select>
                        <button onclick="quickSearch()">🔍 Search</button>
                        <button class="location-btn" onclick="useMyLocation()">📍 Near Me</button>
                    </div>
                    <div class="privacy-note">🔒 Sensitive searches (HIV, Mental health, STDs) are never logged & results are shown only after consent.</div>
                </div>
                <div id="homeResults"></div>
                <h2>📌 Featured Clinics</h2>
                <div id="featuredClinics" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px;"></div>
                <h2>📰 Health Articles</h2>
                <div id="articleList" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px;"></div>
            </div>
        \`;
        document.getElementById('featuredClinics').innerHTML = featured.map(c => clinicCardHtml(c)).join('');
        document.getElementById('articleList').innerHTML = safeArticles.map(a => \`<div class="clinic-card"><h3>\${a.title}</h3><p>\${a.content.substring(0,100)}</p></div>\`).join('');
        window.quickSearch = quickSearch;
        window.useMyLocation = useMyLocation;
    }

    function clinicCardHtml(c) {
        return \`<div class="clinic-card" onclick="viewClinicDetails(\${c.id})">
            <div class="clinic-name">\${c.name} \${c.verified ? '<span class="verified">✓ Verified</span>' : ''}</div>
            <div>📍 \${c.district} · \${c.parish}</div>
            <div class="services">\${(c.services||[]).map(s => \`<span class="service-tag">\${s}</span>\`).join('')}</div>
            <div class="hours">🕒 \${c.opening} – \${c.closing}</div>
            <button class="btn-sm">View Details</button>
        </div>\`;
    }

    async function quickSearch() {
        let location = document.getElementById('homeLocation')?.value.trim() || '';
        let service = document.getElementById('homeService')?.value || '';
        let results = clinicsData.filter(c => !c.sensitive);
        if (location) results = results.filter(c => c.district.toLowerCase().includes(location.toLowerCase()));
        if (service) results = results.filter(c => (c.services||[]).includes(service));
        let sensitiveTerms = ["hiv","aids","mental","std","sexually","depression"];
        let isSensitive = sensitiveTerms.some(term => \`\${location} \${service}\`.toLowerCase().includes(term));
        if (isSensitive && !confirm("⚠️ You are searching for sensitive health services. HealthBridge will NOT store this search. Continue?")) {
            document.getElementById('homeResults').innerHTML = \`<div class="privacy-note">Search cancelled for privacy reasons.</div>\`;
            return;
        }
        if (service === "Mental Health") results = [...results, ...clinicsData.filter(c => (c.services||[]).includes("Mental Health"))];
        if (service === "STD Testing") results = [...results, ...clinicsData.filter(c => (c.services||[]).includes("STD Testing"))];
        results = [...new Map(results.map(c => [c.id, c])).values()];
        document.getElementById('homeResults').innerHTML = \`<h3>Search Results (\${results.length})</h3><div style="display:grid; gap:15px;">\${results.map(c => clinicCardHtml(c)).join('')}</div>\`;
    }

    function useMyLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                let nearest = clinicsData.map(c => ({...c, dist: Math.hypot(c.lat-pos.coords.latitude, c.lng-pos.coords.longitude)})).sort((a,b)=>a.dist-b.dist).slice(0,8);
                document.getElementById('homeResults').innerHTML = \`<h3>Clinics near you</h3><div style="display:grid; gap:15px;">\${nearest.map(c => clinicCardHtml(c)).join('')}</div>\`;
            });
        } else alert("Geolocation not supported");
    }

    function renderSearchMapPage() {
        const content = document.getElementById('dashboardContent');
        content.innerHTML = \`
            <div class="container">
                <div class="filters">
                    <div class="filter-group"><label>📍 District</label><input type="text" id="filterDistrict" placeholder="e.g., Kampala"></div>
                    <div class="filter-group"><label>🏥 Service</label><select id="filterService"><option value="">All</option><option>Maternity</option><option>General Consultation</option><option>Pharmacy</option><option>HIV/AIDS</option><option>Mental Health</option><option>STD Testing</option></select></div>
                    <div class="filter-group"><label>💊 Medicine</label><input type="text" id="filterMedicine" placeholder="e.g., Amoxicillin"></div>
                    <button class="btn-sm" onclick="applyMapFilters()">🔍 Filter</button>
                    <button class="location-btn" onclick="useMyLocationMap()">📍 My Location</button>
                </div>
                <div class="results-layout">
                    <div id="mapView" class="map-container"></div>
                    <div id="listView" class="list-container">Loading map...</div>
                </div>
            </div>
        \`;
        setTimeout(() => initMap(), 100);
        window.applyMapFilters = applyMapFilters;
        window.useMyLocationMap = useMyLocationMap;
    }

    function initMap() {
        if (currentMapInstance) currentMapInstance.remove();
        currentMapInstance = L.map('mapView').setView([0.3136, 32.5811], 7);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        }).addTo(currentMapInstance);
        applyMapFilters();
    }

    function applyMapFilters() {
        const district = document.getElementById('filterDistrict')?.value.trim() || '';
        const service = document.getElementById('filterService')?.value || '';
        const medicine = document.getElementById('filterMedicine')?.value.trim() || '';
        let filtered = clinicsData.filter(c => !c.sensitive);
        if (district) filtered = filtered.filter(c => c.district.toLowerCase().includes(district.toLowerCase()));
        if (service) filtered = filtered.filter(c => (c.services||[]).includes(service));
        if (medicine) filtered = filtered.filter(c => (c.medicines||[]).some(m => m.toLowerCase().includes(medicine.toLowerCase())));
        updateMapAndList(filtered);
    }

    function updateMapAndList(clinicsArray) {
        if (!currentMapInstance) return;
        currentMarkers.forEach(m => currentMapInstance.removeLayer(m));
        currentMarkers = [];
        const bounds = [];
        clinicsArray.forEach(c => {
            const marker = L.marker([c.lat, c.lng]).addTo(currentMapInstance);
            marker.bindPopup(\`<b>\${c.name}</b><br>\${c.district}<br>🕒 \${c.opening} - \${c.closing}<br><button onclick="viewClinicDetails(\${c.id})">Details</button>\`);
            currentMarkers.push(marker);
            bounds.push([c.lat, c.lng]);
        });
        if (bounds.length) currentMapInstance.fitBounds(bounds);
        else currentMapInstance.setView([0.3136, 32.5811], 6);
        const listDiv = document.getElementById('listView');
        if (clinicsArray.length === 0) listDiv.innerHTML = '<div style="padding:20px;">No clinics found.</div>';
        else listDiv.innerHTML = clinicsArray.map(c => clinicCardHtml(c)).join('');
    }

    function useMyLocationMap() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                currentMapInstance.setView([pos.coords.latitude, pos.coords.longitude], 12);
                let nearest = clinicsData.map(c => ({...c, dist: Math.hypot(c.lat-pos.coords.latitude, c.lng-pos.coords.longitude)})).sort((a,b)=>a.dist-b.dist).slice(0,8);
                updateMapAndList(nearest);
            });
        }
    }

    function renderArticlesPage() {
        const content = document.getElementById('dashboardContent');
        const safeArts = articles.filter(a => !a.sensitive);
        content.innerHTML = \`<div class="container"><h2>📚 Health Education</h2><div style="display:grid; gap:20px;">\${safeArts.map(a => \`<div class="clinic-card"><h3>\${a.title}</h3><p>\${a.content}</p></div>\`).join('')}</div></div>\`;
    }

    // ----- CLINIC ADMIN PANEL -----
    function renderClinicAdminPanel() {
        const myClinic = clinicsData.find(c => c.id === currentUser.clinicId);
        if (!myClinic) {
            document.getElementById('dashboardContent').innerHTML = \`<div class="container"><p>No clinic assigned. Contact main admin.</p></div>\`;
            return;
        }
        const content = document.getElementById('dashboardContent');
        content.innerHTML = \`
            <div class="container">
                <h2>🏥 Clinic Admin: \${myClinic.name}</h2>
                <div class="admin-panel">
                    <div class="form-row">
                        <input type="text" id="clinicName" value="\${myClinic.name}" placeholder="Clinic Name">
                        <input type="text" id="clinicPhone" value="\${myClinic.phone}" placeholder="Phone">
                        <input type="text" id="clinicOpen" value="\${myClinic.opening}" placeholder="Opening Hour">
                        <input type="text" id="clinicClose" value="\${myClinic.closing}" placeholder="Closing Hour">
                    </div>
                    <div class="form-row">
                        <input type="text" id="newService" placeholder="Add new service (e.g., Dental)">
                        <button class="btn-sm" onclick="addClinicService()">➕ Add Service</button>
                    </div>
                    <div class="form-row">
                        <label>Update Medicine Stock:</label>
                        <select id="medicineSelect">\${(myClinic.medicines||[]).map(m => \`<option>\${m}</option>\`).join('')}</select>
                        <select id="stockStatus"><option>In Stock</option><option>Low Stock</option><option>Out of Stock</option></select>
                        <button class="btn-sm" onclick="updateStock()">Update Stock</button>
                    </div>
                    <button class="btn-sm" onclick="saveClinicChanges()">💾 Save All Changes</button>
                </div>
            </div>
        \`;
        window.currentClinic = myClinic;
        window.addClinicService = function() {
            let svc = document.getElementById('newService').value.trim();
            if (svc && window.currentClinic) {
                window.currentClinic.services.push(svc);
                alert(\`Service "\${svc}" added locally. Will be saved when you click Save All.\`);
            }
        };
        window.updateStock = async function() {
            const med = document.getElementById('medicineSelect').value;
            const stat = document.getElementById('stockStatus').value;
            try {
                await fetch(API_URL + '/clinics/' + window.currentClinic.id + '/stock', {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ medicineName: med, status: stat })
                });
                alert("Stock updated successfully");
            } catch(e) { alert("Failed to update stock"); }
        };
        window.saveClinicChanges = async function() {
            const name = document.getElementById('clinicName').value;
            const phone = document.getElementById('clinicPhone').value;
            const opening = document.getElementById('clinicOpen').value;
            const closing = document.getElementById('clinicClose').value;
            try {
                await fetch(API_URL + '/clinics/' + window.currentClinic.id, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify({ name, phone, opening, closing, services: window.currentClinic.services })
                });
                alert("Clinic information saved.");
                loadData();
            } catch(e) { alert("Failed to save changes"); }
        };
    }

    // ----- HEALTHBRIDGE ADMIN PANEL -----
    function renderHealthBridgeAdmin() {
        const content = document.getElementById('dashboardContent');
        content.innerHTML = \`
            <div class="container">
                <h2>⭐ HealthBridge Administrator</h2>
                <div class="admin-panel">
                    <p>Total clinics: \${clinicsData.length} | Verified: \${clinicsData.filter(c=>c.verified).length}</p>
                    <button class="btn-sm" onclick="showVerifyList()">✅ Verify Clinics</button>
                    <button class="btn-sm" onclick="generateReport()">📊 Generate Report</button>
                    <button class="btn-sm" onclick="manageArticlesAdmin()">📝 Manage Articles</button>
                </div>
                <div id="adminDynamicArea"></div>
            </div>
        \`;
        window.showVerifyList = function() {
            let unverified = clinicsData.filter(c => !c.verified);
            document.getElementById('adminDynamicArea').innerHTML = \`<h3>Pending Verification</h3>\${unverified.map(c => \`<div class="clinic-card">\${c.name} <button class="btn-sm" onclick="verifyClinic(\${c.id})">Verify</button></div>\`).join('')}\`;
        };
        window.verifyClinic = async function(id) {
            try {
                await fetch(API_URL + '/clinics/' + id + '/verify', { method: 'POST', headers: getHeaders() });
                await loadData();
                showVerifyList();
                document.querySelector('.admin-panel p').innerHTML = \`Total clinics: \${clinicsData.length} | Verified: \${clinicsData.filter(c=>c.verified).length}\`;
            } catch(e) { alert("Error verifying clinic"); }
        };
        window.generateReport = function() {
            let report = \`HEALTHBRIDGE REPORT\\nTotal clinics: \${clinicsData.length}\\nVerified: \${clinicsData.filter(c=>c.verified).length}\\nServices: \${[...new Set(clinicsData.flatMap(c=>c.services||[]))].join(", ")}\`;
            document.getElementById('adminDynamicArea').innerHTML = \`<pre style="background:white; padding:15px;">\${report}</pre>\`;
        };
        window.manageArticlesAdmin = function() {
            let list = articles.map((a)=>\`<div><b>\${a.title}</b> <button onclick="deleteArticle(\${a.id})">Delete</button></div>\`).join('');
            document.getElementById('adminDynamicArea').innerHTML = \`\${list}<hr><input id="newArtTitle" placeholder="Title"><textarea id="newArtContent" placeholder="Content"></textarea><button onclick="addArticle()">Add Article</button>\`;
        };
        window.deleteArticle = async function(id) {
            try {
                await fetch(API_URL + '/articles/' + id, { method: 'DELETE', headers: getHeaders() });
                await loadData();
                manageArticlesAdmin();
            } catch(e) {}
        };
        window.addArticle = async function() {
            let title = document.getElementById('newArtTitle')?.value;
            let content = document.getElementById('newArtContent')?.value;
            if(title && content) {
                try {
                    await fetch(API_URL + '/articles', {
                        method: 'POST', headers: getHeaders(),
                        body: JSON.stringify({ title, content, category: 'General', sensitive: false })
                    });
                    await loadData();
                    manageArticlesAdmin();
                } catch(e) {}
            }
        };
    }

    // Shared: clinic details modal
    window.viewClinicDetails = function(id) {
        const clinic = clinicsData.find(c => c.id === id);
        if (!clinic) return;
        let modalDiv = document.getElementById('globalModal');
        if (!modalDiv) {
            modalDiv = document.createElement('div');
            modalDiv.id = 'globalModal';
            modalDiv.className = 'modal';
            modalDiv.innerHTML = \`<div class="modal-content"><span style="float:right;font-size:28px;cursor:pointer;" onclick="closeModal()">&times;</span><div id="modalBody"></div></div>\`;
            document.body.appendChild(modalDiv);
        }
        document.getElementById('modalBody').innerHTML = \`<h2>\${clinic.name}</h2><p>📍 \${clinic.district}, \${clinic.parish}<br>📞 \${clinic.phone}<br>🕒 \${clinic.opening} – \${clinic.closing}<br>💊 Medicines: \${(clinic.medicines||[]).join(', ')}<br>🏥 Services: \${(clinic.services||[]).join(', ')}</p>\`;
        modalDiv.style.display = 'flex';
    };
    window.closeModal = function() {
        const modal = document.getElementById('globalModal');
        if (modal) modal.style.display = 'none';
    };

    // Start app
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser && localStorage.getItem('token')) {
        currentUser = JSON.parse(savedUser);
        renderRoleDashboard();
    } else {
        showAuthScreen(true);
    }
`;

const startIndex = html.indexOf('<script>');
const endIndex = html.indexOf('</script>') + '</script>'.length;

const newHtml = html.substring(0, startIndex + '<script>'.length) + '\\n' + newScript + '\\n' + html.substring(endIndex - '</script>'.length);

fs.writeFileSync(htmlPath, newHtml);
console.log('Successfully updated index.html');
