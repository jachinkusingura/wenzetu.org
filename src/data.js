// src/data.js

// Mock Users Database
export function initUsers() {
    if (!localStorage.getItem('users')) {
        const users = [
            { id: 1, username: "community1", password: "pass123", role: "community", fullName: "John Doe", clinicId: null },
            { id: 2, username: "clinic_admin", password: "pass123", role: "clinic_admin", fullName: "Dr. Sarah", clinicId: 2 },
            { id: 3, username: "healthbridge_admin", password: "pass123", role: "healthbridge_admin", fullName: "Admin User", clinicId: null }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }
}

export function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

export function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Mock Clinics Data
let clinicsData = [
    { id: 1, name: "Ruharo Mission Hospital", lat: -0.6072, lng: 30.6545, district: "Mbarara", parish: "Ruharo", phone: "+256 700 123456", opening: "07:00", closing: "22:00", verified: true, services: ["Maternity", "General Consultation", "Pharmacy", "HIV/AIDS"], medicines: ["Amoxicillin", "Paracetamol", "Artemether"], assignedClinicAdminId: null },
    { id: 2, name: "TASO Mbarara", lat: -0.6100, lng: 30.6500, district: "Mbarara", parish: "Kamukuzi", phone: "+256 700 789012", opening: "08:00", closing: "17:00", verified: true, services: ["HIV/AIDS", "Pharmacy", "Counseling"], medicines: ["ARVs", "Paracetamol"], assignedClinicAdminId: 2 },
    { id: 3, name: "Good Samaritan Clinic", lat: -0.5950, lng: 30.6600, district: "Mbarara", parish: "Katete", phone: "+256 700 555666", opening: "09:00", closing: "18:00", verified: false, services: ["General Consultation", "Pharmacy"], medicines: ["Paracetamol", "Ibuprofen"], assignedClinicAdminId: null },
    { id: 4, name: "Kampala General Hospital", lat: 0.3136, lng: 32.5811, district: "Kampala", parish: "Central", phone: "+256 312 123456", opening: "00:00", closing: "23:59", verified: true, services: ["Maternity", "Dental", "Emergency"], medicines: ["Amoxicillin", "Ciprofloxacin"], assignedClinicAdminId: null },
    { id: 5, name: "Nsambya Hospital", lat: 0.2925, lng: 32.5850, district: "Kampala", parish: "Nsambya", phone: "+256 414 123456", opening: "07:30", closing: "21:00", verified: true, services: ["Maternity", "Paediatrics"], medicines: ["Paracetamol"], assignedClinicAdminId: null },
    { id: 6, name: "Gulu Regional Hospital", lat: 2.7750, lng: 32.2980, district: "Gulu", parish: "Gulu City", phone: "+256 471 432111", opening: "00:00", closing: "23:59", verified: true, services: ["General Consultation", "Surgery", "HIV/AIDS"], medicines: ["Artemether", "ARVs"], assignedClinicAdminId: null },
    { id: 7, name: "Lacor Hospital", lat: 2.7500, lng: 32.2800, district: "Gulu", parish: "Lacor", phone: "+256 392 123456", opening: "08:00", closing: "18:00", verified: true, services: ["Maternity", "Pharmacy"], medicines: ["Amoxicillin"], assignedClinicAdminId: null },
    { id: 8, name: "Jinja Regional Hospital", lat: 0.4346, lng: 33.2049, district: "Jinja", parish: "Jinja Central", phone: "+256 434 123456", opening: "07:00", closing: "22:00", verified: true, services: ["Maternity", "General Consultation"], medicines: ["Paracetamol", "Quinine"], assignedClinicAdminId: null },
    { id: 9, name: "Mental Health Center - Butabika", lat: 0.3333, lng: 32.6333, district: "Kampala", parish: "Butabika", phone: "+256 414 123789", opening: "08:00", closing: "17:00", verified: true, services: ["Mental Health", "Counseling"], medicines: ["Antidepressants", "Antipsychotics"], sensitive: true, assignedClinicAdminId: null },
    { id: 10, name: "STD Clinic - Mulago", lat: 0.3391, lng: 32.5765, district: "Kampala", parish: "Mulago", phone: "+256 414 123000", opening: "09:00", closing: "16:00", verified: true, services: ["STD Testing", "Treatment"], medicines: ["Antibiotics", "Antivirals"], sensitive: true, assignedClinicAdminId: null }
];

export function loadClinics() {
    const stored = localStorage.getItem('clinicsData');
    if (stored) {
        clinicsData = JSON.parse(stored);
    } else {
        saveClinics(clinicsData);
    }
}

export function saveClinics(data) {
    if (data) clinicsData = data;
    localStorage.setItem('clinicsData', JSON.stringify(clinicsData));
}

export function getClinics() {
    return clinicsData;
}

// Mock Articles
let articles = [
    { id: 1, title: "Malaria Prevention", category: "Prevention", content: "Sleep under nets, clear standing water.", sensitive: false },
    { id: 2, title: "Mental Health Awareness", category: "Mental Health", content: "It's okay to seek help. Call helpline 0800 123 456.", sensitive: true },
    { id: 3, title: "HIV Treatment & Support", category: "HIV", content: "ART is free at government facilities.", sensitive: true },
    { id: 4, title: "STD Prevention", category: "STD", content: "Use protection and get tested regularly.", sensitive: true }
];

export function getArticles() {
    return articles;
}

export function saveArticles(data) {
    articles = data;
}

// Current User State
export function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}
