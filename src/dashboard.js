// src/dashboard.js
import { getClinics, saveClinics, getArticles, saveArticles, getCurrentUser } from './data.js';

// ---- Shared Clinic Card HTML Generator ----
export function createClinicCard(c, onClick) {
    const card = document.createElement('div');
    card.className = 'clinic-card';
    card.onclick = () => onClick(c.id);
    card.innerHTML = `
        <div class="clinic-name">${c.name} ${c.verified ? '<span class="verified">✓ Verified</span>' : ''}</div>
        <div>📍 ${c.district} · ${c.parish}</div>
        <div class="services">${c.services.map(s => `<span class="service-tag">${s}</span>`).join('')}</div>
        <div class="hours">🕒 ${c.opening} – ${c.closing}</div>
        <button class="btn-sm mt-4">View Details</button>
    `;
    return card;
}

// ----- COMMUNITY DASHBOARD -----
export function renderCommunityHome(contentElement, viewClinicDetails, onQuickSearch, onMyLocation) {
    const featured = getClinics().filter(c => c.verified && !c.sensitive).slice(0, 6);
    const safeArticles = getArticles().filter(a => !a.sensitive);
    
    contentElement.innerHTML = `
        <div class="container">
            <div class="hero">
                <h1>🏥 Find Safe, Verified Health Services</h1>
                <div class="search-box">
                    <input type="text" id="homeLocation" placeholder="District (e.g., Mbarara)">
                    <select id="homeService">
                        <option value="">All Services</option>
                        <option>Maternity</option>
                        <option>General Consultation</option>
                        <option>Pharmacy</option>
                        <option>HIV/AIDS</option>
                        <option>Mental Health</option>
                        <option>STD Testing</option>
                    </select>
                    <button id="quickSearchBtn">🔍 Search</button>
                    <button class="location-btn" id="myLocBtn">📍 Near Me</button>
                </div>
                <div class="privacy-note">🔒 Sensitive searches (HIV, Mental health, STDs) are never logged & results are shown only after consent.</div>
            </div>
            
            <div id="homeResults"></div>
            
            <h2 class="mb-4">📌 Featured Clinics</h2>
            <div id="featuredClinics" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; margin-bottom: 40px;"></div>
            
            <h2 class="mb-4">📰 Health Articles</h2>
            <div id="articleList" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px;"></div>
        </div>
    `;

    const featuredDiv = document.getElementById('featuredClinics');
    featured.forEach(c => featuredDiv.appendChild(createClinicCard(c, viewClinicDetails)));

    const articleList = document.getElementById('articleList');
    safeArticles.forEach(a => {
        const div = document.createElement('div');
        div.className = 'clinic-card';
        div.innerHTML = `<h3>${a.title}</h3><p class="mt-4">${a.content.substring(0,100)}...</p>`;
        articleList.appendChild(div);
    });

    document.getElementById('quickSearchBtn').addEventListener('click', () => onQuickSearch(viewClinicDetails));
    document.getElementById('myLocBtn').addEventListener('click', () => onMyLocation(viewClinicDetails));
}

export function handleQuickSearch(viewClinicDetails) {
    let location = document.getElementById('homeLocation')?.value.trim() || '';
    let service = document.getElementById('homeService')?.value || '';
    
    let results = getClinics().filter(c => !c.sensitive);
    
    if (location) results = results.filter(c => c.district.toLowerCase().includes(location.toLowerCase()));
    if (service) results = results.filter(c => c.services.includes(service));
    
    let sensitiveTerms = ["hiv","aids","mental","std","sexually","depression"];
    let isSensitive = sensitiveTerms.some(term => `${location} ${service}`.toLowerCase().includes(term));
    
    if (isSensitive && !confirm("⚠️ You are searching for sensitive health services. HealthBridge will NOT store this search. Continue?")) {
        document.getElementById('homeResults').innerHTML = `<div class="privacy-note">Search cancelled for privacy reasons.</div>`;
        return;
    }
    
    // Add sensitive back if specifically searched
    if (service === "Mental Health") results = [...results, ...getClinics().filter(c => c.services.includes("Mental Health"))];
    if (service === "STD Testing") results = [...results, ...getClinics().filter(c => c.services.includes("STD Testing"))];
    
    // Deduplicate
    results = [...new Map(results.map(c => [c.id, c])).values()];
    
    const resultsDiv = document.getElementById('homeResults');
    resultsDiv.innerHTML = `<h3 class="mb-4">Search Results (${results.length})</h3>`;
    
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gap = '15px';
    grid.style.marginBottom = '40px';
    
    results.forEach(c => grid.appendChild(createClinicCard(c, viewClinicDetails)));
    resultsDiv.appendChild(grid);
}

export function handleMyLocation(viewClinicDetails) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            let nearest = getClinics()
                .filter(c => !c.sensitive)
                .map(c => ({...c, dist: Math.hypot(c.lat-pos.coords.latitude, c.lng-pos.coords.longitude)}))
                .sort((a,b)=>a.dist-b.dist)
                .slice(0,8);
                
            const resultsDiv = document.getElementById('homeResults');
            resultsDiv.innerHTML = `<h3 class="mb-4">Clinics near you</h3>`;
            
            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gap = '15px';
            grid.style.marginBottom = '40px';
            
            nearest.forEach(c => grid.appendChild(createClinicCard(c, viewClinicDetails)));
            resultsDiv.appendChild(grid);
        });
    } else {
        alert("Geolocation not supported by your browser");
    }
}

export function renderArticlesPage(contentElement) {
    const safeArts = getArticles().filter(a => !a.sensitive);
    contentElement.innerHTML = `
        <div class="container">
            <h2 class="mb-4">📚 Health Education</h2>
            <div style="display:grid; gap:20px; grid-template-columns:repeat(auto-fill,minmax(300px,1fr));">
                ${safeArts.map(a => `
                    <div class="clinic-card">
                        <h3>${a.title}</h3>
                        <p class="mt-4">${a.content}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ----- CLINIC ADMIN PANEL -----
export function renderClinicAdminPanel(contentElement) {
    const currentUser = getCurrentUser();
    const clinics = getClinics();
    const myClinic = clinics.find(c => c.id === currentUser.clinicId);
    
    if (!myClinic) {
        contentElement.innerHTML = `<div class="container"><p>No clinic assigned. Contact main admin.</p></div>`;
        return;
    }
    
    contentElement.innerHTML = `
        <div class="container">
            <h2>🏥 Clinic Admin: ${myClinic.name}</h2>
            <div class="admin-panel">
                <div class="form-row">
                    <input type="text" id="clinicName" value="${myClinic.name}" placeholder="Clinic Name">
                    <input type="text" id="clinicPhone" value="${myClinic.phone}" placeholder="Phone">
                    <input type="text" id="clinicOpen" value="${myClinic.opening}" placeholder="Opening Hour">
                    <input type="text" id="clinicClose" value="${myClinic.closing}" placeholder="Closing Hour">
                </div>
                <div class="form-row">
                    <input type="text" id="newService" placeholder="Add new service (e.g., Dental)">
                    <button class="btn-sm" id="addServiceBtn">➕ Add Service</button>
                </div>
                <div class="form-row" style="align-items: center;">
                    <label style="margin-right: 10px;">Update Medicine Stock:</label>
                    <select id="medicineSelect">
                        ${myClinic.medicines.map(m => `<option>${m}</option>`).join('')}
                    </select>
                    <select id="stockStatus">
                        <option>In Stock</option>
                        <option>Low Stock</option>
                        <option>Out of Stock</option>
                    </select>
                    <button class="btn-sm" id="updateStockBtn">Update Stock</button>
                </div>
                <button class="btn btn-primary mt-4" id="saveClinicBtn">💾 Save All Changes</button>
            </div>
        </div>
    `;

    document.getElementById('addServiceBtn').addEventListener('click', () => {
        let svc = document.getElementById('newService').value.trim();
        if (svc) {
            myClinic.services.push(svc);
            alert(`Service "${svc}" added. Don't forget to save changes.`);
            document.getElementById('newService').value = '';
        }
    });

    document.getElementById('updateStockBtn').addEventListener('click', () => {
        alert("Stock updated (demo). In real system this would persist to the database.");
    });

    document.getElementById('saveClinicBtn').addEventListener('click', () => {
        myClinic.name = document.getElementById('clinicName').value;
        myClinic.phone = document.getElementById('clinicPhone').value;
        myClinic.opening = document.getElementById('clinicOpen').value;
        myClinic.closing = document.getElementById('clinicClose').value;
        
        // update in main array
        const index = clinics.findIndex(c => c.id === myClinic.id);
        if (index !== -1) clinics[index] = myClinic;
        
        saveClinics(clinics);
        alert("Clinic information saved successfully.");
    });
}

// ----- HEALTHBRIDGE ADMIN PANEL -----
export function renderHealthBridgeAdmin(contentElement) {
    const clinics = getClinics();
    contentElement.innerHTML = `
        <div class="container">
            <h2>⭐ HealthBridge Administrator</h2>
            <div class="admin-panel">
                <p class="mb-4"><strong>Overview:</strong> Total clinics: ${clinics.length} | Verified: ${clinics.filter(c=>c.verified).length}</p>
                <div style="display:flex; gap: 15px; flex-wrap: wrap;">
                    <button class="btn-sm" id="verifyBtn">✅ Verify Clinics</button>
                    <button class="btn-sm" id="reportBtn">📊 Generate Report</button>
                    <button class="btn-sm" id="articlesBtn">📝 Manage Articles</button>
                </div>
            </div>
            <div id="adminDynamicArea" class="mt-4"></div>
        </div>
    `;

    document.getElementById('verifyBtn').addEventListener('click', () => showVerifyList());
    document.getElementById('reportBtn').addEventListener('click', () => generateReport());
    document.getElementById('articlesBtn').addEventListener('click', () => manageArticlesAdmin());
}

function showVerifyList() {
    const clinics = getClinics();
    let unverified = clinics.filter(c => !c.verified);
    const area = document.getElementById('adminDynamicArea');
    
    if (unverified.length === 0) {
        area.innerHTML = `<h3>Pending Verification</h3><p>All clinics are currently verified.</p>`;
        return;
    }

    area.innerHTML = `<h3 class="mb-4">Pending Verification</h3>`;
    unverified.forEach(c => {
        const div = document.createElement('div');
        div.className = 'clinic-card';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.innerHTML = `<span><strong>${c.name}</strong> - ${c.district}</span>`;
        
        const btn = document.createElement('button');
        btn.className = 'btn-sm';
        btn.innerText = 'Verify';
        btn.onclick = () => {
            c.verified = true;
            saveClinics(clinics);
            showVerifyList();
        };
        div.appendChild(btn);
        area.appendChild(div);
    });
}

function generateReport() {
    const clinics = getClinics();
    let report = `HEALTHBRIDGE SYSTEM REPORT\n`;
    report += `==========================\n`;
    report += `Total clinics registered: ${clinics.length}\n`;
    report += `Verified clinics: ${clinics.filter(c=>c.verified).length}\n`;
    report += `Pending verification: ${clinics.filter(c=>!c.verified).length}\n`;
    report += `\nAll Services Offered:\n`;
    report += `${[...new Set(clinics.flatMap(c=>c.services))].join(", ")}`;
    
    document.getElementById('adminDynamicArea').innerHTML = `
        <h3 class="mb-4">System Report</h3>
        <pre style="background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; white-space: pre-wrap;">${report}</pre>
    `;
}

function manageArticlesAdmin() {
    const articles = getArticles();
    const area = document.getElementById('adminDynamicArea');
    
    let html = `<h3 class="mb-4">Manage Articles</h3><div style="display:grid; gap: 15px; margin-bottom: 30px;">`;
    articles.forEach((a, i) => {
        html += `
            <div class="clinic-card" style="display:flex; justify-content:space-between; align-items:center;">
                <span><b>${a.title}</b> (${a.category})</span>
                <button class="btn-sm" style="background:#ef4444;" id="del-art-${i}">Delete</button>
            </div>`;
    });
    html += `</div>`;
    
    html += `
        <div class="admin-panel">
            <h4>Add New Article</h4>
            <div class="form-group"><input type="text" id="newArtTitle" placeholder="Article Title"></div>
            <div class="form-group"><input type="text" id="newArtCat" placeholder="Category"></div>
            <div class="form-group"><textarea id="newArtContent" placeholder="Article Content" rows="4"></textarea></div>
            <button class="btn-sm" id="addArtBtn">Add Article</button>
        </div>
    `;
    
    area.innerHTML = html;
    
    // Attach event listeners
    articles.forEach((a, i) => {
        document.getElementById(`del-art-${i}`)?.addEventListener('click', () => {
            articles.splice(i, 1);
            saveArticles(articles);
            manageArticlesAdmin();
        });
    });
    
    document.getElementById('addArtBtn')?.addEventListener('click', () => {
        let t = document.getElementById('newArtTitle').value.trim();
        let cat = document.getElementById('newArtCat').value.trim();
        let c = document.getElementById('newArtContent').value.trim();
        
        if (t && c) {
            articles.push({
                id: Date.now(), 
                title: t, 
                content: c, 
                category: cat || "General", 
                sensitive: false
            });
            saveArticles(articles);
            manageArticlesAdmin();
        } else {
            alert('Title and content are required.');
        }
    });
}
