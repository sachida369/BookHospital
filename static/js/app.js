/**
 * Hospital.com - Main JavaScript Application
 * Handles client-side functionality for the hospital booking platform
 */

// Global app configuration
const HospitalApp = {
    config: {
        searchDebounceTime: 300,
        loadingTimeout: 30000,
        animationDuration: 300
    },
    
    // Initialize the application
    init() {
        this.initEventListeners();
        this.initFormValidation();
        this.initSearchFunctionality();
        this.initMobileEnhancements();
        this.initAccessibility();
        this.initLoadingStates();
        console.log('Hospital.com app initialized');
    },
    
    // Set up event listeners
    initEventListeners() {
        // Mobile menu toggle
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (navbarToggler) {
            navbarToggler.addEventListener('click', this.handleMobileMenuToggle);
        }
        
        // Form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });
        
        // Search filters
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', this.handleFilterChange.bind(this));
        });
        
        // Card hover effects
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', this.handleCardHover);
            card.addEventListener('mouseleave', this.handleCardLeave);
        });
        
        // Smooth scrolling for anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', this.handleSmoothScroll);
        });
        
        // Back to top button
        this.initBackToTop();
    },
    
    // Enhanced form validation
    initFormValidation() {
        const forms = document.querySelectorAll('.needs-validation, form');
        
        forms.forEach(form => {
            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
            
            // Phone number formatting
            const phoneInputs = form.querySelectorAll('input[type="tel"], input[name*="phone"]');
            phoneInputs.forEach(input => {
                input.addEventListener('input', this.formatPhoneNumber);
            });
            
            // Email validation
            const emailInputs = form.querySelectorAll('input[type="email"]');
            emailInputs.forEach(input => {
                input.addEventListener('blur', this.validateEmail);
            });
        });
    },
    
    // Search functionality enhancements
    initSearchFunctionality() {
        const searchInput = document.querySelector('input[name="name"]');
        const locationInput = document.querySelector('input[name="location"]');
        
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearchInput(e.target.value);
                }, this.config.searchDebounceTime);
            });
        }
        
        if (locationInput) {
            // Auto-complete suggestions could be added here
            locationInput.addEventListener('focus', this.showLocationSuggestions);
        }
        
        // Quick search buttons
        this.initQuickSearchButtons();
    },
    
    // Mobile-specific enhancements
    initMobileEnhancements() {
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
        
        // Mobile-optimized modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('shown.bs.modal', this.optimizeModalForMobile);
        });
        
        // Orientation change handling
        window.addEventListener('orientationchange', () => {
            setTimeout(this.handleOrientationChange, 100);
        });
    },
    
    // Accessibility enhancements
    initAccessibility() {
        // Keyboard navigation for cards
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Hospital card ${index + 1}`);
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const detailsButton = card.querySelector('.btn-outline-primary');
                    if (detailsButton) {
                        detailsButton.click();
                    }
                }
            });
        });
        
        // Screen reader announcements
        this.initScreenReaderAnnouncements();
        
        // High contrast mode detection
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        
        // Reduced motion support
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    },
    
    // Loading states management
    initLoadingStates() {
        // Form submission loading
        const submitButtons = document.querySelectorAll('button[type="submit"]');
        submitButtons.forEach(button => {
            const form = button.closest('form');
            if (form) {
                form.addEventListener('submit', () => {
                    this.showButtonLoading(button);
                });
            }
        });
        
        // Page loading indicator
        if (document.readyState === 'loading') {
            this.showPageLoading();
            window.addEventListener('load', this.hidePageLoading);
        }
    },
    
    // Event handlers
    handleMobileMenuToggle(e) {
        const target = e.currentTarget;
        const isExpanded = target.getAttribute('aria-expanded') === 'true';
        target.setAttribute('aria-expanded', !isExpanded);
    },
    
    handleFormSubmit(e) {
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Validate form before submission
        if (!this.validateForm(form)) {
            e.preventDefault();
            this.showFormErrors(form);
            return;
        }
        
        // Show loading state
        if (submitButton) {
            this.showButtonLoading(submitButton);
        }
        
        // Add timeout for loading state
        setTimeout(() => {
            if (submitButton) {
                this.hideButtonLoading(submitButton);
            }
        }, this.config.loadingTimeout);
    },
    
    handleFilterChange(e) {
        const filter = e.target;
        const form = filter.closest('form');
        
        if (form) {
            // Auto-submit form on filter change
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                this.showButtonLoading(submitButton);
                form.submit();
            }
        }
    },
    
    handleCardHover(e) {
        const card = e.currentTarget;
        card.style.transform = 'translateY(-5px)';
        card.style.transition = 'transform 0.3s ease';
    },
    
    handleCardLeave(e) {
        const card = e.currentTarget;
        card.style.transform = 'translateY(0)';
    },
    
    handleSmoothScroll(e) {
        const target = e.currentTarget;
        const href = target.getAttribute('href');
        
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    },
    
    handleSearchInput(query) {
        if (query.length < 2) return;
        
        // Could implement real-time search suggestions here
        console.log('Search query:', query);
    },
    
    handleOrientationChange() {
        // Recalculate layout on orientation change
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            this.optimizeModalForMobile.call(this, { target: modal });
        });
    },
    
    // Validation methods
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    validateField(field) {
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
                    isValid = this.isValidEmail(value);
                    errorMessage = isValid ? '' : 'Please enter a valid email address';
                    break;
                    
                case 'tel':
                    isValid = this.isValidPhone(value);
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
        if (name === 'patient_age' && value) {
            const age = parseInt(value);
            if (age < 0 || age > 150) {
                isValid = false;
                errorMessage = 'Please enter a valid age (0-150)';
            }
        }
        
        // Update field appearance
        this.updateFieldValidation(field, isValid, errorMessage);
        
        return isValid;
    },
    
    updateFieldValidation(field, isValid, errorMessage) {
        field.classList.remove('is-valid', 'is-invalid');
        
        if (isValid) {
            field.classList.add('is-valid');
        } else {
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
    },
    
    clearFieldError(field) {
        if (field.classList.contains('is-invalid') && field.value.trim()) {
            this.validateField(field);
        }
    },
    
    showFormErrors(form) {
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Show toast notification
        this.showToast('Please correct the errors in the form', 'error');
    },
    
    // Utility methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
    },
    
    formatPhoneNumber(e) {
        const input = e.target;
        let value = input.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        
        input.value = value;
    },
    
    validateEmail(e) {
        const input = e.target;
        this.validateField(input);
    },
    
    // Loading states
    showButtonLoading(button) {
        if (button.dataset.originalText) return; // Already loading
        
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Processing...
        `;
    },
    
    hideButtonLoading(button) {
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            button.disabled = false;
            delete button.dataset.originalText;
        }
    },
    
    showPageLoading() {
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
    },
    
    hidePageLoading() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.remove();
        }
    },
    
    // UI enhancements
    initQuickSearchButtons() {
        const quickSearchContainer = document.querySelector('.quick-search-buttons');
        if (quickSearchContainer) return; // Already initialized
        
        const searchForm = document.querySelector('form[action*="search"]');
        if (!searchForm) return;
        
        const quickSearches = [
            'Emergency Care',
            'Cardiology',
            'Pediatrics',
            'ICU Beds'
        ];
        
        const container = document.createElement('div');
        container.className = 'quick-search-buttons mt-3 d-flex flex-wrap gap-2';
        
        quickSearches.forEach(search => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-outline-primary btn-sm';
            button.textContent = search;
            button.addEventListener('click', () => {
                const diseaseSelect = searchForm.querySelector('select[name="disease_type"]');
                if (diseaseSelect) {
                    Array.from(diseaseSelect.options).forEach(option => {
                        if (option.text.includes(search)) {
                            option.selected = true;
                        }
                    });
                    searchForm.submit();
                }
            });
            container.appendChild(button);
        });
        
        searchForm.appendChild(container);
    },
    
    showLocationSuggestions() {
        // Placeholder for location auto-complete
        // Could integrate with a maps API for real suggestions
        console.log('Location suggestions could be shown here');
    },
    
    optimizeModalForMobile(e) {
        const modal = e.target;
        const modalDialog = modal.querySelector('.modal-dialog');
        
        if (window.innerWidth < 768) {
            modalDialog.style.margin = '1rem';
            modalDialog.style.maxWidth = 'calc(100% - 2rem)';
        }
    },
    
    initScreenReaderAnnouncements() {
        // Create live region for screen reader announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'screen-reader-announcements';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'visually-hidden';
        document.body.appendChild(liveRegion);
    },
    
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('screen-reader-announcements');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    },
    
    initBackToTop() {
        const backToTopButton = document.createElement('button');
        backToTopButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
        backToTopButton.className = 'btn btn-primary position-fixed bottom-0 end-0 m-3 rounded-circle';
        backToTopButton.style.display = 'none';
        backToTopButton.style.zIndex = '1000';
        backToTopButton.setAttribute('aria-label', 'Back to top');
        
        document.body.appendChild(backToTopButton);
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },
    
    showToast(message, type = 'info') {
        // Create toast notification
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Clean up after toast is hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    },
    
    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HospitalApp.init());
} else {
    HospitalApp.init();
}

// Export for potential external use
window.HospitalApp = HospitalApp;
