# Overview

Hospital Finder is a minimal, SEO-optimized Flask web application for finding and booking hospital beds. The platform provides a fast-loading, mobile-first interface for users to search hospitals by specialty, location, ratings, and bed availability. Built with Flask, SQLite, and Tailwind CSS, it features comprehensive SEO optimization with meta tags, structured data, city-based landing pages, and a healthcare blog for content marketing. The application emphasizes zero-install persistence and optimal performance on Replit.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
- **Flask Framework**: Lightweight Python web framework optimized for SEO and fast deployment
- **SQLAlchemy ORM**: Powerful database abstraction layer with declarative models
- **Form Handling**: Flask-WTF with WTForms for robust form validation and CSRF protection
- **Security**: Werkzeug password hashing, session management, and form validation

## Database Design
- **SQLite Database**: Zero-install persistence with hospital_finder.db file
- **Relational Models**: Hospital, Booking, and BlogPost models with proper relationships
- **JSON Fields**: Specialties, facilities, and bed availability stored as JSON for flexibility
- **Auto-initialization**: Database tables and sample data created automatically on first run

## Frontend Architecture
- **Tailwind CSS**: Utility-first CSS framework for fast loading and mobile optimization
- **Semantic HTML**: SEO-optimized markup with proper heading hierarchy and meta tags
- **Template Engine**: Jinja2 templates with inheritance for consistent UI structure
- **Progressive Enhancement**: Vanilla JavaScript with accessibility and mobile-first design

## SEO Optimization
- **Meta Tags**: Comprehensive title, description, and Open Graph tags on every page
- **Structured Data**: JSON-LD schema markup for search engine understanding
- **City Landing Pages**: Dynamic pages for each city with localized content
- **Blog System**: Healthcare articles for content marketing and keyword targeting

## Search & Filtering System
- **Advanced Filters**: City, medical specialty, bed type, rating, and consultation fee filters
- **Real-Time Availability**: Live bed count display across ICU, General, and Private wards
- **Smart Search**: Specialty-based filtering with comprehensive hospital matching
- **City-Based Search**: Location-specific hospital discovery with dedicated landing pages

## User Interface Design
- **Mobile-First**: Responsive design optimized for smartphones and tablets
- **Fast Loading**: Minimal CSS and JavaScript for optimal performance
- **SEO-Friendly**: Semantic HTML structure with proper heading hierarchy
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

# External Dependencies

## Frontend Libraries
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Font Awesome 6.4**: Icon library for visual enhancement
- **Custom CSS**: Medical-themed color palette and component styling

## Backend Dependencies
- **Flask 3.0+**: Python web framework for rapid development
- **Flask-SQLAlchemy**: Database ORM with SQLite support
- **Flask-WTF**: Form handling with CSRF protection
- **WTForms**: Form validation and rendering
- **Werkzeug**: Password hashing and security utilities

## Development Tools
- **Python 3.11+**: Modern Python runtime with enhanced performance
- **SQLite**: Zero-configuration database with file-based storage
- **Gunicorn**: WSGI HTTP server for production deployment

## Third-Party Services
- **Unsplash Images**: High-quality hospital and medical images via API
- **CDN Resources**: Tailwind CSS and Font Awesome served via CDN
- **Email Validation**: Built-in WTForms email validation

## Infrastructure
- **SQLite Database**: Single-file database for zero-install persistence
- **Static Asset Management**: Flask static file serving for CSS and JavaScript
- **Session Management**: Flask session handling with secure cookies
- **Environment Configuration**: OS environment variables for sensitive data