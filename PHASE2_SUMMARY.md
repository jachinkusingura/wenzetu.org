# Phase 2: Advanced Clinic Search with GIS & Quick Booking

## Overview
Phase 2 adds a powerful clinic discovery experience with geospatial search, advanced filtering, interactive maps, and quick appointment booking directly from search results.

## Database Updates

### PostgreSQL with PostGIS
- Added PostGIS extension for geospatial queries
- New `location` GEOGRAPHY column in clinics table with GIST index
- Support for distance-based searches and radius filtering
- New specialization_type ENUM for medical specialties

### MySQL with Spatial Support
- Added `location` POINT column with SPATIAL index in clinics table
- ST_Distance_Sphere for distance calculations
- Full compatibility with geospatial queries

### New Tables Created (Both Databases)

1. **specializations** - Medical specialization catalog
   - cardiology, neurology, orthopedics, pediatrics, dermatology, psychiatry, urology, oncology, general_practice, surgery

2. **doctors** - Doctor profiles linked to clinics
   - license_number, years_experience, bio, availability, ratings

3. **doctor_specializations** - Junction table for doctor specialties (many-to-many)

4. **clinic_service_specializations** - Link services to specializations

5. **service_medicines** - Link services to medications (many-to-many)

## Backend Implementation

### New Endpoints

#### Search APIs
- `GET /api/search/clinics` - Search with advanced filters
  - Query params: latitude, longitude, radius (km), specialization_id, medicine_id, service_name, rating_min
  - Returns: Clinic list with distance calculated from user location
  - Uses: PostGIS for PostgreSQL, ST_Distance_Sphere for MySQL

- `GET /api/search/doctors` - Fetch doctors by clinic or specialization
  - Query params: clinic_id, specialization_id, limit, offset
  - Returns: Doctor profiles with specializations

- `GET /api/search/specializations` - Get all available specializations
  - Returns: Specialization catalog

- `GET /api/search/clinic/:clinicId/services` - Fetch services for a clinic
  - Returns: Service list with pricing and duration

#### Booking API
- `POST /api/search/quick-book` - Book appointment from search
  - Body: clinic_id, service_id, appointment_date, appointment_time
  - Returns: Appointment confirmation
  - Requires: Authentication token

### Search Controller Features
- Dual database support (PostgreSQL & MySQL with automatic detection)
- Geospatial distance calculation
- Multi-filter support (location radius, specialization, service, rating, medications)
- Efficient GIS queries with proper indexing

## Frontend Implementation

### New Components

1. **SearchView** - Main search interface
   - Dual view toggle (Map & List)
   - Interactive Leaflet map with clinic markers
   - Real-time filtering
   - Geolocation integration
   - 206 lines, fully responsive

2. **FilterSidebar** - Advanced filtering panel
   - Distance radius slider (1-50 km)
   - Service search autocomplete
   - Specialization dropdown
   - Minimum rating filter
   - Reset filters button

3. **ClinicCard** - Clinic listing component
   - Clinic image, name, and description
   - Address and phone info
   - Distance badge
   - Rating display
   - Quick book trigger

4. **QuickBookModal** - Appointment booking form
   - Service selection
   - Date & time picker
   - User info display
   - Booking confirmation
   - Error handling with retry

### Leaflet Map Integration
- Interactive clinic markers
- User location marker (with geolocation)
- Popup on marker click with clinic info
- Quick book button in popup
- Responsive map sizing
- Works on mobile and desktop

### Search Service
- `searchClinics()` - Advanced filtering with distance calculation
- `getDoctors()` - Fetch doctors with specializations
- `getSpecializations()` - Get specialization catalog
- `quickBook()` - Create appointment from search
- `getCurrentLocation()` - Browser geolocation
- `calculateDistance()` - Haversine formula for distance between coordinates

### Styling & UX
- 567 lines of custom CSS for search interface
- Purple gradient theme matching design system
- Responsive grid layouts (mobile-first)
- Smooth animations and transitions
- Accessible form inputs and modals
- Loading states and error messages

## Features Implemented

### Search & Discovery
- Location-based clinic discovery (geospatial)
- Distance radius filtering (1-50 km)
- Search by service name
- Filter by doctor specialization
- Filter by medications
- Minimum rating filter
- Verified clinic badge support

### Map & List Views
- Interactive Leaflet map with markers
- Clinic card list view
- Toggle between views
- Distance shown on both views
- Real-time search updates

### Quick Booking
- Service selection from clinic's offerings
- Date picker (future dates only)
- Time picker
- One-click booking from search results
- User info pre-filled for logged-in users
- Confirmation message with redirect

### Advanced Filtering
- Persistent filter state
- Easy reset to defaults
- Mobile-friendly sidebar
- Autocomplete service search

## Types & Interfaces

### Backend Types
```typescript
interface SearchFilters {
  latitude?: number;
  longitude?: number;
  radius?: number;
  specialization_id?: number;
  medicine_id?: number;
  service_name?: string;
  rating_min?: number;
}

interface Doctor {
  id: number;
  license_number: string;
  years_experience?: number;
  bio?: string;
  is_available: boolean;
  average_rating: number;
  total_reviews: number;
  specializations?: Specialization[];
}

interface SearchResult {
  clinic: Clinic;
  doctors: Doctor[];
  services: Service[];
  distance?: number;
}
```

### Frontend Types
- Clinic with distance
- Doctor with specializations
- Specialization type enum
- Search filters interface
- Quick book request interface

## Database Queries

### PostgreSQL Examples
```sql
-- Search clinics by location with distance
SELECT c.*, 
  ST_Distance(c.location, ST_Point(lon, lat)::geography) / 1000 as distance
FROM clinics c
WHERE ST_DWithin(c.location, ST_Point(lon, lat)::geography, radius * 1000)
AND c.is_verified = true
ORDER BY distance ASC;

-- Find doctors with specializations
SELECT d.*, json_agg(s.*) as specializations
FROM doctors d
LEFT JOIN doctor_specializations ds ON d.id = ds.doctor_id
LEFT JOIN specializations s ON ds.specialization_id = s.id
GROUP BY d.id;
```

### MySQL Examples
```sql
-- Search clinics by location
SELECT c*,
  ST_Distance_Sphere(location, ST_Point(lon, lat)) / 1000 as distance
FROM clinics c
WHERE ST_Distance_Sphere(c.location, ST_Point(lon, lat)) / 1000 <= radius;
```

## Files Created

### Backend
- `server/src/controllers/searchController.ts` - 337 lines
- `server/src/routes/searchRoutes.ts` - 45 lines
- `server/src/database/schemas/postgres-schema.sql` - Updated with PostGIS
- `server/src/database/schemas/mysql-schema.sql` - Updated with spatial index

### Frontend
- `client/src/views/shared/SearchView.tsx` - 206 lines
- `client/src/components/search/FilterSidebar.tsx` - 126 lines
- `client/src/components/search/ClinicCard.tsx` - 59 lines
- `client/src/components/search/QuickBookModal.tsx` - 156 lines
- `client/src/services/searchService.ts` - 114 lines
- `client/src/styles/search.css` - 567 lines
- `client/src/hooks/useAuth.ts` - 11 lines

### Updated Files
- `client/src/App.tsx` - Added search route
- `client/src/types/index.ts` - Added search types (55 lines)
- `server/src/types/index.ts` - Added search types (56 lines)
- `server/src/server.ts` - Added search routes mounting
- `client/src/views/shared/HomeView.tsx` - Added "Find Clinics" button
- `client/src/styles/globals.css` - Imported search styles

## API Response Examples

### Search Clinics Response
```json
[
  {
    "id": 1,
    "name": "City Heart Clinic",
    "address": "123 Medical Ave",
    "city": "New York",
    "latitude": 40.7128,
    "longitude": -74.006,
    "distance": 2.5,
    "rating": 4.8,
    "total_reviews": 156
  }
]
```

### Doctors Response
```json
[
  {
    "id": 1,
    "user_id": 5,
    "clinic_id": 1,
    "license_number": "LIC123456",
    "years_experience": 10,
    "bio": "Expert cardiologist...",
    "average_rating": 4.9,
    "total_reviews": 89,
    "specializations": [
      {"id": 1, "name": "Cardiology", "type": "cardiology"}
    ]
  }
]
```

### Quick Book Response
```json
{
  "id": 15,
  "patient_id": 3,
  "clinic_id": 1,
  "service_id": 5,
  "appointment_date": "2024-05-15",
  "appointment_time": "14:30",
  "status": "scheduled",
  "created_at": "2024-05-08T10:30:00Z"
}
```

## Next Steps (Phase 3)
- Clinic owner dashboard with appointment management
- Staff management and scheduling
- Medicine inventory tracking
- Analytics and reporting
- Reviews and ratings management
- Clinic profile customization

## Testing Checklist
- [ ] Search clinics with geolocation
- [ ] Filter by distance radius
- [ ] Filter by specialization
- [ ] Search by service name
- [ ] Map view with markers
- [ ] List view with distance
- [ ] Toggle views
- [ ] Quick book appointment
- [ ] Verify appointment in patient dashboard
- [ ] Test on mobile devices
- [ ] Test with both PostgreSQL and MySQL

## Performance Notes
- GIS indexes on location columns for fast distance queries
- Proper limit/offset pagination on search results
- Efficient junction table queries for specializations
- Client-side Haversine distance calculation as fallback
