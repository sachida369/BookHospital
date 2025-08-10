from werkzeug.security import generate_password_hash

def init_sample_data(hospital_db, admin_db):
    """Initialize sample data if databases are empty"""
    
    # Check if hospitals exist
    if not hospital_db.get_all():
        sample_hospitals = [
            {
                'id': 1,
                'name': 'City General Hospital',
                'location': 'Downtown',
                'address': '123 Main Street, Downtown',
                'phone': '+1-555-0101',
                'email': 'info@citygeneral.com',
                'website': 'www.citygeneral.com',
                'description': 'A leading multi-specialty hospital providing comprehensive healthcare services.',
                'doctor_rating': 4.5,
                'success_rate': 95.2,
                'consultation_fee': 150,
                'disease_types': ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine'],
                'bed_types': ['ICU', 'General', 'Private'],
                'available_beds': {'ICU': 5, 'General': 20, 'Private': 10},
                'facilities': ['Emergency Care', 'ICU', 'Laboratory', 'Pharmacy', 'Radiology', 'Surgery'],
                'image_url': 'https://via.placeholder.com/400x250/007bff/ffffff?text=City+General+Hospital'
            },
            {
                'id': 2,
                'name': 'Metropolitan Medical Center',
                'location': 'Midtown',
                'address': '456 Oak Avenue, Midtown',
                'phone': '+1-555-0102',
                'email': 'contact@metromedical.com',
                'website': 'www.metromedical.com',
                'description': 'Advanced medical center specializing in critical care and emergency services.',
                'doctor_rating': 4.7,
                'success_rate': 97.1,
                'consultation_fee': 200,
                'disease_types': ['Emergency Medicine', 'Trauma Care', 'Intensive Care', 'Cardiology'],
                'bed_types': ['ICU', 'General', 'Private'],
                'available_beds': {'ICU': 8, 'General': 15, 'Private': 12},
                'facilities': ['24/7 Emergency', 'Trauma Center', 'ICU', 'Laboratory', 'Blood Bank', 'Surgery'],
                'image_url': 'https://via.placeholder.com/400x250/28a745/ffffff?text=Metro+Medical+Center'
            },
            {
                'id': 3,
                'name': 'Sunshine Children\'s Hospital',
                'location': 'Westside',
                'address': '789 Pine Street, Westside',
                'phone': '+1-555-0103',
                'email': 'info@sunshinechildren.com',
                'website': 'www.sunshinechildren.com',
                'description': 'Specialized pediatric hospital with child-friendly environment and expert pediatric care.',
                'doctor_rating': 4.8,
                'success_rate': 98.5,
                'consultation_fee': 125,
                'disease_types': ['Pediatrics', 'Neonatology', 'Pediatric Surgery', 'Child Psychology'],
                'bed_types': ['ICU', 'General', 'Private'],
                'available_beds': {'ICU': 3, 'General': 25, 'Private': 15},
                'facilities': ['Pediatric ICU', 'Neonatal Unit', 'Play Therapy', 'Child Psychology', 'Laboratory'],
                'image_url': 'https://via.placeholder.com/400x250/ffc107/000000?text=Sunshine+Children+Hospital'
            },
            {
                'id': 4,
                'name': 'Advanced Heart Institute',
                'location': 'Eastside',
                'address': '321 Cedar Lane, Eastside',
                'phone': '+1-555-0104',
                'email': 'heart@advancedheart.com',
                'website': 'www.advancedheart.com',
                'description': 'Premier cardiac care facility with state-of-the-art cardiac surgery and intervention capabilities.',
                'doctor_rating': 4.9,
                'success_rate': 99.1,
                'consultation_fee': 300,
                'disease_types': ['Cardiology', 'Cardiac Surgery', 'Interventional Cardiology', 'Heart Transplant'],
                'bed_types': ['ICU', 'Private'],
                'available_beds': {'ICU': 10, 'Private': 20},
                'facilities': ['Cardiac Cath Lab', 'Heart Surgery', 'Cardiac ICU', 'Rehabilitation', 'Emergency Care'],
                'image_url': 'https://via.placeholder.com/400x250/dc3545/ffffff?text=Advanced+Heart+Institute'
            },
            {
                'id': 5,
                'name': 'Greenwood Community Hospital',
                'location': 'Suburbs',
                'address': '654 Maple Drive, Suburbs',
                'phone': '+1-555-0105',
                'email': 'info@greenwood.com',
                'website': 'www.greenwood.com',
                'description': 'Community-focused hospital providing quality healthcare with a personal touch.',
                'doctor_rating': 4.3,
                'success_rate': 94.8,
                'consultation_fee': 100,
                'disease_types': ['Family Medicine', 'Internal Medicine', 'Obstetrics', 'General Surgery'],
                'bed_types': ['General', 'Private'],
                'available_beds': {'General': 30, 'Private': 8},
                'facilities': ['Maternity Ward', 'Laboratory', 'Pharmacy', 'Radiology', 'Physical Therapy'],
                'image_url': 'https://via.placeholder.com/400x250/6c757d/ffffff?text=Greenwood+Community'
            },
            {
                'id': 6,
                'name': 'University Medical Hospital',
                'location': 'University District',
                'address': '987 College Boulevard, University District',
                'phone': '+1-555-0106',
                'email': 'contact@unimedical.edu',
                'website': 'www.unimedical.edu',
                'description': 'Teaching hospital affiliated with the university, offering cutting-edge medical research and treatment.',
                'doctor_rating': 4.6,
                'success_rate': 96.7,
                'consultation_fee': 175,
                'disease_types': ['Research Medicine', 'Oncology', 'Neurology', 'Transplant Medicine'],
                'bed_types': ['ICU', 'General', 'Private'],
                'available_beds': {'ICU': 12, 'General': 40, 'Private': 18},
                'facilities': ['Research Center', 'Cancer Treatment', 'Transplant Unit', 'Medical Education', 'Advanced Imaging'],
                'image_url': 'https://via.placeholder.com/400x250/6f42c1/ffffff?text=University+Medical'
            }
        ]
        
        for hospital in sample_hospitals:
            hospital_db.create(hospital)
    
    # Check if admin users exist
    if not admin_db.get_all():
        admin_db.create_admin('admin', 'admin123')

def get_filtered_hospitals(hospitals, filters):
    """Apply filters to hospital list"""
    filtered = hospitals.copy()
    
    # Name filter
    if filters.get('name'):
        name_query = filters['name'].lower()
        filtered = [h for h in filtered if name_query in h.get('name', '').lower()]
    
    # Location filter
    if filters.get('location'):
        location_query = filters['location'].lower()
        filtered = [h for h in filtered if location_query in h.get('location', '').lower()]
    
    # Disease type filter
    if filters.get('disease_type'):
        disease_type = filters['disease_type']
        filtered = [h for h in filtered if disease_type in h.get('disease_types', [])]
    
    # Bed type filter
    if filters.get('bed_type'):
        bed_type = filters['bed_type']
        filtered = [h for h in filtered if bed_type in h.get('bed_types', [])]
    
    # Minimum rating filter
    if filters.get('min_rating'):
        try:
            min_rating = float(filters['min_rating'])
            filtered = [h for h in filtered if h.get('doctor_rating', 0) >= min_rating]
        except (ValueError, TypeError):
            pass
    
    # Maximum fees filter
    if filters.get('max_fees'):
        try:
            max_fees = float(filters['max_fees'])
            filtered = [h for h in filtered if h.get('consultation_fee', 0) <= max_fees]
        except (ValueError, TypeError):
            pass
    
    # Facilities filter
    if filters.get('facilities'):
        facilities = filters.getlist('facilities') if hasattr(filters, 'getlist') else [filters.get('facilities')]
        for facility in facilities:
            if facility:
                filtered = [h for h in filtered if facility in h.get('facilities', [])]
    
    return filtered
