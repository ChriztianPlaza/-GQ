// Navigation Functions
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Animate hamburger bars
        const bars = hamburger.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            bar.style.transform = hamburger.classList.contains('active') 
                ? `rotate(${index === 0 ? '45deg' : index === 1 ? '0deg' : '-45deg'}) translate(${index === 1 ? '0px' : '5px'}, ${index === 0 ? '6px' : index === 1 ? '0px' : '-6px'})`
                : 'none';
            bar.style.opacity = index === 1 && hamburger.classList.contains('active') ? '0' : '1';
        });
    });
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Don't close menu for booking links - they'll be handled by phone verification
            if (!link.getAttribute('href').includes('#booking') && !link.classList.contains('book-btn')) {
                hamburger?.classList.remove('active');
                navMenu?.classList.remove('active');
                
                // Reset hamburger bars
                const bars = hamburger?.querySelectorAll('.bar');
                bars?.forEach(bar => {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                });
            }
        });
    });
    
    // Active navigation link highlight
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    // Only run animations on pages that have these elements
    const hasAnimatedElements = document.querySelector('.service-card, .promo-item, .about-text, .gallery-item');
    if (!hasAnimatedElements) {
        console.log('No animated elements found, skipping scroll animations');
        return;
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Special animations for different elements
                if (entry.target.classList.contains('service-card')) {
                    animateServiceCard(entry.target);
                }
                
                if (entry.target.classList.contains('stat-item')) {
                    animateCounter(entry.target);
                }
                
                if (entry.target.classList.contains('gallery-item')) {
                    animateGalleryItem(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(`
        .service-card, 
        .promo-item, 
        .about-text, 
        .about-image, 
        .gallery-item, 
        .booking-text, 
        .booking-form, 
        .contact-item,
        .stat-item
    `);
    
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Service Card Animation
function animateServiceCard(card) {
    const delay = Array.from(card.parentNode.children).indexOf(card) * 100;
    
    setTimeout(() => {
        card.style.transform = 'translateY(0)';
        card.style.opacity = '1';
        
        // Animate icon
        const icon = card.querySelector('.service-icon');
        if (icon) {
            setTimeout(() => {
                icon.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1)';
                }, 200);
            }, 300);
        }
    }, delay);
}

// Gallery Item Animation
function animateGalleryItem(item) {
    const delay = Array.from(item.parentNode.children).indexOf(item) * 50;
    
    setTimeout(() => {
        item.style.transform = 'scale(1)';
        item.style.opacity = '1';
    }, delay);
}

// Counter Animation
function animateCounter(statItem) {
    const numberElement = statItem.querySelector('.stat-number');
    if (!numberElement) return;
    
    const finalNumber = parseInt(numberElement.textContent);
    const duration = 2000;
    const increment = finalNumber / (duration / 16);
    let currentNumber = 0;
    
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= finalNumber) {
            numberElement.textContent = finalNumber + (numberElement.textContent.includes('★') ? '★' : '+');
            clearInterval(timer);
        } else {
            numberElement.textContent = Math.floor(currentNumber) + (numberElement.textContent.includes('★') ? '★' : '+');
        }
    }, 16);
}

// Initialize Counter
function initCounter() {
    // This will be triggered by the scroll animation observer
}

// Booking Form (Modified to work with phone verification)
function initBookingForm() {
    const bookingForm = document.getElementById('appointmentForm');
    
    // Check if user came from verification and pre-fill phone
    const urlHash = window.location.hash;
    if (urlHash === '#booking') {
        const verifiedPhone = localStorage.getItem('verifiedPhone');
        if (verifiedPhone) {
            const phoneInput = document.getElementById('phone');
            if (phoneInput) {
                phoneInput.value = verifiedPhone;
            }
            // Clear the verification data after use
            localStorage.removeItem('verifiedPhone');
            localStorage.removeItem('verificationPhone');
            localStorage.removeItem('verificationCode');
        }
        
        // Scroll to booking section
        setTimeout(() => {
            document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
    
    // Form submission
    bookingForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(bookingForm);
        const appointmentData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            date: formData.get('date'),
            time: formData.get('time')
        };
        
        // Validate form
        if (validateBookingForm(appointmentData)) {
            // Simulate booking process
            submitBooking(appointmentData);
        }
    });
    
    // Date input minimum date (today)
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    // Form field animations
    const formInputs = document.querySelectorAll('.form-group input, .form-group select');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });
}

// Validate Booking Form
function validateBookingForm(data) {
    const errors = [];
    
    if (!data.name.trim()) errors.push('Name is required');
    if (!data.phone.trim()) errors.push('Phone number is required');
    if (!data.service) errors.push('Please select a service');
    if (!data.date) errors.push('Please select a date');
    if (!data.time) errors.push('Please select a time');
    
    // Phone validation (Philippine format)
    const phoneRegex = /^(\+63|0)?[0-9]{10}$/;
    if (data.phone && !phoneRegex.test(data.phone.replace(/\s/g, ''))) {
        errors.push('Please enter a valid Philippine phone number');
    }
    
    // Date validation (today or up to 3 days ahead)
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));

    if (selectedDate < today) {
        errors.push('Please select today or a future date');
    } else if (selectedDate > maxDate) {
        errors.push('You can only book up to 3 days in advance');
    }
    
    if (errors.length > 0) {
        showMainErrorMessage(errors.join('\n'));
        return false;
    }
    
    return true;
}

// Submit Booking
function submitBooking(data) {
    // Show loading state
    const submitBtn = document.querySelector('.btn-full');
    if (!submitBtn) return;
    
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Show success modal
        showBookingModal();
        
        // Reset form
        document.getElementById('appointmentForm')?.reset();
        
        // Optional: Send data to actual booking system
        console.log('Booking data:', data);
        
    }, 2000);
}

// Show Error Message
function showMainErrorMessage(message) {
    // Create error toast
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Style the toast
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 5000);
    
    // Add CSS animations if not already added
    if (!document.querySelector('#toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Modal Functions
function initModal() {
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.close');
    
    // Close modal events
    closeBtn?.addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.style.display === 'block') {
            closeModal();
        }
    });
}

function showBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (!modal) return;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Animate modal content
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.animation = 'slideDown 0.3s ease';
    }
}

function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');
    
    if (modalContent) {
        modalContent.style.animation = 'slideUp 0.3s ease';
    }
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
    
    // Add slideUp animation if not exists
    if (!document.querySelector('#modal-animations')) {
        const style = document.createElement('style');
        style.id = 'modal-animations';
        style.textContent = `
            @keyframes slideUp {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-50px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Smooth Scroll
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]:not([href="#booking"])');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navbar = document.querySelector('.navbar');
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Image Lazy Loading
function initImageLazyLoading() {
    const images = document.querySelectorAll('img[src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Add loading animation
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                img.onload = () => {
                    img.style.opacity = '1';
                };
                
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Parallax Effect
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.hero-bg-image');
    
    window.addEventListener('scroll', () => {
        parallaxElements.forEach(el => {
            const scrolled = window.scrollY;
            el.style.transform = `translateY(${scrolled * 0.2}px)`;
        });
    });
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize functions based on the current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // Functions that run on all pages
    initNavigation();
    initModal();
    initSmoothScroll();
    initBookingRedirection();
    
    // Functions that only run on specific pages
    if (currentPage === 'index.html' || currentPage === '') {
        // Main page functions
        initScrollAnimations();
        initBookingForm();
        initCounter();
        initImageLazyLoading();
        initParallaxEffect();
    } else if (currentPage === 'booking-selection.html') {
        // Booking page functions
        initBookingSelection();
    } else if (currentPage === 'phone-verification.html') {
        // Phone verification page functions
        initPhoneVerificationPage();
    } else if (currentPage === 'otp-verification.html') {
        // OTP verification page functions
        initOTPVerificationPage();
    }
    
    console.log('Initialized functions for page:', currentPage);
});

// Booking Redirection System
function initBookingRedirection() {
    // More specific selectors to catch all booking buttons
    const bookButtons = document.querySelectorAll(`
        .book-online-btn, 
        .book-btn, 
        .nav-link[href="#booking"],
        button[class*="book"],
        a[class*="book"]
    `);
    
    console.log('Found booking buttons:', bookButtons.length); // Debug log
    
    bookButtons.forEach((btn, index) => {
        console.log(`Button ${index}:`, btn.className, btn.textContent); // Debug log
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Booking button clicked, redirecting...'); // Debug log
            
            // Redirect to phone verification page
            window.location.href = 'phone-verification.html';
        });
    });
    
    // Also check for buttons that might be added dynamically
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.book-online-btn, .book-btn, .nav-link[href="#booking"]');
        if (target) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Dynamic booking button clicked'); // Debug log
            window.location.href = 'phone-verification.html';
        }
    });
}

// Phone Verification Page Functions (for phone-verification.html)
function initPhoneVerificationPage() {
    const phoneForm = document.getElementById('phoneVerificationForm');
    const phoneInput = document.getElementById('phoneNumber');
    
    if (!phoneForm || !phoneInput) return;
    
    let verificationData = {
        phoneNumber: '',
        verificationCode: ''
    };
    
    // Focus on phone input
    phoneInput.focus();
    
    // Phone number input formatting
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        // Limit to 10 digits (Philippine mobile format without +63)
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        // Format as XXX XXX XXXX
        if (value.length >= 6) {
            value = value.substring(0, 3) + ' ' + value.substring(3, 6) + ' ' + value.substring(6);
        } else if (value.length >= 3) {
            value = value.substring(0, 3) + ' ' + value.substring(3);
        }
        
        e.target.value = value;
        
        // Validate Philippine mobile number
        const cleanNumber = value.replace(/\s/g, '');
        const isValid = /^9\d{9}$/.test(cleanNumber);
        
        const submitBtn = document.getElementById('sendCodeBtn');
        if (submitBtn) {
            submitBtn.disabled = !isValid;
            submitBtn.style.opacity = isValid ? '1' : '0.5';
        }
    });
    
    // Phone form submission
    phoneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phoneNumber = phoneInput.value.replace(/\s/g, '');
        
        if (validatePhoneNumber(phoneNumber)) {
            verificationData.phoneNumber = '+63' + phoneNumber;
            sendVerificationCodeAndRedirect(phoneNumber);
        }
    });
}

// OTP Verification Page Functions (for otp-verification.html)
function initOTPVerificationPage() {
    const otpForm = document.getElementById('otpVerificationForm');
    const resendCodeBtn = document.getElementById('resendCodeBtn');
    const verificationPhoneDisplay = document.getElementById('verificationPhoneDisplay');
    
    if (!otpForm) return;
    
    // Get phone number from localStorage or URL params
    const urlParams = new URLSearchParams(window.location.search);
    const phoneNumber = urlParams.get('phone') || localStorage.getItem('verificationPhone');
    const verificationCode = localStorage.getItem('verificationCode');
    
    if (phoneNumber && verificationPhoneDisplay) {
        const maskedPhone = phoneNumber.replace(/(\+63)(\d{3})(\d{3})(\d{4})/, '$1 $2 XXX $4');
        verificationPhoneDisplay.textContent = maskedPhone;
    }
    
    // Initialize OTP inputs
    initOTPInputs();
    
    // Focus on first OTP input
    const firstOTPInput = document.querySelector('.otp-input');
    if (firstOTPInput) {
        firstOTPInput.focus();
    }
    
    // Start resend timer
    startResendTimer();
    
    // OTP form submission
    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otpInputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        
        if (otp.length === 6) {
            verifyOTPAndRedirect(otp, verificationCode);
        }
    });
    
    // Resend code functionality
    resendCodeBtn?.addEventListener('click', () => {
        const cleanPhone = phoneNumber ? phoneNumber.substring(3) : '';
        if (cleanPhone) {
            sendVerificationCodeAndRedirect(cleanPhone, true);
        }
    });
}

function validatePhoneNumber(phoneNumber) {
    // Philippine mobile number validation (9XXXXXXXXX)
    const phoneRegex = /^9\d{9}$/;
    return phoneRegex.test(phoneNumber);
}

function sendVerificationCodeAndRedirect(phoneNumber, isResend = false) {
    const sendBtn = document.getElementById('sendCodeBtn');
    const btnText = sendBtn?.querySelector('.btn-text');
    const btnLoading = sendBtn?.querySelector('.btn-loading');
    
    if (sendBtn) {
        sendBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    }
    
    // Generate random 6-digit code for demo
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Verification code:', verificationCode); // For demo purposes
    
    // Store verification data
    localStorage.setItem('verificationPhone', '+63' + phoneNumber);
    localStorage.setItem('verificationCode', verificationCode);
    
    // Simulate sending verification code
    setTimeout(() => {
        if (sendBtn) {
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            sendBtn.disabled = false;
        }
        
        if (!isResend) {
            // Redirect to OTP verification page
            window.location.href = `otp-verification.html?phone=${encodeURIComponent('+63' + phoneNumber)}`;
        } else {
            showSuccessMessage('Verification code sent!');
            startResendTimer();
        }
        
        // In real implementation, you would call your SMS API here
        // sendSMS('+63' + phoneNumber, 'Your GQ Barbershop verification code is: ' + verificationCode);
        
    }, 2000);
}

function verifyOTPAndRedirect(otp, correctCode) {
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const btnText = verifyBtn?.querySelector('.btn-text');
    const btnLoading = verifyBtn?.querySelector('.btn-loading');
    const otpInputs = document.querySelectorAll('.otp-input');
    
    if (verifyBtn) {
        verifyBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    }
    
    // Simulate verification
    setTimeout(() => {
        if (otp === correctCode || otp === '123456') { // 123456 for demo
            // Success
            verifyBtn.classList.add('verification-success');
            btnLoading.innerHTML = '<i class="fas fa-check"></i> Verified!';
            
            // Store verified phone number for booking form
            const phoneNumber = localStorage.getItem('verificationPhone');
            localStorage.setItem('verifiedPhone', phoneNumber);
            
            setTimeout(() => {
                // Redirect to booking selection page
                window.location.href = 'booking-selection.html';
            }, 1500);
            
        } else {
            // Error
            otpInputs.forEach(input => {
                input.classList.add('error');
                input.value = '';
            });
            
            showErrorMessage('Invalid verification code. Please try again.');
            
            setTimeout(() => {
                otpInputs.forEach(input => {
                    input.classList.remove('error');
                });
                otpInputs[0].focus();
            }, 1000);
            
            if (verifyBtn) {
                verifyBtn.disabled = false;
                btnText.style.display = 'block';
                btnLoading.style.display = 'none';
            }
        }
    }, 1500);
}

function initOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Only allow numbers
            if (!/^\d$/.test(value) && value !== '') {
                e.target.value = '';
                return;
            }
            
            if (value) {
                input.classList.add('filled');
                
                // Auto-focus next input
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
                
                // Auto-submit when all fields are filled
                const allFilled = Array.from(otpInputs).every(inp => inp.value !== '');
                if (allFilled) {
                    setTimeout(() => {
                        document.getElementById('otpVerificationForm').dispatchEvent(new Event('submit'));
                    }, 100);
                }
            } else {
                input.classList.remove('filled');
            }
        });
        
        input.addEventListener('keydown', (e) => {
            // Handle backspace
            if (e.key === 'Backspace' && !input.value && index > 0) {
                otpInputs[index - 1].focus();
            }
            
            // Handle paste
            if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                navigator.clipboard.readText().then(text => {
                    const digits = text.replace(/\D/g, '').substring(0, 6);
                    digits.split('').forEach((digit, idx) => {
                        if (otpInputs[idx]) {
                            otpInputs[idx].value = digit;
                            otpInputs[idx].classList.add('filled');
                        }
                    });
                    
                    if (digits.length === 6) {
                        setTimeout(() => {
                            document.getElementById('otpVerificationForm').dispatchEvent(new Event('submit'));
                        }, 100);
                    }
                });
            }
        });
        
        input.addEventListener('focus', () => {
            input.classList.remove('error');
        });
    });
}

function startResendTimer() {
    const resendBtn = document.getElementById('resendCodeBtn');
    const resendTimer = document.getElementById('resendTimer');
    const timerCount = document.getElementById('timerCount');
    
    if (!resendBtn || !resendTimer || !timerCount) return;
    
    let timeLeft = 30;
    resendBtn.disabled = true;
    resendBtn.style.display = 'none';
    resendTimer.style.display = 'block';
    
    const timer = setInterval(() => {
        timeLeft--;
        timerCount.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            resendBtn.disabled = false;
            resendBtn.style.display = 'inline-flex';
            resendTimer.style.display = 'none';
        }
    }, 1000);
}

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// FIXED: Added the missing initStaffServiceAssignment function that was being called in HTML
function initStaffServiceAssignment() {
    // Initialize the booking selection system
    initBookingSelection();
}

// Booking Selection System with Service-Staff Pairing
function initBookingSelection() {
    let servicePairs = []; // Array of {services: [], staff: {}, assignmentId: number}
    let bookingData = {
        assignments: [],
        total: 0,
       
    };
    
   let bookedSlots = {
    // Format: 'YYYY-MM-DD-HH:MM-STAFF_ID': true
    '2025-06-16-10:00-carlos': true,
    '2025-06-16-14:00-luis': true,
    '2025-06-16-19:00-miguel': true,  // Evening slot
    '2025-06-17-11:00-miguel': true,
    '2025-06-17-15:00-maria': true,
    '2025-06-17-20:00-carlos': true   // Late evening slot
};
    
    // Initialize event listeners
    initStaffAssignmentManagement();
    initGetNumberButton();
    initDateTimeModal();
    
    function initStaffAssignmentManagement() {
        const addStaffBtn = document.getElementById('addStaffBtn');
        const deleteStaffBtn = document.getElementById('deleteStaffBtn');
        const staffServicesContainer = document.getElementById('staffServicesContainer');
        const getNumberBtn = document.getElementById('getNumberBtn');
        
        let assignmentCounter = 1;
        
        // Add new staff assignment
        addStaffBtn?.addEventListener('click', () => {
            assignmentCounter++;
            const newAssignment = createStaffAssignment(assignmentCounter);
            staffServicesContainer.appendChild(newAssignment);
            updateAssignmentsSummary();
        });
        
        // Remove last staff assignment
        deleteStaffBtn?.addEventListener('click', () => {
            const assignments = staffServicesContainer.querySelectorAll('.staff-services-assignment');
            if (assignments.length > 1) {
                assignments[assignments.length - 1].remove();
                updateAssignmentsSummary();
            }
        });
        
        // Get number button
        getNumberBtn?.addEventListener('click', () => {
            showDateTimeModal();
        });
        
        // Setup initial assignment
        setupStaffAssignment(staffServicesContainer.querySelector('.staff-services-assignment'));
    }
    
    function createStaffAssignment(id) {
        const assignmentDiv = document.createElement('div');
        assignmentDiv.className = 'staff-services-assignment';
        assignmentDiv.setAttribute('data-assignment-id', id);
        
        assignmentDiv.innerHTML = `
            <div class="assignment-header">
                <h4 class="assignment-title">Staff Assignment #${id}</h4>
            </div>
            
            <!-- Staff Selection -->
            <div class="staff-selection">
                <label class="assignment-label">Select Staff Member:</label>
                <div class="selector-dropdown">
                    <select class="staff-select">
                        <option value="">Choose staff member...</option>
                        <option value="miguel" data-type="barber">Miguel Santos - Master Barber</option>
                        <option value="carlos" data-type="barber">Carlos Rivera - Senior Barber</option>
                        <option value="luis" data-type="barber">Luis Garcia - Barber</option>
                        <option value="jose" data-type="barber">Jose Martinez - Barber</option>
                        <option value="ricardo" data-type="barber">Ricardo Dela Cruz - Barber</option>
                        <option value="antonio" data-type="barber">Antonio Ramos - Barber</option>
                        <option value="manuel" data-type="barber">Manuel Torres - Barber</option>
                        <option value="eduardo" data-type="barber">Eduardo Hernandez - Barber</option>
                        <option value="maria" data-type="manicurist">Maria Cruz - Manicurist</option>
                        <option value="any-barber" data-type="any">Any Available Barber</option>
                    
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                </div>
            </div>
            
            <!-- Services for this Staff -->
            <div class="services-for-staff">
                <div class="services-header">
                    <label class="assignment-label">Services for this staff member:</label>
                    <div class="service-actions">
                        <button class="service-action-btn add-service" data-assignment="${id}">
                            <i class="fas fa-plus"></i>
                            Add Service
                        </button>
                    </div>
                </div>
                
                <div class="services-list" data-assignment="${id}">
                    <div class="service-item" data-service-id="1">
                        <div class="selector-dropdown">
                            <select class="service-select">
                                <option value="">Choose a service...</option>
                                <!-- FIXED: Added consistent data attributes for all service options -->
                                <option value="haircut" data-price="300">Haircut - ₱300 </option>
                                <option value="haircut-shampoo" data-price="370">Haircut with Shampoo - ₱370 </option>
                                <option value="hair-spa" data-price="400"> Hair Spa - ₱400 </option>
                                <option value="hair-treatment" data-price="550" >Hair Treatment/Amino Mint - ₱550 </option>
                                <option value="scalp-therapy" data-price="500" >Scalp Therapy/Walnut Extract - ₱500 </option>
                                <option value="hair-color-regular" data-price="900" data-duration=>Hair Color (Regular) - ₱900</option>
                                <option value="hair-color-schwarzkopf" data-price="900">Hair Color (Schwarzkopf) - ₱900</option>
                                <option value="manicure" data-price="250">Manicure - ₱250 </option>
                                <option value="pedicure" data-price="300">Pedicure - ₱300</option>
                                <option value="foot-spa" data-price="400">Foot Spa - ₱400</option>
                                <option value="shampoo-blowdry" data-price="350">Shampoo/Blowdry - ₱350</option>
                                <option value="facial" data-price="450" >Facial - ₱450</option>
                                <option value="shave" data-price="280" >Shave - ₱280</option>
                                <option value="package-haircut-spa" data-price="670">Package: Haircut + Hair Spa - ₱670</option>
                                <option value="package-haircut-amino" data-price="820" >Package: Haircut + Amino Mint - ₱820</option>
                                <option value="package-haircut-scalp" data-price="820">Package: Haircut + Scalp Therapy -</option>
                                <option value="package-haircut-spa-facial" data-price="1070">Package: Haircut + Hair Spa + Facial - ₱1,070</option>
                                <option value="package-haircut-amino-facial" data-price="1220">Package: Haircut + Amino Mint + Facial - ₱1,220</option>
                                <option value="package-haircut-scalp-facial" data-price="1220">Package: Haircut + Scalp Therapy + Facial - ₱1,220</option>
                                <option value="package-haircut-color-spa" data-price="1170">Package: Haircut + Hair Color + Hair Spa - ₱1,170</option>
                                <option value="package-haircut-color-amino" data-price="1270">Package: Haircut + Hair Color + Amino Mint - ₱1,270</option>
                                <option value="package-haircut-color-scalp" data-price="1270">Package: Haircut + Hair Color + Scalp Therapy - ₱1,270</option>
                                <option value="package-mani-pedi" data-price="500">Package: Manicure + Pedicure - ₱500</option>
                                <option value="package-foot-spa-pedicure" data-price="650">Package: Foot Spa + Pedicure - ₱650</option>
                                <option value="package-foot-spa-mani-pedi" data-price="900">Package: Foot Spa + Manicure + Pedicure - ₱900</option>
                                <option value="package-haircut-color-schwarzkopf" data-price="1120">Package: Haircut + Hair Color (Schwarzkopf) - ₱1,120</option>
                            </select>
                            <i class="fas fa-chevron-down dropdown-icon"></i>
                        </div>
                        <button class="service-action-btn remove-service" data-assignment="${id}" data-service="1">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Assignment Summary -->
            <div class="assignment-summary">
                <div class="summary-content">
                    <span class="summary-label">Services assigned:</span>
                    <span class="services-count">0 services</span>
                    <span class="services-total">₱0</span>
                </div>
            </div>
        `;
        
        setupStaffAssignment(assignmentDiv);
        return assignmentDiv;
    }
    
    function setupStaffAssignment(assignmentElement) {
        const staffSelect = assignmentElement.querySelector('.staff-select');
        const addServiceBtn = assignmentElement.querySelector('.add-service');
        const servicesList = assignmentElement.querySelector('.services-list');
        
        // FIXED: Added event listener for staff selection change
        staffSelect.addEventListener('change', () => {
            console.log('Staff changed:', staffSelect.value);
            filterServicesBasedOnStaff(assignmentElement);
            updateAssignmentsSummary();
        });
        
        // Add service button
        addServiceBtn.addEventListener('click', () => {
            const assignmentId = assignmentElement.getAttribute('data-assignment-id');
            addServiceToAssignment(assignmentId, servicesList);
        });
        
        setupServiceItems(assignmentElement);

        // Apply initial filtering
        filterServicesBasedOnStaff(assignmentElement);
    }
    
    function setupServiceItems(assignmentElement) {
        const serviceItems = assignmentElement.querySelectorAll('.service-item');
        
        serviceItems.forEach(serviceItem => {
            const serviceSelect = serviceItem.querySelector('.service-select');
            const removeBtn = serviceItem.querySelector('.remove-service');
            
            // FIXED: Added event listener for service selection change
            serviceSelect.addEventListener('change', () => {
                console.log('Service changed:', serviceSelect.value); // Debug log
                updateAssignmentsSummary();
            });
            
            // Remove service button
            removeBtn.addEventListener('click', () => {
                const servicesList = serviceItem.parentElement;
                if (servicesList.children.length > 1) {
                    serviceItem.remove();
                    updateAssignmentsSummary();
                }
            });
        });
    }
    
    function addServiceToAssignment(assignmentId, servicesList) {
        const serviceCount = servicesList.children.length;
        const newServiceId = serviceCount + 1;
        
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';
        serviceItem.setAttribute('data-service-id', newServiceId);
        
        serviceItem.innerHTML = `
            <div class="selector-dropdown">
                <select class="service-select">
                    <option value="">Choose a service...</option>
                    <!-- FIXED: Added consistent data attributes for all service options -->
                    <option value="haircut" data-price="300">Haircut - ₱300</option>
                    <option value="haircut-shampoo" data-price="370">Haircut with Shampoo - ₱370</option>
                    <option value="hair-spa" data-price="400">Hair Spa - ₱400</option>
                    <option value="hair-treatment" data-price="550">Hair Treatment/Amino Mint - ₱550</option>
                    <option value="scalp-therapy" data-price="500">Scalp Therapy/Walnut Extract - ₱500</option>
                    <option value="hair-color-regular" data-price="900">Hair Color (Regular) - ₱900</option>
                    <option value="hair-color-schwarzkopf" data-price="900">Hair Color (Schwarzkopf) - ₱900</option>
                    <option value="manicure" data-price="250">Manicure - ₱250</option>
                    <option value="pedicure" data-price="300">Pedicure - ₱300</option>
                    <option value="foot-spa" data-price="400">Foot Spa - ₱400</option>
                    <option value="shampoo-blowdry" data-price="350">Shampoo/Blowdry - ₱350</option>
                    <option value="facial" data-price="450">Facial - ₱450</option>
                    <option value="shave" data-price="280">Shave - ₱280</option>
                    <option value="package-haircut-spa" data-price="670">Package: Haircut + Hair Spa - ₱670</option>
                    <option value="package-haircut-amino" data-price="820">Package: Haircut + Amino Mint - ₱820</option>
                    <option value="package-haircut-scalp" data-price="820">Package: Haircut + Scalp Therapy - ₱820</option>
                    <option value="package-haircut-spa-facial" data-price="1070">Package: Haircut + Hair Spa + Facial - ₱1,070</option>
                    <option value="package-haircut-amino-facial" data-price="1220">Package: Haircut + Amino Mint + Facial - ₱1,220</option>
                    <option value="package-haircut-scalp-facial" data-price="1220">Package: Haircut + Scalp Therapy + Facial - ₱1,220</option>
                    <option value="package-haircut-color-spa" data-price="1170">Package: Haircut + Hair Color + Hair Spa - ₱1,170</option>
                    <option value="package-haircut-color-amino" data-price="1270">Package: Haircut + Hair Color + Amino Mint - ₱1,270</option>
                    <option value="package-haircut-color-scalp" data-price="1270">Package: Haircut + Hair Color + Scalp Therapy - ₱1,270</option>
                    <option value="package-mani-pedi" data-price="500">Package: Manicure + Pedicure - ₱500</option>
                    <option value="package-foot-spa-pedicure" data-price="650">Package: Foot Spa + Pedicure - ₱650</option>
                    <option value="package-foot-spa-mani-pedi" data-price="900">Package: Foot Spa + Manicure + Pedicure - ₱900</option>
                    <option value="package-haircut-color-schwarzkopf" data-price="1120">Package: Haircut + Hair Color (Schwarzkopf) - ₱1,120</option>
                </select>
                <i class="fas fa-chevron-down dropdown-icon"></i>
            </div>
            <button class="service-action-btn remove-service" data-assignment="${assignmentId}" data-service="${newServiceId}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        servicesList.appendChild(serviceItem);
        
       // Setup event listeners for new service item
        const serviceSelect = serviceItem.querySelector('.service-select');
        const removeBtn = serviceItem.querySelector('.remove-service');

        // Get the assignment element directly
        const assignmentElement = servicesList.closest('.staff-services-assignment');
        filterServicesBasedOnStaff(assignmentElement);

        // FIXED: Added event listener for service selection change
        serviceSelect.addEventListener('change', () => {
            console.log('New service changed:', serviceSelect.value);
            updateAssignmentsSummary();
        });
        removeBtn.addEventListener('click', () => {
            if (servicesList.children.length > 1) {
                serviceItem.remove();
                updateAssignmentsSummary();
            }
        });
    }
    
    function filterServicesBasedOnStaff(assignmentElement) {
    const staffSelect = assignmentElement.querySelector('.staff-select');
    const serviceSelects = assignmentElement.querySelectorAll('.service-select');
    
    if (!staffSelect.value) {
        // No staff selected, enable all services
        serviceSelects.forEach(select => {
            Array.from(select.options).forEach(option => {
                option.disabled = false;
                option.style.display = '';
            });
        });
        return;
    }
    
    const selectedStaff = staffSelect.selectedOptions[0];
    const staffType = selectedStaff.dataset.type;
    
    // Define service categories
    const barberServices = [
        'haircut', 'haircut-shampoo', 'hair-spa', 'hair-treatment', 'scalp-therapy',
        'hair-color-regular', 'hair-color-schwarzkopf', 'shampoo-blowdry', 'facial', 'shave',
        // Hair-focused packages
        'package-haircut-spa', 'package-haircut-amino', 'package-haircut-scalp',
        'package-haircut-spa-facial', 'package-haircut-amino-facial', 'package-haircut-scalp-facial',
        'package-haircut-color-spa', 'package-haircut-color-amino', 'package-haircut-color-scalp',
        'package-haircut-color-schwarzkopf'
    ];
    
    const manicuristServices = [
        'manicure', 'pedicure', 'foot-spa',
        // Hand and foot care packages
        'package-mani-pedi', 'package-foot-spa-pedicure', 'package-foot-spa-mani-pedi'
    ];
    
    serviceSelects.forEach(select => {
        Array.from(select.options).forEach(option => {
            if (option.value === '') {
                // Keep the placeholder option
                option.disabled = false;
                option.style.display = '';
                return;
            }
            
            const serviceId = option.value;
            let shouldShow = false;
            
            if (staffType === 'barber') {
                shouldShow = barberServices.includes(serviceId);
            } else if (staffType === 'manicurist') {
                shouldShow = manicuristServices.includes(serviceId);
            } else if (staffType === 'any') {
                // Check the specific staff ID for "any" type staff
                const staffId = staffSelect.value;
                if (staffId === 'any-barber') {
                    // Any Available Barber - only barber services
                    shouldShow = barberServices.includes(serviceId);
                } else {
                    // Fallback - show all services
                    shouldShow = true;
                }
            }
            
            if (shouldShow) {
                option.disabled = false;
                option.style.display = '';
            } else {
                option.disabled = true;
                option.style.display = 'none';
                // Clear selection if currently selected service is not available
                if (select.value === serviceId) {
                    select.value = '';
                }
            }
        });
    });
    
    console.log('Filtered services for staff:', staffSelect.value, 'type:', staffType);
}
    
    // FIXED: Complete updateAssignmentsSummary function with proper calculations
    function updateAssignmentsSummary() {
        console.log('Updating assignments summary...'); // Debug log
        
        const allAssignments = document.querySelectorAll('.staff-services-assignment');
        
        servicePairs = [];
        let totalPrice = 0;
        
        
        allAssignments.forEach((assignmentElement) => {
            const staffSelect = assignmentElement.querySelector('.staff-select');
            const serviceItems = assignmentElement.querySelectorAll('.service-item');
            const assignmentId = assignmentElement.getAttribute('data-assignment-id');
            
            // Only process assignments with staff selected
            if (staffSelect.value) {
                const staffOption = staffSelect.selectedOptions[0];
                const staff = {
                    id: staffSelect.value,
                    name: staffOption.textContent,
                    type: staffOption.dataset.type
                };
                
                const services = [];
                let assignmentPrice = 0;
                
                
                serviceItems.forEach(serviceItem => {
                    const serviceSelect = serviceItem.querySelector('.service-select');
                    if (serviceSelect.value) {
                        const serviceOption = serviceSelect.selectedOptions[0];
                        const service = {
                            id: serviceSelect.value,
                            name: serviceOption.textContent.split(' - ')[0],
                            price: parseInt(serviceOption.dataset.price),
                            
                        };
                        services.push(service);
                        assignmentPrice += service.price;
                        
                        
                        console.log('Added service:', service); // Debug log
                    }
                });
                
                if (services.length > 0) {
                    const assignment = {
                        assignmentId: parseInt(assignmentId),
                        staff: staff,
                        services: services,
                        totalPrice: assignmentPrice,
                        
                    };
                    
                    servicePairs.push(assignment);
                    totalPrice += assignmentPrice;
                    
                    
                    console.log('Added assignment:', assignment); // Debug log
                }
                
                // Update individual assignment summary
                updateIndividualAssignmentSummary(assignmentElement, services.length, assignmentPrice);
            } else {
                // Clear individual assignment summary if no staff selected
                updateIndividualAssignmentSummary(assignmentElement, 0, 0);
            }
        });
        
        // Update UI
        updateAssignmentsDisplay();
        updateTotalDisplay(totalPrice);
        
        // Enable/disable get number button
        const hasCompleteAssignments = servicePairs.length > 0;
        const getNumberBtn = document.getElementById('getNumberBtn');
        if (getNumberBtn) {
            getNumberBtn.disabled = !hasCompleteAssignments;
            console.log('Get number button enabled:', hasCompleteAssignments); // Debug log
        }
        
        // Store booking data
        bookingData.assignments = servicePairs;
        bookingData.total = totalPrice;
        
        
        console.log('Final booking data:', bookingData); // Debug log
    }
    
    function updateIndividualAssignmentSummary(assignmentElement, serviceCount, totalPrice) {
        const servicesCount = assignmentElement.querySelector('.services-count');
        const servicesTotal = assignmentElement.querySelector('.services-total');
        
        if (servicesCount) {
            servicesCount.textContent = `${serviceCount} service${serviceCount !== 1 ? 's' : ''}`;
        }
        if (servicesTotal) {
            servicesTotal.textContent = `₱${totalPrice}`;
        }
    }
    
    function updateAssignmentsDisplay() {
        const summaryAssignments = document.getElementById('summaryAssignments');
        
        if (!summaryAssignments) return;
        
        if (servicePairs.length === 0) {
            summaryAssignments.innerHTML = '<p class="no-selection">No staff assignments made</p>';
        } else {
            summaryAssignments.innerHTML = `
                <h4>Staff Assignments:</h4>
                ${servicePairs.map(assignment => `
                    <div class="summary-assignment-item">
                        <div class="assignment-staff">${assignment.staff.name.split(' - ')[0]}</div>
                        <div class="assignment-services">
                            ${assignment.services.map(service => `
                                <div class="assignment-service">${service.name}</div>
                            `).join('')}
                        </div>
                        <div class="assignment-total">₱${assignment.totalPrice}</div>
                    </div>
                `).join('')}
            `;
        }
    }
    
    function updateTotalDisplay(price, duration) {
        const totalAmount = document.getElementById('totalAmount');
        
        
        if (totalAmount) {
            totalAmount.textContent = `₱${price}`;
        }
        
    }
    
    function initGetNumberButton() {
        const getNumberBtn = document.getElementById('getNumberBtn');
        
        if (getNumberBtn) {
            getNumberBtn.addEventListener('click', () => {
                showDateTimeModal();
            });
        }
    }
    
    function initDateTimeModal() {
        const dateTimeModal = document.getElementById('dateTimeModal');
        const closeModal = document.getElementById('closeModal');
        const appointmentDate = document.getElementById('appointmentDate');
        const confirmBooking = document.getElementById('confirmBooking');
        
        if (!dateTimeModal || !closeModal || !appointmentDate || !confirmBooking) {
            return;
        }
        
        // Set minimum date (today)
        const today = new Date();
        // Reset time to start of day to avoid timezone issues
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const minDate = `${yyyy}-${mm}-${dd}`;
        appointmentDate.min = minDate;

        // Set maximum date (3 days from today)
        const maxDate = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
        appointmentDate.max = maxDate.toISOString().split('T')[0];

        // Add helpful console log
        console.log('Booking dates available from:', appointmentDate.min, 'to:', appointmentDate.max);
        
        closeModal.addEventListener('click', hideDateTimeModal);
        
        appointmentDate.addEventListener('change', () => {
            generateTimeSlots();
        });
        
        confirmBooking.addEventListener('click', () => {
            processBooking();
        });
        
        // Close modal when clicking outside
        dateTimeModal.addEventListener('click', (e) => {
            if (e.target === dateTimeModal) {
                hideDateTimeModal();
            }
        });
    }
    
    function showDateTimeModal() {
        const dateTimeModal = document.getElementById('dateTimeModal');
        if (dateTimeModal) {
            dateTimeModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function hideDateTimeModal() {
        const dateTimeModal = document.getElementById('dateTimeModal');
        if (dateTimeModal) {
            dateTimeModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Reset selections
            const appointmentDate = document.getElementById('appointmentDate');
            const timeSlots = document.getElementById('timeSlots');
            const confirmBooking = document.getElementById('confirmBooking');
            
            if (appointmentDate) appointmentDate.value = '';
            if (timeSlots) timeSlots.innerHTML = '';
            if (confirmBooking) confirmBooking.disabled = true;
        }
    }
    
    function generateTimeSlots() {
        const selectedDate = document.getElementById('appointmentDate').value;
        const timeSlotsContainer = document.getElementById('timeSlots');
        const confirmBtn = document.getElementById('confirmBooking');
        
        if (!selectedDate || !timeSlotsContainer || !confirmBtn) return;
        
        // Generate time slots from 10 AM to 8:30 PM
        const timeSlots = [
            '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
            '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
            '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
            '19:00', '19:30', '20:00', '20:30'
        ];
        
        timeSlotsContainer.innerHTML = '';
        
        timeSlots.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = formatTime(time);
            slot.dataset.time = time;
            
            // Check availability
            const isAvailable = checkSlotAvailability(selectedDate, time);
            
            if (isAvailable) {
                slot.classList.add('available');
                slot.addEventListener('click', () => selectTimeSlot(slot));
            } else {
                slot.classList.add('unavailable');
            }
            
            timeSlotsContainer.appendChild(slot);
        });
        
        confirmBtn.disabled = true;
    }
    
    function checkSlotAvailability(date, time) {
        // Check if any staff member in assignments is booked at this time
        for (const assignment of servicePairs) {
            const slotKey = `${date}-${time}-${assignment.staff.id}`;
            if (bookedSlots[slotKey]) {
                return false;
            }
        }
        return true;
    }
    
    function selectTimeSlot(selectedSlot) {
        // Remove previous selections
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Select current slot
        selectedSlot.classList.add('selected');
        bookingData.time = selectedSlot.dataset.time;
        bookingData.date = document.getElementById('appointmentDate').value;
        
        // Enable confirm button
        const confirmBooking = document.getElementById('confirmBooking');
        if (confirmBooking) {
            confirmBooking.disabled = false;
        }
    }
    
    function formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours < 12 ? 'AM' : 'PM';
        return `${hour12}:${minutes} ${ampm}`;
    }
    
    function processBooking() {
        if (!servicePairs || servicePairs.length === 0) {
            showErrorToast('Please complete at least one staff assignment', 'error');
            return;
        }
        
        // Generate unique queue number
        const queueNumber = generateQueueNumber();
        
        // Mark slots as booked for all staff in assignments
        servicePairs.forEach(assignment => {
            const slotKey = `${bookingData.date}-${bookingData.time}-${assignment.staff.id}`;
            bookedSlots[slotKey] = true;
        });
        
        // Create booking object with assignment data
        const booking = {
            queueNumber: queueNumber,
            assignments: servicePairs,
            date: bookingData.date,
            time: bookingData.time,
            total: bookingData.total,
            
            phone: localStorage.getItem('verifiedPhone'),
            timestamp: new Date().toISOString(),
            status: 'confirmed',
            type: 'online'
        };
        
        // Store booking in localStorage
        localStorage.setItem(`booking_${queueNumber}`, JSON.stringify(booking));
        
        // Show confirmation
        showBookingConfirmation(booking);
        
        // Hide date/time modal
        hideDateTimeModal();
    }
    
    function generateQueueNumber() {
        // Generate format: GQ-YYYYMMDD-XXX (where XXX is random 3-digit number)
        const date = new Date();
        const dateStr = date.getFullYear().toString() + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + 
                       date.getDate().toString().padStart(2, '0');
        const randomNum = Math.floor(Math.random() * 900) + 100;
        
        return `GQ-${dateStr}-${randomNum}`;
    }
    
    function showBookingConfirmation(booking) {
        const confirmationModal = document.getElementById('confirmationModal');
        
        if (!confirmationModal) return;
        
        // Update confirmation details
        const queueNumber = document.getElementById('queueNumber');
        const confirmedDate = document.getElementById('confirmedDate');
        const confirmedTime = document.getElementById('confirmedTime');
        const confirmedServices = document.getElementById('confirmedServices');
        const confirmedStaff = document.getElementById('confirmedStaff');
        const confirmedTotal = document.getElementById('confirmedTotal');
        
        if (queueNumber) queueNumber.textContent = booking.queueNumber;
        if (confirmedDate) confirmedDate.textContent = formatDate(booking.date);
        if (confirmedTime) confirmedTime.textContent = formatTime(booking.time);
        
        // Format services and staff from assignments
        let servicesText = 'No services selected';
        let staffText = 'No staff selected';
        
        if (booking.assignments && booking.assignments.length > 0) {
            const allServices = [];
            const allStaff = [];
            
            booking.assignments.forEach(assignment => {
                assignment.services.forEach(service => {
                    allServices.push(service.name);
                });
                allStaff.push(assignment.staff.name.split(' - ')[0]);
            });
            
            servicesText = allServices.join(', ');
            staffText = allStaff.join(', ');
        }
        
        if (confirmedServices) confirmedServices.textContent = servicesText;
        if (confirmedStaff) confirmedStaff.textContent = staffText;
        if (confirmedTotal) confirmedTotal.textContent = `₱${booking.total}`;
        
        // Show modal
        confirmationModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    function showErrorToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = `error-toast ${type}`;
        
        const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
        const bgColor = type === 'error' ? '#e74c3c' : '#27ae60';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            font-weight: 500;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
        
        // Add CSS animations if not already added
        if (!document.querySelector('#toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // FIXED: Initialize the system by calling updateAssignmentsSummary to setup initial state
    updateAssignmentsSummary();
}