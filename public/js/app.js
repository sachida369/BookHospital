/**
 * Hospital.com - Express.js Version
 * Client-side JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initFormValidation();
    initSearchEnhancements();
    initMobileEnhancements();
    initAccessibility();
    initLoadingStates();
    initAdminDashboard();
    console.log('Hospital.com (Express) app initialized');
}

// Form validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
        
        // Phone number formatting
        const phoneInputs = form.querySelectorAll('input[type="tel"], input[name*="phone"], input[name*="Phone"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', formatPhoneNumber);
        });
        
        // Form submission
        form.addEventListener('submit', handleFormSubmit);
    });
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Type-specific validation
    if (value && isValid) {
        switch (type) {
            case 'email':
                isValid = isValidEmail(value);
                errorMessage = isValid ? '' : 'Please enter a valid email address';
                break;
                
            case 'tel':
                isValid = isValidPhone(value);
                errorMessage = isValid ? '' : 'Please enter a valid phone number';
                break;
                
            case 'number':
                const min = field.min;
                const max = field.max;
                const numValue = parseFloat(value);
                
                if (min && numValue < min) {
                    isValid = false;
                    errorMessage = `Value must be at least ${min}`;
                } else if (max && numValue > max) {
                    isValid = false;
                    errorMessage = `Value must not exceed ${max}`;
                }
                break;
        }
    }
    
    // Custom validation for specific fields
    if (name === 'patientAge' && value) {
        const age = parseInt(value);
        if (age < 0 || age > 150) {
            isValid = false;
            errorMessage = 'Please enter a valid age (0-150)';
        }
    }
    
    // Update field appearance
    updateFieldValidation(field, isValid, errorMessage);
    
    return isValid;
}

function updateFieldValidation(field, isValid, errorMessage) {
    field.classList.remove('is-valid', 'is-invalid');
    
    if (isValid && field.value.trim()) {
        field.classList.add('is-valid');
    } else if (!isValid) {
        field.classList.add('is-invalid');
    }
    
    // Show/hide error message
    let feedback = field.parentNode.querySelector('.invalid-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        field.parentNode.appendChild(feedback);
    }
    
    feedback.textContent = errorMessage;
    feedback.style.display = isValid ? 'none' : 'block';
}

function clearFieldError(field) {
    if (field.classList.contains('is-invalid') && field.value.trim()) {
        validateField(field);
    }
}

function handleFormSubmit(e) {
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate form before submission
    if (!validateForm(form)) {
        e.preventDefault();
        showFormErrors(form);
        return;
    }
    
    // Show loading state
    if (submitButton) {
        showButtonLoading(submitButton);
    }
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function showFormErrors(form) {
    const firstError = form.querySelector('.is-invalid');
    if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
}

function formatPhoneNumber(e) {
    const input = e.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    
    input.value = value;
}

// Search enhancements
function initSearchEnhancements() {
    const searchInput = document.querySelector('input[name="name"]');
    const locationInput = document.querySelector('input[name="location"]');
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearchInput(e.target.value);
            }, 300);
        });
    }
    
    // Auto-submit search form on filter change
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const form = e.target.closest('form');
            if (form) {
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    showButtonLoading(submitButton);
                    form.submit();
                }
            }
        });
    });
}

function handleSearchInput(query) {
    if (query.length < 2) return;
    // Could implement real-time search suggestions here
    console.log('Search query:', query);
}

// Mobile enhancements
function initMobileEnhancements() {
    // Touch gestures for cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        let touchStartY = 0;
        
        card.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });
        
        card.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchStartY - touchEndY;
            
            // Swipe up gesture
            if (deltaY > 50) {
                const bookButton = card.querySelector('.btn-primary');
                if (bookButton) {
                    bookButton.click();
                }
            }
        });
    });
    
    // Orientation change handling
    window.addEventListener('orientationchange', () => {
        setTimeout(handleOrientationChange, 100);
    });
}

function handleOrientationChange() {
    // Recalculate layout on orientation change
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        // Refresh modal layout
        const backdrop = modal.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.style.height = window.innerHeight + 'px';
        }
    });
}

// Accessibility enhancements
function initAccessibility() {
    // Keyboard navigation for cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Hospital card ${index + 1}`);
        
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const detailsButton = card.querySelector('.btn-outline-primary, a[href*="hospital"]');
                if (detailsButton) {
                    detailsButton.click();
                }
            }
        });
    });
    
    // High contrast mode detection
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
    }
    
    // Reduced motion support
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
    }
}

// Loading states
function initLoadingStates() {
    // Page loading indicator
    if (document.readyState === 'loading') {
        showPageLoading();
        window.addEventListener('load', hidePageLoading);
    }
}

function showButtonLoading(button) {
    if (button.dataset.originalText) return; // Already loading
    
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Processing...
    `;
}

function hideButtonLoading(button) {
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        button.disabled = false;
        delete button.dataset.originalText;
    }
}

function showPageLoading() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75';
    loader.style.zIndex = '9999';
    loader.innerHTML = `
        <div class="text-center text-white">
            <div class="spinner-border mb-3" role="status"></div>
            <div>Loading...</div>
        </div>
    `;
    document.body.appendChild(loader);
}

function hidePageLoading() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.remove();
    }
}

// Admin dashboard functionality
function initAdminDashboard() {
    // Booking status filter
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const status = button.dataset.filter;
            filterBookings(status);
            
            // Update button states
            filterButtons.forEach(btn => {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-primary');
        });
    });
    
    // Confirmation dialogs
    const confirmButtons = document.querySelectorAll('[data-confirm]');
    confirmButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const message = button.dataset.confirm;
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });
}

function filterBookings(status) {
    const rows = document.querySelectorAll('.booking-row');
    rows.forEach(row => {
        if (status === 'all' || row.dataset.status === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    const target = e.target.closest('a[href^="#"]');
    if (target) {
        e.preventDefault();
        const href = target.getAttribute('href');
        const targetElement = document.querySelector(href);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Auto-dismiss alerts
setTimeout(() => {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        if (alert.querySelector('.btn-close')) {
            alert.querySelector('.btn-close').click();
        }
    });
}, 5000);