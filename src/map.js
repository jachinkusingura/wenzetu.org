// src/map.js
import { getClinics } from './data.js';

let currentMapInstance = null;
let currentMarkers = [];

export function renderSearchMapPage(contentElement, viewClinicDetails) {
    contentElement.innerHTML = `
        <div class="container">
            <div class="filters">
                <div class="filter-group">
                    <label>📍 District</label>
                    <input type="text" id="filterDistrict" placeholder="e.g., Kampala">
                </div>
                <div class="filter-group">
                    <label>🏥 Service</label>
                    <select id="filterService">
                        <option value="">All</option>
                        <option>Maternity</option>
                        <option>General Consultation</option>
                        <option>Pharmacy</option>
                        <option>HIV/AIDS</option>
                        <option>Mental Health</option>
                        <option>STD Testing</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>💊 Medicine</label>
                    <input type="text" id="filterMedicine" placeholder="e.g., Amoxicillin">
                </div>
                <button class="btn-sm" id="applyFiltersBtn">🔍 Filter</button>
                <button class="btn-sm location-btn" id="myLocationBtn">📍 My Location</button>
            </div>
            <div class="results-layout">
                <div id="mapView" class="map-container"></div>
                <div id="listView" class="list-container">Loading map...</div>
            </div>
        </div>
    `;

    document.getElementById('applyFiltersBtn').addEventListener('click', () => applyMapFilters(viewClinicDetails));
    document.getElementById('myLocationBtn').addEventListener('click', () => useMyLocationMap(viewClinicDetails));

    // Wait a brief moment for DOM to paint before initializing Leaflet
    setTimeout(() => initMap(viewClinicDetails), 100);
}

function initMap(viewClinicDetails) {
    if (currentMapInstance) {
        currentMapInstance.remove();
    }
    
    // Check if L (Leaflet) is available globally
    if (typeof L === 'undefined') {
        document.getElementById('listView').innerHTML = '<div class="error-msg">Map library not loaded. Check internet connection.</div>';
        return;
    }

    currentMapInstance = L.map('mapView').setView([0.3136, 32.5811], 7);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    }).addTo(currentMapInstance);
    
    applyMapFilters(viewClinicDetails);
}

export function applyMapFilters(viewClinicDetails) {
    const district = document.getElementById('filterDistrict')?.value.trim() || '';
    const service = document.getElementById('filterService')?.value || '';
    const medicine = document.getElementById('filterMedicine')?.value.trim() || '';
    
    let filtered = getClinics().filter(c => !c.sensitive);
    
    if (district) filtered = filtered.filter(c => c.district.toLowerCase().includes(district.toLowerCase()));
    if (service) filtered = filtered.filter(c => c.services.includes(service));
    if (medicine) filtered = filtered.filter(c => c.medicines.some(m => m.toLowerCase().includes(medicine.toLowerCase())));
    
    updateMapAndList(filtered, viewClinicDetails);
}

function updateMapAndList(clinicsArray, viewClinicDetails) {
    if (!currentMapInstance) return;
    
    currentMarkers.forEach(m => currentMapInstance.removeLayer(m));
    currentMarkers = [];
    const bounds = [];
    
    clinicsArray.forEach(c => {
        const marker = L.marker([c.lat, c.lng]).addTo(currentMapInstance);
        
        // Setup popup content
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `<b>${c.name}</b><br>${c.district}<br>🕒 ${c.opening} - ${c.closing}<br>`;
        const btn = document.createElement('button');
        btn.innerText = 'Details';
        btn.className = 'btn-sm';
        btn.style.marginTop = '5px';
        btn.onclick = () => viewClinicDetails(c.id);
        popupContent.appendChild(btn);

        marker.bindPopup(popupContent);
        currentMarkers.push(marker);
        bounds.push([c.lat, c.lng]);
    });
    
    if (bounds.length) {
        currentMapInstance.fitBounds(bounds);
    } else {
        currentMapInstance.setView([0.3136, 32.5811], 6);
    }
    
    const listDiv = document.getElementById('listView');
    if (clinicsArray.length === 0) {
        listDiv.innerHTML = '<div style="padding:20px;">No clinics found matching your criteria.</div>';
    } else {
        // Need to render the clinic cards. 
        // We'll map them and set the onclick in the dashboard or passing it here.
        listDiv.innerHTML = '';
        clinicsArray.forEach(c => {
            const card = document.createElement('div');
            card.className = 'clinic-card';
            card.onclick = () => viewClinicDetails(c.id);
            card.innerHTML = `
                <div class="clinic-name">${c.name} ${c.verified ? '<span class="verified">✓ Verified</span>' : ''}</div>
                <div>📍 ${c.district} · ${c.parish}</div>
                <div class="services">${c.services.map(s => `<span class="service-tag">${s}</span>`).join('')}</div>
                <div class="hours">🕒 ${c.opening} – ${c.closing}</div>
                <button class="btn-sm mt-4">View Details</button>
            `;
            listDiv.appendChild(card);
        });
    }
}

function useMyLocationMap(viewClinicDetails) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            if (!currentMapInstance) return;
            currentMapInstance.setView([pos.coords.latitude, pos.coords.longitude], 12);
            
            let nearest = getClinics()
                .filter(c => !c.sensitive)
                .map(c => ({...c, dist: Math.hypot(c.lat-pos.coords.latitude, c.lng-pos.coords.longitude)}))
                .sort((a,b) => a.dist - b.dist)
                .slice(0, 8);
                
            updateMapAndList(nearest, viewClinicDetails);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
