import os
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, SelectField, TextAreaField, FloatField
from wtforms.validators import DataRequired, Email, NumberRange, Length
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'hospital-finder-secret-key-2025')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hospital_finder.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class Hospital(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    address = db.Column(db.Text, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    website = db.Column(db.String(200))
    description = db.Column(db.Text, nullable=False)
    specialties = db.Column(db.Text, nullable=False)  # JSON string
    bed_types = db.Column(db.Text, nullable=False)    # JSON string
    available_beds = db.Column(db.Text, nullable=False)  # JSON string
    doctor_rating = db.Column(db.Float, nullable=False)
    success_rate = db.Column(db.Float, nullable=False)
    consultation_fee = db.Column(db.Integer, nullable=False)
    facilities = db.Column(db.Text, nullable=False)  # JSON string
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_specialties(self):
        return json.loads(self.specialties) if self.specialties else []
    
    def get_bed_types(self):
        return json.loads(self.bed_types) if self.bed_types else []
    
    def get_available_beds(self):
        return json.loads(self.available_beds) if self.available_beds else {}
    
    def get_facilities(self):
        return json.loads(self.facilities) if self.facilities else []
    
    def total_beds(self):
        beds = self.get_available_beds()
        return sum(beds.values()) if beds else 0

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospital.id'), nullable=False)
    patient_name = db.Column(db.String(200), nullable=False)
    patient_age = db.Column(db.Integer, nullable=False)
    patient_phone = db.Column(db.String(20), nullable=False)
    patient_email = db.Column(db.String(120), nullable=False)
    bed_type = db.Column(db.String(50), nullable=False)
    medical_condition = db.Column(db.String(200), nullable=False)
    emergency_contact = db.Column(db.String(20), nullable=False)
    special_requirements = db.Column(db.Text)
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')
    
    hospital = db.relationship('Hospital', backref=db.backref('bookings', lazy=True))

class BlogPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), nullable=False)
    slug = db.Column(db.String(300), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text, nullable=False)
    meta_description = db.Column(db.String(160))
    keywords = db.Column(db.String(500))
    author = db.Column(db.String(100), default='Hospital Finder Team')
    published_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_published = db.Column(db.Boolean, default=True)

# Forms
class SearchForm(FlaskForm):
    city = StringField('City', validators=[Length(max=100)])
    specialty = SelectField('Medical Specialty', choices=[])
    bed_type = SelectField('Bed Type', choices=[])
    min_rating = SelectField('Minimum Rating', choices=[
        ('', 'Any Rating'),
        ('4.0', '4.0+ Stars'),
        ('4.5', '4.5+ Stars'),
        ('4.8', '4.8+ Stars')
    ])
    max_fee = IntegerField('Maximum Fee ($)', validators=[NumberRange(min=0, max=10000)])

class BookingForm(FlaskForm):
    patient_name = StringField('Full Name', validators=[DataRequired(), Length(min=2, max=200)])
    patient_age = IntegerField('Age', validators=[DataRequired(), NumberRange(min=0, max=150)])
    patient_phone = StringField('Phone Number', validators=[DataRequired(), Length(min=10, max=20)])
    patient_email = StringField('Email', validators=[DataRequired(), Email()])
    bed_type = SelectField('Bed Type', choices=[], validators=[DataRequired()])
    medical_condition = StringField('Medical Condition', validators=[DataRequired(), Length(min=2, max=200)])
    emergency_contact = StringField('Emergency Contact', validators=[DataRequired(), Length(min=10, max=20)])
    special_requirements = TextAreaField('Special Requirements', validators=[Length(max=1000)])

class ContactForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired(), Length(min=2, max=100)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    subject = StringField('Subject', validators=[DataRequired(), Length(min=5, max=200)])
    message = TextAreaField('Message', validators=[DataRequired(), Length(min=10, max=1000)])

# Routes
@app.route('/')
def index():
    featured_hospitals = Hospital.query.limit(6).all()
    cities = db.session.query(Hospital.city).distinct().all()
    cities = [city[0] for city in cities]
    
    # Get all specialties for search form
    all_specialties = set()
    for hospital in Hospital.query.all():
        all_specialties.update(hospital.get_specialties())
    
    form = SearchForm()
    form.specialty.choices = [('', 'Any Specialty')] + [(spec, spec) for spec in sorted(all_specialties)]
    form.bed_type.choices = [('', 'Any Type'), ('ICU', 'ICU'), ('General', 'General'), ('Private', 'Private')]
    
    return render_template('index.html', 
                         hospitals=featured_hospitals, 
                         cities=cities,
                         form=form,
                         title='Find & Book Hospital Beds Online',
                         meta_description='Find and book hospital beds instantly. Search by specialty, location, and availability across top-rated hospitals.')

@app.route('/search')
def search():
    form = SearchForm()
    
    # Get filter options
    all_specialties = set()
    for hospital in Hospital.query.all():
        all_specialties.update(hospital.get_specialties())
    
    form.specialty.choices = [('', 'Any Specialty')] + [(spec, spec) for spec in sorted(all_specialties)]
    form.bed_type.choices = [('', 'Any Type'), ('ICU', 'ICU'), ('General', 'General'), ('Private', 'Private')]
    
    # Build query based on filters
    query = Hospital.query
    
    if request.args.get('city'):
        query = query.filter(Hospital.city.ilike(f"%{request.args.get('city')}%"))
    
    if request.args.get('specialty'):
        query = query.filter(Hospital.specialties.like(f"%{request.args.get('specialty')}%"))
    
    if request.args.get('min_rating'):
        query = query.filter(Hospital.doctor_rating >= float(request.args.get('min_rating')))
    
    if request.args.get('max_fee'):
        query = query.filter(Hospital.consultation_fee <= int(request.args.get('max_fee')))
    
    hospitals = query.all()
    
    # Filter by bed type if specified
    if request.args.get('bed_type'):
        bed_type = request.args.get('bed_type')
        filtered_hospitals = []
        for hospital in hospitals:
            available_beds = hospital.get_available_beds()
            if bed_type in available_beds and available_beds[bed_type] > 0:
                filtered_hospitals.append(hospital)
        hospitals = filtered_hospitals
    
    return render_template('search.html', 
                         hospitals=hospitals,
                         form=form,
                         filters=request.args,
                         title='Search Hospitals - Hospital Finder',
                         meta_description='Search and compare hospitals by specialty, location, ratings, and bed availability.')

@app.route('/hospital/<int:id>')
def hospital_detail(id):
    hospital = Hospital.query.get_or_404(id)
    available_beds = hospital.get_available_beds()
    
    return render_template('hospital_detail.html', 
                         hospital=hospital,
                         available_beds=available_beds,
                         title=f'{hospital.name} - Hospital Finder',
                         meta_description=f'Book beds at {hospital.name} in {hospital.city}. {hospital.description[:150]}...')

@app.route('/book/<int:id>', methods=['GET', 'POST'])
def book_hospital(id):
    hospital = Hospital.query.get_or_404(id)
    form = BookingForm()
    
    # Set bed type choices based on availability
    available_beds = hospital.get_available_beds()
    bed_choices = [(bed_type, f"{bed_type} ({count} available)") 
                   for bed_type, count in available_beds.items() if count > 0]
    form.bed_type.choices = bed_choices
    
    if form.validate_on_submit():
        booking = Booking(
            hospital_id=hospital.id,
            patient_name=form.patient_name.data,
            patient_age=form.patient_age.data,
            patient_phone=form.patient_phone.data,
            patient_email=form.patient_email.data,
            bed_type=form.bed_type.data,
            medical_condition=form.medical_condition.data,
            emergency_contact=form.emergency_contact.data,
            special_requirements=form.special_requirements.data
        )
        
        db.session.add(booking)
        db.session.commit()
        
        flash(f'Booking request submitted successfully! Your booking ID is #{booking.id}. You will receive confirmation shortly.', 'success')
        return redirect(url_for('hospital_detail', id=hospital.id))
    
    return render_template('booking.html', 
                         hospital=hospital,
                         form=form,
                         title=f'Book Bed at {hospital.name} - Hospital Finder',
                         meta_description=f'Book a hospital bed at {hospital.name}. Quick and secure online booking.')

@app.route('/blog')
def blog():
    posts = BlogPost.query.filter_by(is_published=True).order_by(BlogPost.published_at.desc()).all()
    return render_template('blog.html', 
                         posts=posts,
                         title='Healthcare Blog - Hospital Finder',
                         meta_description='Latest healthcare news, tips, and hospital guides. Stay informed about medical care and hospital services.')

@app.route('/blog/<slug>')
def blog_post(slug):
    post = BlogPost.query.filter_by(slug=slug, is_published=True).first_or_404()
    return render_template('blog_post.html', 
                         post=post,
                         title=f'{post.title} - Hospital Finder Blog',
                         meta_description=post.meta_description or post.excerpt)

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    form = ContactForm()
    
    if form.validate_on_submit():
        # In a real app, you'd send an email here
        flash('Thank you for your message! We will get back to you within 24 hours.', 'success')
        return redirect(url_for('contact'))
    
    return render_template('contact.html', 
                         form=form,
                         title='Contact Us - Hospital Finder',
                         meta_description='Get in touch with Hospital Finder. We are here to help you find the right healthcare facility.')

@app.route('/city/<city_name>')
def city_page(city_name):
    hospitals = Hospital.query.filter(Hospital.city.ilike(f"%{city_name}%")).all()
    return render_template('city.html', 
                         hospitals=hospitals,
                         city_name=city_name.title(),
                         title=f'Hospitals in {city_name.title()} - Hospital Finder',
                         meta_description=f'Find and book hospital beds in {city_name.title()}. Compare top-rated hospitals and medical facilities.')

@app.route('/api/search')
def api_search():
    """API endpoint for AJAX search"""
    city = request.args.get('city', '')
    specialty = request.args.get('specialty', '')
    
    query = Hospital.query
    if city:
        query = query.filter(Hospital.city.ilike(f"%{city}%"))
    if specialty:
        query = query.filter(Hospital.specialties.like(f"%{specialty}%"))
    
    hospitals = query.limit(10).all()
    
    results = []
    for hospital in hospitals:
        results.append({
            'id': hospital.id,
            'name': hospital.name,
            'city': hospital.city,
            'rating': hospital.doctor_rating,
            'fee': hospital.consultation_fee,
            'total_beds': hospital.total_beds()
        })
    
    return jsonify(results)

def init_sample_data():
    """Initialize database with sample data"""
    if Hospital.query.count() == 0:
        # Sample hospitals
        hospitals_data = [
            {
                'name': 'Metro General Hospital',
                'city': 'New York',
                'state': 'NY',
                'address': '123 Broadway, New York, NY 10001',
                'phone': '+1-212-555-0101',
                'email': 'info@metrogeneralhospital.com',
                'website': 'www.metrogeneralhospital.com',
                'description': 'Leading metropolitan hospital providing comprehensive medical services with state-of-the-art facilities and expert medical professionals.',
                'specialties': json.dumps(['Cardiology', 'Neurology', 'Orthopedics', 'Emergency Medicine', 'Surgery']),
                'bed_types': json.dumps(['ICU', 'General', 'Private']),
                'available_beds': json.dumps({'ICU': 12, 'General': 45, 'Private': 20}),
                'doctor_rating': 4.7,
                'success_rate': 96.2,
                'consultation_fee': 250,
                'facilities': json.dumps(['Emergency Care', 'ICU', 'Laboratory', 'Pharmacy', 'Radiology', 'Surgery Center']),
                'image_url': 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop'
            },
            {
                'name': 'Children\'s Healthcare Center',
                'city': 'Los Angeles',
                'state': 'CA',
                'address': '456 Sunset Blvd, Los Angeles, CA 90028',
                'phone': '+1-323-555-0102',
                'email': 'contact@childrenshealthcare.com',
                'website': 'www.childrenshealthcare.com',
                'description': 'Specialized pediatric hospital dedicated to providing exceptional healthcare for children with a child-friendly environment.',
                'specialties': json.dumps(['Pediatrics', 'Neonatology', 'Pediatric Surgery', 'Child Psychology']),
                'bed_types': json.dumps(['ICU', 'General', 'Private']),
                'available_beds': json.dumps({'ICU': 8, 'General': 30, 'Private': 15}),
                'doctor_rating': 4.9,
                'success_rate': 98.1,
                'consultation_fee': 200,
                'facilities': json.dumps(['Pediatric ICU', 'Neonatal Unit', 'Play Therapy', 'Child Psychology', 'Laboratory']),
                'image_url': 'https://images.unsplash.com/photo-1551601651-09e3b15b6f82?w=600&h=400&fit=crop'
            },
            {
                'name': 'Heart & Vascular Institute',
                'city': 'Chicago',
                'state': 'IL',
                'address': '789 Michigan Ave, Chicago, IL 60611',
                'phone': '+1-312-555-0103',
                'email': 'info@heartvascular.com',
                'website': 'www.heartvascular.com',
                'description': 'Premier cardiac care facility specializing in advanced heart treatments and cardiovascular surgery with world-class specialists.',
                'specialties': json.dumps(['Cardiology', 'Cardiac Surgery', 'Interventional Cardiology', 'Heart Transplant']),
                'bed_types': json.dumps(['ICU', 'Private']),
                'available_beds': json.dumps({'ICU': 15, 'Private': 25}),
                'doctor_rating': 4.8,
                'success_rate': 97.8,
                'consultation_fee': 350,
                'facilities': json.dumps(['Cardiac Cath Lab', 'Heart Surgery', 'Cardiac ICU', 'Rehabilitation']),
                'image_url': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop'
            },
            {
                'name': 'Community Care Hospital',
                'city': 'Houston',
                'state': 'TX',
                'address': '321 Main St, Houston, TX 77002',
                'phone': '+1-713-555-0104',
                'email': 'info@communitycare.com',
                'website': 'www.communitycare.com',
                'description': 'Community-focused hospital providing quality healthcare with personalized attention and comprehensive medical services.',
                'specialties': json.dumps(['Family Medicine', 'Internal Medicine', 'Obstetrics', 'General Surgery']),
                'bed_types': json.dumps(['General', 'Private']),
                'available_beds': json.dumps({'General': 50, 'Private': 20}),
                'doctor_rating': 4.4,
                'success_rate': 94.5,
                'consultation_fee': 150,
                'facilities': json.dumps(['Maternity Ward', 'Laboratory', 'Pharmacy', 'Radiology']),
                'image_url': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop'
            },
            {
                'name': 'University Medical Center',
                'city': 'Boston',
                'state': 'MA',
                'address': '654 Harvard St, Boston, MA 02115',
                'phone': '+1-617-555-0105',
                'email': 'contact@universitymedical.edu',
                'website': 'www.universitymedical.edu',
                'description': 'Teaching hospital affiliated with top medical schools, offering cutting-edge research and innovative treatments.',
                'specialties': json.dumps(['Research Medicine', 'Oncology', 'Neurology', 'Transplant Medicine']),
                'bed_types': json.dumps(['ICU', 'General', 'Private']),
                'available_beds': json.dumps({'ICU': 20, 'General': 60, 'Private': 30}),
                'doctor_rating': 4.6,
                'success_rate': 95.7,
                'consultation_fee': 300,
                'facilities': json.dumps(['Research Center', 'Cancer Treatment', 'Transplant Unit', 'Advanced Imaging']),
                'image_url': 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop'
            },
            {
                'name': 'Regional Medical Center',
                'city': 'Miami',
                'state': 'FL',
                'address': '987 Ocean Dr, Miami, FL 33139',
                'phone': '+1-305-555-0106',
                'email': 'info@regionalmedical.com',
                'website': 'www.regionalmedical.com',
                'description': 'Full-service medical center serving the Miami region with comprehensive healthcare and emergency services.',
                'specialties': json.dumps(['Emergency Medicine', 'Trauma Care', 'Cardiology', 'Orthopedics']),
                'bed_types': json.dumps(['ICU', 'General', 'Private']),
                'available_beds': json.dumps({'ICU': 10, 'General': 40, 'Private': 18}),
                'doctor_rating': 4.5,
                'success_rate': 93.8,
                'consultation_fee': 180,
                'facilities': json.dumps(['24/7 Emergency', 'Trauma Center', 'ICU', 'Laboratory']),
                'image_url': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop'
            }
        ]
        
        for hospital_data in hospitals_data:
            hospital = Hospital(**hospital_data)
            db.session.add(hospital)
        
        # Sample blog posts for SEO
        blog_posts = [
            {
                'title': 'How to Choose the Right Hospital for Your Medical Needs',
                'slug': 'how-to-choose-right-hospital',
                'content': '''<p>Choosing the right hospital is one of the most important healthcare decisions you'll make. Here's a comprehensive guide to help you make an informed choice.</p>
                
                <h2>Key Factors to Consider</h2>
                <p>When selecting a hospital, consider these crucial factors:</p>
                <ul>
                    <li><strong>Specialization:</strong> Does the hospital specialize in your medical condition?</li>
                    <li><strong>Quality ratings:</strong> Check hospital ratings and patient satisfaction scores</li>
                    <li><strong>Location:</strong> Proximity to your home for family visits and convenience</li>
                    <li><strong>Insurance coverage:</strong> Ensure the hospital accepts your insurance</li>
                </ul>
                
                <h2>Research Hospital Quality</h2>
                <p>Look for hospitals with high success rates, low infection rates, and positive patient reviews. Our platform provides comprehensive ratings and reviews to help you make the best choice.</p>''',
                'excerpt': 'Learn how to choose the best hospital for your medical needs with our comprehensive guide covering quality, specialization, and key factors to consider.',
                'meta_description': 'Complete guide on choosing the right hospital for your medical needs. Learn about quality ratings, specializations, and key factors to consider.',
                'keywords': 'hospital selection, medical care, hospital quality, patient guide, healthcare choices'
            },
            {
                'title': 'Understanding Hospital Bed Types: ICU, General, and Private',
                'slug': 'understanding-hospital-bed-types',
                'content': '''<p>Different medical conditions require different levels of care and bed types. Understanding these options helps you make informed decisions about your healthcare.</p>
                
                <h2>ICU (Intensive Care Unit) Beds</h2>
                <p>ICU beds are for patients requiring intensive monitoring and life support. These rooms have:</p>
                <ul>
                    <li>24/7 specialized nursing care</li>
                    <li>Advanced monitoring equipment</li>
                    <li>Immediate access to critical care specialists</li>
                </ul>
                
                <h2>General Ward Beds</h2>
                <p>General beds are suitable for patients who need medical care but don't require intensive monitoring. Features include:</p>
                <ul>
                    <li>Regular nursing rounds</li>
                    <li>Shared facilities</li>
                    <li>Cost-effective option</li>
                </ul>
                
                <h2>Private Rooms</h2>
                <p>Private rooms offer enhanced comfort and privacy for patients who prefer individual care.</p>''',
                'excerpt': 'Understand the differences between ICU, general, and private hospital beds to make the best choice for your medical needs and budget.',
                'meta_description': 'Learn about ICU, general, and private hospital bed types. Understand which option is best for your medical condition and recovery needs.',
                'keywords': 'hospital beds, ICU beds, private rooms, general ward, hospital accommodation, medical care levels'
            }
        ]
        
        for post_data in blog_posts:
            post = BlogPost(**post_data)
            db.session.add(post)
        
        db.session.commit()
        print("Sample data initialized successfully!")

def create_tables():
    """Create database tables if they don't exist"""
    with app.app_context():
        db.create_all()
        # Check if sample data exists
        if Hospital.query.count() == 0:
            init_sample_data()

# Initialize database when the module is imported
create_tables()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)