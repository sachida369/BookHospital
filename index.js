const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.replit.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "via.placeholder.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'hospital-booking-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Database helper functions
const DB_FILE = 'hospital_data.json';

async function initDatabase() {
  try {
    await fs.access(DB_FILE);
  } catch (error) {
    // File doesn't exist, create initial data
    const initialData = {
      hospitals: [
        {
          id: 1,
          name: 'City General Hospital',
          location: 'Downtown',
          address: '123 Main Street, Downtown',
          phone: '+1-555-0101',
          email: 'info@citygeneral.com',
          website: 'www.citygeneral.com',
          description: 'A leading multi-specialty hospital providing comprehensive healthcare services.',
          doctorRating: 4.5,
          successRate: 95.2,
          consultationFee: 150,
          diseaseTypes: ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine'],
          bedTypes: ['ICU', 'General', 'Private'],
          availableBeds: { ICU: 5, General: 20, Private: 10 },
          facilities: ['Emergency Care', 'ICU', 'Laboratory', 'Pharmacy', 'Radiology', 'Surgery'],
          imageUrl: 'https://via.placeholder.com/400x250/007bff/ffffff?text=City+General+Hospital'
        },
        {
          id: 2,
          name: 'Metropolitan Medical Center',
          location: 'Midtown',
          address: '456 Oak Avenue, Midtown',
          phone: '+1-555-0102',
          email: 'contact@metromedical.com',
          website: 'www.metromedical.com',
          description: 'Advanced medical center specializing in critical care and emergency services.',
          doctorRating: 4.7,
          successRate: 97.1,
          consultationFee: 200,
          diseaseTypes: ['Emergency Medicine', 'Trauma Care', 'Intensive Care', 'Cardiology'],
          bedTypes: ['ICU', 'General', 'Private'],
          availableBeds: { ICU: 8, General: 15, Private: 12 },
          facilities: ['24/7 Emergency', 'Trauma Center', 'ICU', 'Laboratory', 'Blood Bank', 'Surgery'],
          imageUrl: 'https://via.placeholder.com/400x250/28a745/ffffff?text=Metro+Medical+Center'
        },
        {
          id: 3,
          name: 'Sunshine Children\'s Hospital',
          location: 'Westside',
          address: '789 Pine Street, Westside',
          phone: '+1-555-0103',
          email: 'info@sunshinechildren.com',
          website: 'www.sunshinechildren.com',
          description: 'Specialized pediatric hospital with child-friendly environment and expert pediatric care.',
          doctorRating: 4.8,
          successRate: 98.5,
          consultationFee: 125,
          diseaseTypes: ['Pediatrics', 'Neonatology', 'Pediatric Surgery', 'Child Psychology'],
          bedTypes: ['ICU', 'General', 'Private'],
          availableBeds: { ICU: 3, General: 25, Private: 15 },
          facilities: ['Pediatric ICU', 'Neonatal Unit', 'Play Therapy', 'Child Psychology', 'Laboratory'],
          imageUrl: 'https://via.placeholder.com/400x250/ffc107/000000?text=Sunshine+Children+Hospital'
        },
        {
          id: 4,
          name: 'Advanced Heart Institute',
          location: 'Eastside',
          address: '321 Cedar Lane, Eastside',
          phone: '+1-555-0104',
          email: 'heart@advancedheart.com',
          website: 'www.advancedheart.com',
          description: 'Premier cardiac care facility with state-of-the-art cardiac surgery and intervention capabilities.',
          doctorRating: 4.9,
          successRate: 99.1,
          consultationFee: 300,
          diseaseTypes: ['Cardiology', 'Cardiac Surgery', 'Interventional Cardiology', 'Heart Transplant'],
          bedTypes: ['ICU', 'Private'],
          availableBeds: { ICU: 10, Private: 20 },
          facilities: ['Cardiac Cath Lab', 'Heart Surgery', 'Cardiac ICU', 'Rehabilitation', 'Emergency Care'],
          imageUrl: 'https://via.placeholder.com/400x250/dc3545/ffffff?text=Advanced+Heart+Institute'
        },
        {
          id: 5,
          name: 'Greenwood Community Hospital',
          location: 'Suburbs',
          address: '654 Maple Drive, Suburbs',
          phone: '+1-555-0105',
          email: 'info@greenwood.com',
          website: 'www.greenwood.com',
          description: 'Community-focused hospital providing quality healthcare with a personal touch.',
          doctorRating: 4.3,
          successRate: 94.8,
          consultationFee: 100,
          diseaseTypes: ['Family Medicine', 'Internal Medicine', 'Obstetrics', 'General Surgery'],
          bedTypes: ['General', 'Private'],
          availableBeds: { General: 30, Private: 8 },
          facilities: ['Maternity Ward', 'Laboratory', 'Pharmacy', 'Radiology', 'Physical Therapy'],
          imageUrl: 'https://via.placeholder.com/400x250/6c757d/ffffff?text=Greenwood+Community'
        },
        {
          id: 6,
          name: 'University Medical Hospital',
          location: 'University District',
          address: '987 College Boulevard, University District',
          phone: '+1-555-0106',
          email: 'contact@unimedical.edu',
          website: 'www.unimedical.edu',
          description: 'Teaching hospital affiliated with the university, offering cutting-edge medical research and treatment.',
          doctorRating: 4.6,
          successRate: 96.7,
          consultationFee: 175,
          diseaseTypes: ['Research Medicine', 'Oncology', 'Neurology', 'Transplant Medicine'],
          bedTypes: ['ICU', 'General', 'Private'],
          availableBeds: { ICU: 12, General: 40, Private: 18 },
          facilities: ['Research Center', 'Cancer Treatment', 'Transplant Unit', 'Medical Education', 'Advanced Imaging'],
          imageUrl: 'https://via.placeholder.com/400x250/6f42c1/ffffff?text=University+Medical'
        }
      ],
      bookings: [],
      admins: [
        {
          id: 1,
          username: 'admin',
          passwordHash: await bcrypt.hash('admin123', 10)
        }
      ]
    };
    
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

async function readDatabase() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Database read error:', error);
    return { hospitals: [], bookings: [], admins: [] };
  }
}

async function writeDatabase(data) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Database write error:', error);
  }
}

// Utility functions
function filterHospitals(hospitals, filters) {
  return hospitals.filter(hospital => {
    if (filters.name && !hospital.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.location && !hospital.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.diseaseType && !hospital.diseaseTypes.includes(filters.diseaseType)) return false;
    if (filters.bedType && !hospital.bedTypes.includes(filters.bedType)) return false;
    if (filters.minRating && hospital.doctorRating < parseFloat(filters.minRating)) return false;
    if (filters.maxFees && hospital.consultationFee > parseFloat(filters.maxFees)) return false;
    if (filters.facilities && filters.facilities.length > 0) {
      const facilitiesArray = Array.isArray(filters.facilities) ? filters.facilities : [filters.facilities];
      if (!facilitiesArray.every(facility => hospital.facilities.includes(facility))) return false;
    }
    return true;
  });
}

function getTotalBeds(availableBeds) {
  return Object.values(availableBeds || {}).reduce((sum, count) => sum + count, 0);
}

// Routes

// Home page
app.get('/', async (req, res) => {
  try {
    const db = await readDatabase();
    const hospitals = db.hospitals.slice(0, 6); // Featured hospitals
    
    // Get unique values for filters
    const diseaseTypes = [...new Set(db.hospitals.flatMap(h => h.diseaseTypes))].sort();
    const facilities = [...new Set(db.hospitals.flatMap(h => h.facilities))].sort();
    const bedTypes = ['ICU', 'General', 'Private'];
    
    res.render('index', {
      title: 'Hospital.com - Find & Book Hospital Beds Online',
      hospitals,
      diseaseTypes,
      facilities,
      bedTypes,
      getTotalBeds,
      user: req.session.user,
      isAdmin: req.session.isAdmin
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.status(500).render('error', { 
      title: 'Error - Hospital.com',
      message: 'Internal server error',
      user: req.session.user,
      isAdmin: req.session.isAdmin
    });
  }
});

// Search results
app.get('/search', async (req, res) => {
  try {
    const db = await readDatabase();
    const filters = req.query;
    const filteredHospitals = filterHospitals(db.hospitals, filters);
    
    // Get unique values for filters
    const diseaseTypes = [...new Set(db.hospitals.flatMap(h => h.diseaseTypes))].sort();
    const facilities = [...new Set(db.hospitals.flatMap(h => h.facilities))].sort();
    const bedTypes = ['ICU', 'General', 'Private'];
    
    res.render('search', {
      title: 'Search Results - Hospital.com',
      hospitals: filteredHospitals,
      diseaseTypes,
      facilities,
      bedTypes,
      filters,
      getTotalBeds,
      user: req.session.user,
      isAdmin: req.session.isAdmin
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).render('error', { message: 'Search error' });
  }
});

// Hospital details
app.get('/hospital/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const hospital = db.hospitals.find(h => h.id === parseInt(req.params.id));
    
    if (!hospital) {
      return res.status(404).render('error', { message: 'Hospital not found' });
    }
    
    res.render('hospital', {
      title: `${hospital.name} - Hospital.com`,
      hospital,
      user: req.session.user,
      isAdmin: req.session.isAdmin
    });
  } catch (error) {
    console.error('Hospital details error:', error);
    res.status(500).render('error', { message: 'Hospital details error' });
  }
});

// Booking page
app.get('/book/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const hospital = db.hospitals.find(h => h.id === parseInt(req.params.id));
    
    if (!hospital) {
      return res.status(404).render('error', { message: 'Hospital not found' });
    }
    
    res.render('booking', {
      title: `Book Bed - ${hospital.name} - Hospital.com`,
      hospital,
      errors: {},
      formData: {},
      user: req.session.user,
      isAdmin: req.session.isAdmin
    });
  } catch (error) {
    console.error('Booking page error:', error);
    res.status(500).render('error', { message: 'Booking page error' });
  }
});

// Process booking
app.post('/book/:id', [
  body('patientName').trim().isLength({ min: 2, max: 100 }).withMessage('Patient name must be 2-100 characters'),
  body('patientAge').isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
  body('patientPhone').trim().isLength({ min: 10, max: 15 }).withMessage('Phone number must be 10-15 characters'),
  body('patientEmail').isEmail().withMessage('Valid email is required'),
  body('bedType').notEmpty().withMessage('Bed type is required'),
  body('diseaseType').trim().isLength({ min: 2, max: 100 }).withMessage('Disease/condition is required'),
  body('emergencyContact').trim().isLength({ min: 10, max: 15 }).withMessage('Emergency contact is required'),
  body('specialRequirements').optional().isLength({ max: 500 }).withMessage('Special requirements too long')
], async (req, res) => {
  try {
    const db = await readDatabase();
    const hospital = db.hospitals.find(h => h.id === parseInt(req.params.id));
    
    if (!hospital) {
      return res.status(404).render('error', { message: 'Hospital not found' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorObj = errors.array().reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {});
      
      return res.render('booking', {
        title: `Book Bed - ${hospital.name} - Hospital.com`,
        hospital,
        errors: errorObj,
        formData: req.body,
        user: req.session.user,
        isAdmin: req.session.isAdmin
      });
    }
    
    // Create booking
    const booking = {
      id: db.bookings.length + 1,
      hospitalId: hospital.id,
      patientName: req.body.patientName,
      patientAge: parseInt(req.body.patientAge),
      patientPhone: req.body.patientPhone,
      patientEmail: req.body.patientEmail,
      bedType: req.body.bedType,
      diseaseType: req.body.diseaseType,
      emergencyContact: req.body.emergencyContact,
      specialRequirements: req.body.specialRequirements || '',
      bookingDate: new Date().toISOString(),
      status: 'pending'
    };
    
    db.bookings.push(booking);
    await writeDatabase(db);
    
    req.session.message = {
      type: 'success',
      text: `Booking submitted successfully! Your booking ID is: ${booking.id}`
    };
    
    res.redirect(`/hospital/${hospital.id}`);
  } catch (error) {
    console.error('Booking submission error:', error);
    res.status(500).render('error', { message: 'Booking submission error' });
  }
});

// Admin login
app.get('/admin/login', (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  
  res.render('admin-login', {
    title: 'Admin Login - Hospital.com',
    errors: {},
    user: req.session.user,
    isAdmin: req.session.isAdmin
  });
});

app.post('/admin/login', [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('password').isLength({ min: 6, max: 100 }).withMessage('Password must be 6-100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorObj = errors.array().reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {});
      
      return res.render('admin-login', {
        title: 'Admin Login - Hospital.com',
        errors: errorObj,
        user: req.session.user,
        isAdmin: req.session.isAdmin
      });
    }
    
    const db = await readDatabase();
    const admin = db.admins.find(a => a.username === req.body.username);
    
    if (admin && await bcrypt.compare(req.body.password, admin.passwordHash)) {
      req.session.isAdmin = true;
      req.session.adminId = admin.id;
      req.session.message = {
        type: 'success',
        text: 'Logged in successfully!'
      };
      res.redirect('/admin/dashboard');
    } else {
      res.render('admin-login', {
        title: 'Admin Login - Hospital.com',
        errors: { general: 'Invalid username or password' },
        user: req.session.user,
        isAdmin: req.session.isAdmin
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).render('error', { message: 'Login error' });
  }
});

// Admin logout
app.get('/admin/logout', (req, res) => {
  req.session.isAdmin = false;
  req.session.adminId = null;
  req.session.message = {
    type: 'success',
    text: 'Logged out successfully!'
  };
  res.redirect('/');
});

// Admin dashboard
app.get('/admin/dashboard', async (req, res) => {
  if (!req.session.isAdmin) {
    req.session.message = {
      type: 'error',
      text: 'Please login to access admin dashboard'
    };
    return res.redirect('/admin/login');
  }
  
  try {
    const db = await readDatabase();
    
    const stats = {
      totalHospitals: db.hospitals.length,
      totalBookings: db.bookings.length,
      pendingBookings: db.bookings.filter(b => b.status === 'pending').length
    };
    
    res.render('admin-dashboard', {
      title: 'Admin Dashboard - Hospital.com',
      hospitals: db.hospitals,
      bookings: db.bookings,
      stats,
      user: req.session.user,
      isAdmin: req.session.isAdmin
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).render('error', { message: 'Dashboard error' });
  }
});

// Update booking status
app.get('/admin/booking/:id/:status', async (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect('/admin/login');
  }
  
  try {
    const { id, status } = req.params;
    
    if (!['confirmed', 'cancelled'].includes(status)) {
      req.session.message = {
        type: 'error',
        text: 'Invalid status'
      };
      return res.redirect('/admin/dashboard');
    }
    
    const db = await readDatabase();
    const booking = db.bookings.find(b => b.id === parseInt(id));
    
    if (booking) {
      booking.status = status;
      await writeDatabase(db);
      req.session.message = {
        type: 'success',
        text: `Booking ${status} successfully!`
      };
    } else {
      req.session.message = {
        type: 'error',
        text: 'Booking not found'
      };
    }
    
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).render('error', { message: 'Update booking error' });
  }
});

// About page
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About Us - Hospital.com',
    user: req.session.user,
    isAdmin: req.session.isAdmin
  });
});

// Contact page
app.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us - Hospital.com',
    errors: {},
    formData: {},
    user: req.session.user,
    isAdmin: req.session.isAdmin
  });
});

app.post('/contact', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be 5-200 characters'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorObj = errors.array().reduce((acc, error) => {
      acc[error.path] = error.msg;
      return acc;
    }, {});
    
    return res.render('contact', {
      title: 'Contact Us - Hospital.com',
      errors: errorObj,
      formData: req.body,
      user: req.session.user,
      isAdmin: req.session.isAdmin
    });
  }
  
  req.session.message = {
    type: 'success',
    text: 'Thank you for your message! We will get back to you soon.'
  };
  
  res.redirect('/contact');
});

// Middleware for flash messages
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found - Hospital.com',
    message: 'Page not found',
    user: req.session.user,
    isAdmin: req.session.isAdmin
  });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hospital.com server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});