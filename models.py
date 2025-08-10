from tinydb import TinyDB, Query
from werkzeug.security import generate_password_hash, check_password_hash
import os

class BaseDB:
    """Base database class with common operations"""
    
    def __init__(self, table_name):
        self.db = TinyDB('hospital_data.json')
        self.table = self.db.table(table_name)
        self.query = Query()
    
    def get_all(self):
        """Get all records"""
        return self.table.all()
    
    def get_by_id(self, record_id):
        """Get record by ID"""
        result = self.table.get(self.query.id == record_id)
        return result
    
    def create(self, data):
        """Create new record"""
        # Generate ID if not provided
        if 'id' not in data:
            existing_ids = [item.get('id', 0) for item in self.table.all()]
            data['id'] = max(existing_ids, default=0) + 1
        
        self.table.insert(data)
        return data['id']
    
    def update(self, record_id, data):
        """Update record"""
        return self.table.update(data, self.query.id == record_id)
    
    def delete(self, record_id):
        """Delete record"""
        return self.table.remove(self.query.id == record_id)

class HospitalDB(BaseDB):
    """Hospital database operations"""
    
    def __init__(self):
        super().__init__('hospitals')
    
    def search(self, filters):
        """Search hospitals with filters"""
        results = self.table.all()
        
        if filters.get('name'):
            results = [h for h in results if filters['name'].lower() in h.get('name', '').lower()]
        
        if filters.get('location'):
            results = [h for h in results if filters['location'].lower() in h.get('location', '').lower()]
        
        if filters.get('disease_type'):
            results = [h for h in results if filters['disease_type'] in h.get('disease_types', [])]
        
        if filters.get('bed_type'):
            results = [h for h in results if filters['bed_type'] in h.get('bed_types', [])]
        
        if filters.get('min_rating'):
            try:
                min_rating = float(filters['min_rating'])
                results = [h for h in results if h.get('doctor_rating', 0) >= min_rating]
            except (ValueError, TypeError):
                pass
        
        if filters.get('max_fees'):
            try:
                max_fees = float(filters['max_fees'])
                results = [h for h in results if h.get('consultation_fee', 0) <= max_fees]
            except (ValueError, TypeError):
                pass
        
        return results

class BookingDB(BaseDB):
    """Booking database operations"""
    
    def __init__(self):
        super().__init__('bookings')
    
    def get_by_hospital(self, hospital_id):
        """Get bookings by hospital ID"""
        return self.table.search(self.query.hospital_id == hospital_id)
    
    def update_status(self, booking_id, status):
        """Update booking status"""
        return self.update(booking_id, {'status': status})

class AdminDB(BaseDB):
    """Admin user database operations"""
    
    def __init__(self):
        super().__init__('admins')
    
    def create_admin(self, username, password):
        """Create admin user with hashed password"""
        admin_data = {
            'username': username,
            'password_hash': generate_password_hash(password)
        }
        return self.create(admin_data)
    
    def authenticate(self, username, password):
        """Authenticate admin user"""
        admin = self.table.get(self.query.username == username)
        if admin and check_password_hash(admin['password_hash'], password):
            return admin
        return None
