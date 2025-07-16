// Debug logging
console.log('Store script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing store landing...');
    initStoreLanding();
    
    // Additional debug - check if elements exist
    const walkIn = document.getElementById('walkInOption');
    const online = document.getElementById('onlineOption');
    console.log('Walk-in button found:', !!walkIn);
    console.log('Online button found:', !!online);
});
// Enhanced Service Filtering System for Store Booking Selection

// Define staff categories and their allowed services
const BARBER_STAFF_IDS = [
    "miguel", "carlos", "luis", "jose", "ricardo", "antonio", "manuel", "eduardo", "any-barber"
];

const MANICURIST_STAFF_IDS = ["maria"];

// Define which services are for barbers (including hair/scalp services and special promos)
const BARBER_SERVICE_VALUES = [
    // Basic hair services
    "haircut", 
    "haircut-shampoo", 
    "hair-spa", 
    "hair-treatment-amino", 
    "scalp-therapy",
    "hair-color-regular", 
    "hair-color-schwarzkopf", 
    "shampoo-blowdry", 
    "facial", 
    "shave",
    
    // Hair + Treatment combinations
    "haircut-hair-spa", 
    "haircut-amino-mint", 
    "haircut-scalp-therapy", 
    
    // Hair + Treatment + Facial combinations
    "haircut-hair-spa-facial",
    "haircut-amino-mint-facial", 
    "haircut-scalp-therapy-facial", 
    
    // Hair + Color + Treatment combinations
    "haircut-hair-color-regular-hair-spa",
    "haircut-hair-color-regular-amino-mint", 
    "haircut-hair-color-regular-scalp-therapy",
    "haircut-hair-color-schwarzkopf-hair-spa", 
    "haircut-hair-color-schwarzkopf-amino-mint",
    "haircut-hair-color-schwarzkopf-scalp-therapy", 
    
    // Hair + Color combinations
    "haircut-hair-color-regular", 
    "haircut-hair-color-schwarzkopf"
];

// Define which services are for manicurist (including hand/foot care special promos)
const MANICURIST_SERVICE_VALUES = [
    // Basic hand and foot services
    "manicure", 
    "pedicure", 
    "foot-spa", 
    
    // Hand and foot care special promos
    "manicure-pedicure", 
    "foot-spa-pedicure", 
    "foot-spa-manicure-pedicure"
];

// Virtual Keyboard System
class VirtualKeyboard {
    constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.keyboard = document.getElementById(options.keyboardId || 'virtualKeyboard');
        this.isVisible = false;
        this.maxLength = options.maxLength || 20;
        this.numbersOnly = options.numbersOnly || false;
        this.currentValue = '';
        
        this.init();
    }
    
    init() {
        if (!this.keyboard || !this.input) return;
        
        // Show keyboard when input is clicked
        this.input.addEventListener('click', () => {
            this.show();
        });
        
        // Hide keyboard when close button is clicked
        const closeBtn = this.keyboard.querySelector('.keyboard-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }
        
        // Handle key presses
        const keys = this.keyboard.querySelectorAll('.keyboard-key');
        keys.forEach(key => {
            key.addEventListener('click', () => {
                this.handleKeyPress(key.dataset.key);
            });
        });
        
        // Hide keyboard when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isVisible && 
                !this.keyboard.contains(e.target) && 
                !this.input.contains(e.target)) {
                this.hide();
            }
        });
    }
    
    show() {
        this.keyboard.classList.add('active');
        this.isVisible = true;
        this.currentValue = this.input.value;
    }
    
    hide() {
        this.keyboard.classList.remove('active');
        this.isVisible = false;
    }
    
    handleKeyPress(key) {
        switch (key) {
            case 'backspace':
                if (this.input.classList.contains('store-otp-input')) {
                    // Special handling for OTP inputs
                    const otpInputs = document.querySelectorAll('.store-otp-input');
                    const currentIndex = Array.from(otpInputs).indexOf(this.input);
                    
                    if (this.input.value) {
                        // Clear current input
                        this.input.value = '';
                        this.input.classList.remove('filled');
                        this.currentValue = '';
                    } else if (currentIndex > 0) {
                        // Move to previous input and clear it
                        const prevInput = otpInputs[currentIndex - 1];
                        prevInput.value = '';
                        prevInput.classList.remove('filled');
                        this.input = prevInput;
                        this.currentValue = '';
                        
                        // Update the virtual keyboard to focus on the previous input
                        const otpKeyboard = document.getElementById('otpVirtualKeyboard');
                        if (otpKeyboard && otpKeyboard.classList.contains('active')) {
                            // The keyboard is already showing, just update the focus
                            prevInput.focus();
                        }
                    }
                } else {
                    // Regular input handling
                    this.currentValue = this.currentValue.slice(0, -1);
                    this.input.value = this.currentValue;
                }
                break;
            case 'done':
                this.hide();
                // Trigger input event for validation
                this.input.dispatchEvent(new Event('input'));
                return;
            case ' ':
                if (this.currentValue.length < this.maxLength) {
                    this.currentValue += ' ';
                    this.input.value = this.currentValue;
                }
                break;
            default:
                if (this.numbersOnly && !/\d/.test(key)) {
                    return;
                }
                
                if (this.input.classList.contains('store-otp-input')) {
                    // Special handling for OTP inputs - only one digit per field
                    this.input.value = key;
                    this.currentValue = key;
                    this.input.classList.add('filled');
                    
                    // Auto-advance to next OTP input
                    const otpInputs = document.querySelectorAll('.store-otp-input');
                    const currentIndex = Array.from(otpInputs).indexOf(this.input);
                    
                    if (currentIndex < otpInputs.length - 1) {
                        const nextInput = otpInputs[currentIndex + 1];
                        this.input = nextInput;
                        this.currentValue = nextInput.value;
                        // Don't hide keyboard, just switch to next input
                    } else {
                        // Last input filled, hide keyboard
                        this.hide();
                        // Check if all inputs are filled for auto-submit
                        const allFilled = Array.from(otpInputs).every(inp => inp.value !== '');
                        if (allFilled) {
                            setTimeout(() => {
                                document.getElementById('storeOtpVerificationForm').dispatchEvent(new Event('submit'));
                            }, 100);
                        }
                    }
                } else {
                    // Regular input handling
                    if (this.currentValue.length < this.maxLength) {
                        this.currentValue += key;
                        this.input.value = this.currentValue;
                    }
                }
                break;
        }
        
        // Trigger input event for validation (except for OTP inputs which handle it differently)
        if (!this.input.classList.contains('store-otp-input')) {
            this.input.dispatchEvent(new Event('input'));
        }
        
        // Add visual feedback
        const keyElement = this.keyboard.querySelector(`[data-key="${key}"]`);
        if (keyElement) {
            keyElement.style.transform = 'scale(0.95)';
            keyElement.style.background = 'var(--accent-gold)';
            keyElement.style.color = 'var(--white)';
            setTimeout(() => {
                keyElement.style.transform = '';
                keyElement.style.background = '';
                keyElement.style.color = '';
            }, 150);
        }
    }
}

let staffAssignments = [];
let bookingData = {
    assignments: [],
    total: 0
};

// Enhanced filtering function
function filterServiceOptionsForStaff(assignmentDiv, staffId) {
    const serviceSelects = assignmentDiv.querySelectorAll('.service-select');
    
    serviceSelects.forEach(select => {
        // Get all options
        const options = Array.from(select.options);
        
        options.forEach(option => {
            // Always show the default "Choose a service..." option
            if (!option.value || option.value === "") {
                option.hidden = false;
                option.disabled = false;
                return;
            }
            
            let shouldShow = false;
            
            if (BARBER_STAFF_IDS.includes(staffId)) {
                // Show only barber/hair services for barber staff
                shouldShow = BARBER_SERVICE_VALUES.includes(option.value);
            } else if (MANICURIST_STAFF_IDS.includes(staffId)) {
                // Show only hand and foot care services for manicurist
                shouldShow = MANICURIST_SERVICE_VALUES.includes(option.value);
            } else {
                // If no staff selected, hide all service options
                shouldShow = false;
            }
            
            option.hidden = !shouldShow;
            option.disabled = !shouldShow;
        });
        
        // Reset selection if current option is now hidden/disabled
        const currentOption = select.selectedOptions[0];
        if (currentOption && (currentOption.hidden || currentOption.disabled)) {
            select.value = "";
            // Trigger change event to update summary
            select.dispatchEvent(new Event('change'));
        }
    });
}
function updateStoreBookingSummary() {
    console.log('=== UPDATING SUMMARY ===');
    
    const allAssignments = document.querySelectorAll('.staff-assignment');
    staffAssignments = [];
    let totalPrice = 0;

    allAssignments.forEach((assignmentElement) => {
        const assignmentId = assignmentElement.getAttribute('data-assignment-id');
        const staffSelect = assignmentElement.querySelector('.staff-select');
        const serviceSelects = assignmentElement.querySelectorAll('.service-select');
        
        console.log('Checking assignment:', assignmentId, 'Staff:', staffSelect?.value);

        if (staffSelect && staffSelect.value) {
            const staffOption = staffSelect.selectedOptions[0];
            const assignment = {
                assignmentId: parseInt(assignmentId),
                staffId: staffSelect.value,
                staffName: staffOption.dataset.name,
                services: []
            };

            let assignmentTotal = 0;

            serviceSelects.forEach(serviceSelect => {
                if (serviceSelect && serviceSelect.value) {
                    const serviceOption = serviceSelect.selectedOptions[0];
                    if (serviceOption) {
                        const service = {
                            serviceId: serviceSelect.value,
                            serviceName: serviceOption.textContent.split(' - ')[0],
                            price: parseInt(serviceOption.dataset.price)
                        };

                        assignment.services.push(service);
                        assignmentTotal += service.price;
                    }
                }
            });

            // Add assignment if it has services
            if (assignment.services.length > 0) {
                staffAssignments.push(assignment);
                totalPrice += assignmentTotal;
                console.log('Added assignment:', assignment);
            }

            // Update individual assignment summary
            const summaryContent = assignmentElement.querySelector('.assignment-summary .summary-content');
            if (summaryContent) {
                const servicesCount = summaryContent.querySelector('.services-count');
                const servicesTotal = summaryContent.querySelector('.services-total');

                if (servicesCount) {
                    servicesCount.textContent = `${assignment.services.length} service${assignment.services.length !== 1 ? 's' : ''}`;
                }
                if (servicesTotal) {
                    servicesTotal.textContent = `₱${assignmentTotal}`;
                }
            }
        }
    });

    // Update main summary
    updateStoreMainSummary();
    updateStoreTotalDisplay(totalPrice);

    // FIXED: Enable/disable button logic
    const hasCompleteAssignments = staffAssignments.length > 0;
    const getNumberBtn = document.getElementById('storeGetNumberBtn');
    
    console.log('Has complete assignments:', hasCompleteAssignments);
    console.log('Staff assignments:', staffAssignments);
    
    if (getNumberBtn) {
        if (hasCompleteAssignments) {
            getNumberBtn.disabled = false;
            getNumberBtn.classList.remove('disabled');
            getNumberBtn.style.opacity = '1';
            getNumberBtn.style.pointerEvents = 'auto';
            console.log('Button ENABLED');
        } else {
            getNumberBtn.disabled = true;
            getNumberBtn.classList.add('disabled');
            getNumberBtn.style.opacity = '0.5';
            getNumberBtn.style.pointerEvents = 'none';
            console.log('Button DISABLED');
        }
    } else {
        console.log('Button not found!');
    }

    // Store booking data
    bookingData.assignments = staffAssignments;
    bookingData.total = totalPrice;

    console.log('Final booking data:', bookingData);
}


// Enhanced service addition with proper filtering
function addServiceToAssignment(assignmentId) {
    const assignmentDiv = document.querySelector(`.staff-assignment[data-assignment-id="${assignmentId}"]`);
    if (!assignmentDiv) return;

    const servicesContainer = assignmentDiv.querySelector('.services-list');
    if (!servicesContainer) return;

    const serviceCount = servicesContainer.children.length + 1;
    const serviceDiv = document.createElement('div');
    serviceDiv.className = 'service-item';
    serviceDiv.setAttribute('data-service-id', serviceCount);

    serviceDiv.innerHTML = `
        <div class="selector-dropdown">
            <select class="service-select" data-assignment="${assignmentId}">
                <option value="">Choose a service...</option>
                
                <!-- MEN'S GROOMING -->
                <option value="haircut" data-price="370" data-duration="45">Haircut - ₱370</option>
                <option value="haircut-shampoo" data-price="370" data-duration="50">Haircut with Shampoo - ₱370</option>
                
                <!-- TREATMENT SERVICES -->
                <option value="hair-spa" data-price="400" data-duration="60">Hair Spa - ₱400</option>
                <option value="hair-treatment-amino" data-price="550" data-duration="75">Hair Treatment/Amino Mint - ₱550</option>
                <option value="scalp-therapy" data-price="500" data-duration="70">Scalp Therapy/Walnut Extract - ₱500</option>
                <option value="hair-color-regular" data-price="900" data-duration="120">Hair Color (Regular) - ₱900</option>
                <option value="hair-color-schwarzkopf" data-price="900" data-duration="120">Hair Color (Schwarzkopf) - ₱900</option>
                
                <!-- HAND AND FOOT CARE -->
                <option value="manicure" data-price="250" data-duration="30">Manicure - ₱250</option>
                <option value="pedicure" data-price="300" data-duration="40">Pedicure - ₱300</option>
                <option value="foot-spa" data-price="400" data-duration="45">Foot Spa - ₱400</option>
                
                <!-- OTHERS -->
                <option value="shampoo-blowdry" data-price="350" data-duration="40">Shampoo/Blowdry - ₱350</option>
                <option value="facial" data-price="450" data-duration="50">Facial - ₱450</option>
                <option value="shave" data-price="280" data-duration="25">Shave - ₱280</option>
                
                <!-- SPECIAL PROMOS -->
                <option value="haircut-hair-spa" data-price="670" data-duration="105">Haircut + Hair Spa - ₱670</option>
                <option value="haircut-amino-mint" data-price="820" data-duration="120">Haircut + Amino Mint - ₱820</option>
                <option value="haircut-scalp-therapy" data-price="820" data-duration="115">Haircut + Scalp Therapy - ₱820</option>
                <option value="haircut-hair-spa-facial" data-price="1070" data-duration="155">Haircut + Hair Spa + Facial - ₱1,070</option>
                <option value="haircut-amino-mint-facial" data-price="1220" data-duration="170">Haircut + Amino Mint + Facial - ₱1,220</option>
                <option value="haircut-scalp-therapy-facial" data-price="1220" data-duration="165">Haircut + Scalp Therapy + Facial - ₱1,220</option>
                <option value="haircut-hair-color-regular-hair-spa" data-price="1170" data-duration="180">Haircut + Hair Color (Regular) + Hair Spa - ₱1,170</option>
                <option value="haircut-hair-color-regular-amino-mint" data-price="1270" data-duration="195">Haircut + Hair Color (Regular) + Amino Mint - ₱1,270</option>
                <option value="haircut-hair-color-regular-scalp-therapy" data-price="1270" data-duration="190">Haircut + Hair Color (Regular) + Scalp Therapy - ₱1,270</option>
                <option value="haircut-hair-color-schwarzkopf-hair-spa" data-price="1170" data-duration="180">Haircut + Hair Color (Schwarzkopf) + Hair Spa - ₱1,170</option>
                <option value="haircut-hair-color-schwarzkopf-amino-mint" data-price="1270" data-duration="195">Haircut + Hair Color (Schwarzkopf) + Amino Mint - ₱1,270</option>
                <option value="haircut-hair-color-schwarzkopf-scalp-therapy" data-price="1270" data-duration="190">Haircut + Hair Color (Schwarzkopf) + Scalp Therapy - ₱1,270</option>
                <option value="manicure-pedicure" data-price="500" data-duration="70">Manicure + Pedicure - ₱500</option>
                <option value="foot-spa-pedicure" data-price="650" data-duration="85">Foot Spa + Pedicure - ₱650</option>
                <option value="foot-spa-manicure-pedicure" data-price="900" data-duration="115">Foot Spa + Manicure + Pedicure - ₱900</option>
                <option value="haircut-hair-color-regular" data-price="990" data-duration="165">Haircut + Hair Color (Regular) - ₱990</option>
                <option value="haircut-hair-color-schwarzkopf" data-price="1120" data-duration="165">Haircut + Hair Color (Schwarzkopf) - ₱1,120</option>
            </select>
            <i class="fas fa-chevron-down dropdown-icon"></i>
        </div>
        <button class="service-action-btn remove-service" data-assignment="${assignmentId}" data-service="${serviceCount}" type="button">
            <i class="fas fa-times"></i>
        </button>
    `;

    servicesContainer.appendChild(serviceDiv);

    // Add event listeners
    const serviceSelect = serviceDiv.querySelector('.service-select');
    const removeBtn = serviceDiv.querySelector('.remove-service');

    serviceSelect.addEventListener('change', updateStoreBookingSummary);

    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Only remove if there's more than one service
        if (servicesContainer.children.length > 1) {
            serviceDiv.remove();
            updateStoreBookingSummary();
        }
    });

    // Apply filtering based on currently selected staff
    const staffSelect = assignmentDiv.querySelector('.staff-select');
    if (staffSelect && staffSelect.value) {
        filterServiceOptionsForStaff(assignmentDiv, staffSelect.value);
    } else {
        // If no staff selected, disable all service options except the default
        filterServiceOptionsForStaff(assignmentDiv, "");
    }
}
// Enhanced staff assignment setup
function setupStaffAssignment(assignmentElement) {
    const staffSelect = assignmentElement.querySelector('.staff-select');
    const addServiceBtn = assignmentElement.querySelector('.add-service');

    if (!staffSelect || !addServiceBtn) return;

    // Staff selection change handler
    staffSelect.addEventListener('change', function() {
        const selectedStaffId = staffSelect.value;
        
        // Filter services for the selected staff
        filterServiceOptionsForStaff(assignmentElement, selectedStaffId);
        
        // Add visual feedback for staff selection
        if (selectedStaffId) {
            assignmentElement.classList.add('staff-selected');
            
            // Show appropriate badge/indicator
            updateStaffTypeBadge(assignmentElement, selectedStaffId);
        } else {
            assignmentElement.classList.remove('staff-selected');
            removeStaffTypeBadge(assignmentElement);
        }
        
        // Update booking summary
        updateStoreBookingSummary();
    });

    // Add service button handler
    addServiceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const assignmentId = parseInt(e.target.dataset.assignment);
        addServiceToAssignment(assignmentId);
        
        // Apply filtering to the newly added service select
        const staffId = staffSelect.value;
        if (staffId) {
            filterServiceOptionsForStaff(assignmentElement, staffId);
        }
        
        updateStoreBookingSummary();
    });
    
    // Initialize with no services filtered (since no staff selected initially)
    filterServiceOptionsForStaff(assignmentElement, "");
}
 function updateStoreMainSummary() {
        const summaryAssignments = document.getElementById('storeSummaryAssignments');
        
        if (staffAssignments.length === 0) {
            summaryAssignments.innerHTML = '<p class="no-selection">No staff assignments made</p>';
        } else {
            summaryAssignments.innerHTML = `
                <h4>Staff Assignments:</h4>
                ${staffAssignments.map(assignment => `
                    <div class="summary-assignment-item">
                        <div class="assignment-staff">${assignment.staffName}</div>
                        <div class="assignment-services">
                            ${assignment.services.map(service => `
                                <div class="assignment-service">${service.serviceName} - ₱${service.price}</div>
                            `).join('')}
                        </div>
                        <div class="assignment-total">Total: ₱${assignment.services.reduce((sum, s) => sum + s.price, 0)}</div>
                    </div>
                `).join('')}
            `;
        }
    }
    
    function updateStoreTotalDisplay(price) {
        document.getElementById('storeTotalAmount').textContent = `₱${price}`;
        
        
    }
     function processStoreWalkInBooking() {
    console.log('Processing walk-in booking...');
    console.log('Current staff assignments:', staffAssignments);
    
    // Check if we have any assignments
    if (!staffAssignments || staffAssignments.length === 0) {
        showStoreToast('Please complete at least one staff assignment', 'error');
        return;
    }
    
    // Generate walk-in queue number
    const queueNumber = generateStoreWalkInNumber();
    console.log('Generated queue number:', queueNumber);
    
    // Create booking object with assignment data
    const booking = {
        queueNumber: queueNumber,
        assignments: staffAssignments,
        total: bookingData.total,
        duration: bookingData.duration || 60,
        phone: localStorage.getItem('storeVerifiedPhone') || '+63 917 123 4567',
        timestamp: new Date().toISOString(),
        status: 'walk-in',
        type: 'walk-in'
    };
    
    console.log('Created booking:', booking);
    
    // Store booking in localStorage
    try {
        localStorage.setItem(`store_booking_${queueNumber}`, JSON.stringify(booking));
        console.log('Booking saved to localStorage');
    } catch (error) {
        console.error('Error saving booking:', error);
    }
    
    // Show confirmation
    showStoreBookingConfirmation(booking);
}

function showStoreBookingConfirmation(booking) {
    console.log('Showing booking confirmation for:', booking);
    
    const confirmationModal = document.getElementById('storeConfirmationModal');
    if (!confirmationModal) {
        console.error('Confirmation modal not found!');
        return;
    }

    // Update confirmation details
    const queueNumberElement = document.getElementById('storeQueueNumber');
    const timeIssuedElement = document.getElementById('storeTimeIssued');
    const confirmedStaffElement = document.getElementById('storeConfirmedStaff');
    const confirmedServicesElement = document.getElementById('storeConfirmedServices');
    const confirmedTotalElement = document.getElementById('storeConfirmedTotal');

    if (queueNumberElement) {
        queueNumberElement.textContent = booking.queueNumber;
    }
    
    if (timeIssuedElement) {
        timeIssuedElement.textContent = formatStoreTime(new Date());
    }

    // Format assignments text
    let staffText = '---';
    let servicesText = '---';

    if (booking.assignments && booking.assignments.length > 0) {
        // Staff: list all staff names
        staffText = booking.assignments.map(a => a.staffName).join(', ');

        // Services: list all services (flattened)
        servicesText = booking.assignments
            .map(a => a.services.map(s => s.serviceName).join(', '))
            .filter(s => s.length > 0)
            .join(', ');
    }

    // Update the modal content safely
    if (confirmedStaffElement) {
        confirmedStaffElement.textContent = staffText;
    }
    if (confirmedServicesElement) {
        confirmedServicesElement.textContent = servicesText;
    }
    if (confirmedTotalElement) {
        confirmedTotalElement.textContent = `₱${booking.total || 0}`;
    }
    
    // Show modal
    confirmationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log('Modal should now be visible');
}

function formatStoreTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
    // Initialize the system
    updateStoreBookingSummary();
// Function to update staff type badge
function updateStaffTypeBadge(assignmentElement, staffId) {
    // Remove existing badge
    removeStaffTypeBadge(assignmentElement);
    
    const header = assignmentElement.querySelector('.assignment-header');
    if (!header) return;
    
    const badge = document.createElement('div');
    badge.className = 'staff-type-badge';
    
    if (BARBER_STAFF_IDS.includes(staffId)) {
        badge.textContent = 'BARBER SERVICES';
        badge.classList.add('barber-badge');
    } else if (MANICURIST_STAFF_IDS.includes(staffId)) {
        badge.textContent = 'HAND & FOOT CARE';
        badge.classList.add('manicurist-badge');
    }
    
    header.appendChild(badge);
}

// Function to remove staff type badge
function removeStaffTypeBadge(assignmentElement) {
    const existingBadge = assignmentElement.querySelector('.staff-type-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
}



// Function to validate staff-service compatibility
function validateStaffServiceCompatibility(staffId, serviceId) {
    if (BARBER_STAFF_IDS.includes(staffId)) {
        return BARBER_SERVICE_VALUES.includes(serviceId);
    } else if (MANICURIST_STAFF_IDS.includes(staffId)) {
        return MANICURIST_SERVICE_VALUES.includes(serviceId);
    }
    return false;
}

// Enhanced booking summary validation
function validateBookingAssignments() {
    const allAssignments = document.querySelectorAll('.staff-assignment');
    let isValid = true;
    let errors = [];

    allAssignments.forEach((assignmentElement) => {
        const staffSelect = assignmentElement.querySelector('.staff-select');
        const serviceSelects = assignmentElement.querySelectorAll('.service-select');

        if (staffSelect.value) {
            let hasValidServices = false;

            serviceSelects.forEach(serviceSelect => {
                if (serviceSelect.value) {
                    if (validateStaffServiceCompatibility(staffSelect.value, serviceSelect.value)) {
                        hasValidServices = true;
                    } else {
                        errors.push(`Invalid service selection for selected staff member`);
                        isValid = false;
                    }
                }
            });

            if (!hasValidServices) {
                errors.push(`Staff member needs at least one service assigned`);
                isValid = false;
            }
        }
    });

    return { isValid, errors };
}

// Show validation errors to user
function showValidationErrors(errors) {
    errors.forEach(error => {
        showStoreToast(error, 'error');
    });
}

// Store System JavaScript

// Fixed Store Landing Page Initialization
function initStoreLanding() {
    const walkInOption = document.getElementById('walkInOption');
    const onlineOption = document.getElementById('onlineOption');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    if (walkInOption) {
        walkInOption.addEventListener('click', () => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('active');
            }
            setTimeout(() => {
                window.location.href = 'store-phone-verification.html';
            }, 1000);
        });
    }
    
    if (onlineOption) {
        onlineOption.addEventListener('click', () => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('active');
            }
            setTimeout(() => {
                window.location.href = 'store-online-number.html';
            }, 1000);
        });
    }
}

// Add this helper function if it doesn't exist
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
}
function formatStoreTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function showStoreToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `store-toast ${type}`;
    
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
    if (!document.querySelector('#store-toast-animations')) {
        const style = document.createElement('style');
        style.id = 'store-toast-animations';
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



// Fixed Store Phone Verification Function
function initStorePhoneVerification() {
    const phoneInput = document.getElementById('storePhoneNumber');
    const sendBtn = document.getElementById('storeSendCodeBtn');
    const form = document.getElementById('storePhoneVerificationForm');
    
    if (!phoneInput || !sendBtn || !form) {
        console.log('Phone verification elements not found');
        return;
    }
    
    // Restore previously entered phone number if returning from OTP
    const savedPhoneNumber = localStorage.getItem('storeEnteredPhone');
    if (savedPhoneNumber) {
        phoneInput.value = savedPhoneNumber;
        // Trigger input event to validate and enable button
        phoneInput.dispatchEvent(new Event('input'));
    }
    
    // Initialize virtual keyboard ONLY if it exists
    let keyboard = null;
    if (typeof VirtualKeyboard !== 'undefined') {
        keyboard = new VirtualKeyboard(phoneInput, {
            keyboardId: 'virtualKeyboard',
            maxLength: 16
        });
    }
    
    // Phone input formatting and validation
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        // Handle Philippine mobile format
        if (value.length > 0) {
            if (value.startsWith('9') && value.length <= 10) {
                if (value.length > 10) {
                    value = value.substring(0, 10);
                }
            } else if (value.startsWith('63') && value.length <= 12) {
                if (value.length > 12) {
                    value = value.substring(0, 12);
                }
            } else if (!value.startsWith('9') && !value.startsWith('63')) {
                value = value.replace(/^[^9]/, '');
                if (value.startsWith('9') && value.length > 10) {
                    value = value.substring(0, 10);
                }
            }
        }
        
        // Format the display
        let formatted = '';
        if (value.length > 0) {
            if (value.startsWith('63')) {
                formatted = '+63';
                if (value.length > 2) {
                    formatted += ' ' + value.substring(2, 3);
                    if (value.length > 3) {
                        formatted += value.substring(3, 5);
                        if (value.length > 5) {
                            formatted += ' ' + value.substring(5, 8);
                            if (value.length > 8) {
                                formatted += ' ' + value.substring(8, 12);
                            }
                        }
                    }
                }
            } else if (value.startsWith('9')) {
                formatted = '+63 ' + value.substring(0, 1);
                if (value.length > 1) {
                    formatted += value.substring(1, 3);
                    if (value.length > 3) {
                        formatted += ' ' + value.substring(3, 6);
                        if (value.length > 6) {
                            formatted += ' ' + value.substring(6, 10);
                        }
                    }
                }
            }
        }
        
        e.target.value = formatted;
        if (keyboard) {
            keyboard.currentValue = formatted;
        }
        
        // Save the formatted number for restoration
        localStorage.setItem('storeEnteredPhone', formatted);
        
        // Validate
        let isValid = false;
        if (value.startsWith('9') && value.length === 10) {
            isValid = true;
        } else if (value.startsWith('639') && value.length === 12) {
            isValid = true;
        }
        
        sendBtn.disabled = !isValid;
        sendBtn.style.opacity = isValid ? '1' : '0.5';
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const phoneValue = phoneInput.value.replace(/\D/g, '');
        let finalPhoneNumber = '';
        
        if (phoneValue.startsWith('639') && phoneValue.length === 12) {
            finalPhoneNumber = phoneValue;
        } else if (phoneValue.startsWith('9') && phoneValue.length === 10) {
            finalPhoneNumber = '63' + phoneValue;
        } else {
            const match = phoneValue.match(/9\d{9}/);
            if (match) {
                finalPhoneNumber = '63' + match[0];
            }
        }
        
        if (finalPhoneNumber.length === 12 && finalPhoneNumber.startsWith('639')) {
            sendStoreVerificationCode(finalPhoneNumber);
        } else {
            if (typeof showStoreToast !== 'undefined') {
                showStoreToast('Please enter a valid Philippine mobile number', 'error');
            } else {
                alert('Please enter a valid Philippine mobile number');
            }
        }
    });
}

// Store OTP Verification
function initStoreOTPVerification() {
    const otpForm = document.getElementById('storeOtpVerificationForm');
    const resendCodeBtn = document.getElementById('storeResendCodeBtn');
    const verificationPhoneDisplay = document.getElementById('storeVerificationPhoneDisplay');
    const otpInputs = document.querySelectorAll('.store-otp-input');
    
    if (!otpForm) return;
    
    // Get phone number from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const phoneNumber = urlParams.get('phone') || localStorage.getItem('storeVerificationPhone');
    const verificationCode = localStorage.getItem('storeVerificationCode');
    
    // Display masked phone number
    if (phoneNumber && verificationPhoneDisplay) {
        const maskedPhone = phoneNumber.replace(/(\+63)(\d{3})(\d{3})(\d{4})/, '$1 $2 XXX $4');
        verificationPhoneDisplay.textContent = maskedPhone;
    }
    
    // Initialize virtual keyboard for OTP inputs
    let currentOTPIndex = 0;
    const otpKeyboard = new VirtualKeyboard(otpInputs[0], {
        keyboardId: 'otpVirtualKeyboard',
        maxLength: 1,
        numbersOnly: true
    });
    
    // Setup OTP inputs
    otpInputs.forEach((input, index) => {
        input.addEventListener('click', () => {
            currentOTPIndex = index;
            otpKeyboard.input = input;
            otpKeyboard.currentValue = input.value;
            otpKeyboard.show();
        });
        
        input.addEventListener('input', () => {
            if (input.value) {
                input.classList.add('filled');
                // Auto-focus next input
                if (index < otpInputs.length - 1) {
                    currentOTPIndex = index + 1;
                    otpKeyboard.input = otpInputs[currentOTPIndex];
                    otpKeyboard.currentValue = '';
                } else {
                    otpKeyboard.hide();
                    // Auto-submit when all filled
                    const allFilled = Array.from(otpInputs).every(inp => inp.value !== '');
                    if (allFilled) {
                        setTimeout(() => {
                            otpForm.dispatchEvent(new Event('submit'));
                        }, 100);
                    }
                }
            } else {
                input.classList.remove('filled');
            }
        });
    });
    
    // Start resend timer
    startStoreResendTimer();
    
    // Form submission
    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        
        if (otp.length === 6) {
            verifyStoreOTP(otp, verificationCode);
        }
    });
    
    // Resend functionality
    resendCodeBtn?.addEventListener('click', () => {
        const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
        if (cleanPhone) {
            resendStoreVerificationCode(cleanPhone);
        }
    });
}

// Store Booking Selection with Updated Services from Your Menu
function initStoreBookingSelection() {
    let staffAssignments = []; // Array of {staffId, staffName, services: [{service, price, duration}]}
     window.bookingData = {
        assignments: [],
        total: 0
        
    };
    
    const addStaffBtn = document.getElementById('storeAddStaffBtn');
    const deleteStaffBtn = document.getElementById('storeDeleteStaffBtn');
    const staffContainer = document.getElementById('storeStaffServicesContainer');
    const getNumberBtn = document.getElementById('storeGetNumberBtn');
    
    let assignmentCounter = 0;
    
    // Initialize with first assignment
    createStaffAssignment();
    
    // Add new staff assignment
    addStaffBtn?.addEventListener('click', () => {
        createStaffAssignment();
        updateStoreBookingSummary();
    });
    
    // Remove last staff assignment
    deleteStaffBtn?.addEventListener('click', () => {
        const assignments = staffContainer.querySelectorAll('.staff-assignment');
        if (assignments.length > 1) {
            assignments[assignments.length - 1].remove();
            updateStoreBookingSummary();
        }
    });
    
    // Get number button
getNumberBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Get number button clicked!');
    processStoreWalkInBooking();
});
    
    function createStaffAssignment() {
        assignmentCounter++;
        const assignmentDiv = document.createElement('div');
        assignmentDiv.className = 'staff-assignment';
        assignmentDiv.setAttribute('data-assignment-id', assignmentCounter);
        
        assignmentDiv.innerHTML = `
            <div class="assignment-header">
                <h4 class="assignment-title">Staff Assignment #${assignmentCounter}</h4>
            </div>
            
            <div class="staff-selection">
                <label class="assignment-label">Select Staff Member:</label>
                <div class="selector-dropdown">
                    <select class="staff-select" data-assignment="${assignmentCounter}">
                        <option value="">Choose staff member...</option>
                        <option value="miguel" data-name="Miguel Santos - Master Barber">Miguel Santos - Master Barber</option>
                        <option value="carlos" data-name="Carlos Rivera - Senior Barber">Carlos Rivera - Senior Barber</option>
                        <option value="luis" data-name="Luis Garcia - Barber">Luis Garcia - Barber</option>
                        <option value="jose" data-name="Jose Martinez - Barber">Jose Martinez - Barber</option>
                        <option value="ricardo" data-name="Ricardo Dela Cruz - Barber">Ricardo Dela Cruz - Barber</option>
                        <option value="antonio" data-name="Antonio Ramos - Barber">Antonio Ramos - Barber</option>
                        <option value="manuel" data-name="Manuel Torres - Barber">Manuel Torres - Barber</option>
                        <option value="eduardo" data-name="Eduardo Hernandez - Barber">Eduardo Hernandez - Barber</option>
                        <option value="maria" data-name="Maria Cruz - Manicurist">Maria Cruz - Manicurist</option>
                        <option value="any-barber" data-name="Any Available Barber">Any Available Barber</option>
                        
                    </select>
                    <i class="fas fa-chevron-down dropdown-icon"></i>
                </div>
            </div>
            
            <div class="services-for-staff">
                <div class="services-header">
                    <label class="assignment-label">Services for this staff member:</label>
                    <div class="service-actions">
                        <button class="service-action-btn add-service" data-assignment="${assignmentCounter}" type="button">
                            <i class="fas fa-plus"></i>
                            Add Service
                        </button>
                    </div>
                </div>
                
                <div class="services-list" data-assignment="${assignmentCounter}">
                    <!-- Services will be added here -->
                </div>
            </div>
            
            <div class="assignment-summary">
                <div class="summary-content">
                    <span class="summary-label">Services assigned:</span>
                    <span class="services-count">0 services</span>
                    <span class="services-total">₱0</span>
                </div>
            </div>
        `;
        
        staffContainer.appendChild(assignmentDiv);
        
        // Add event listeners for this assignment
        setupStaffAssignment(assignmentDiv);
        
        // Add initial service
        addServiceToAssignment(assignmentCounter);
    }
    
   
}

// Helper Functions
function sendStoreVerificationCode(phoneNumber) {
    const sendBtn = document.getElementById('storeSendCodeBtn');
    const btnText = sendBtn?.querySelector('.btn-text-simple');
    const btnLoading = sendBtn?.querySelector('.btn-loading-simple');
    
    if (sendBtn) {
        sendBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    }
    
    // Generate and store verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Store verification code:', verificationCode);
    
    localStorage.setItem('storeVerificationPhone', '+' + phoneNumber);
    localStorage.setItem('storeVerificationCode', verificationCode);
    
    // Simulate sending
    setTimeout(() => {
        window.location.href = `store-otp-verification.html?phone=${encodeURIComponent('+' + phoneNumber)}`;
    }, 2000);
}

function verifyStoreOTP(otp, correctCode) {
    const verifyBtn = document.getElementById('storeVerifyCodeBtn');
    const btnText = verifyBtn?.querySelector('.btn-text-simple');
    const btnLoading = verifyBtn?.querySelector('.btn-loading-simple');
    const otpInputs = document.querySelectorAll('.store-otp-input');
    
    if (verifyBtn) {
        verifyBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    }
    
    setTimeout(() => {
        if (otp === correctCode || otp === '123456') { // 123456 for demo
            // Success
            verifyBtn.classList.add('verification-success');
            btnLoading.innerHTML = '<i class="fas fa-check"></i> Verified!';
            
            // Store verified phone number
            const phoneNumber = localStorage.getItem('storeVerificationPhone');
            localStorage.setItem('storeVerifiedPhone', phoneNumber);
            
            // Clear the entered phone number since verification is successful
            localStorage.removeItem('storeEnteredPhone');
            
            setTimeout(() => {
                window.location.href = 'store-booking-selection.html';
            }, 1500);
        } else {
            // Error
            otpInputs.forEach(input => {
                input.classList.add('error');
                input.value = '';
            });
            
            showStoreToast('Invalid verification code. Please try again.', 'error');
            
            setTimeout(() => {
                otpInputs.forEach(input => {
                    input.classList.remove('error');
                });
                // Focus on first input
                otpInputs[0].click();
            }, 1000);
            
            if (verifyBtn) {
                verifyBtn.disabled = false;
                btnText.style.display = 'block';
                btnLoading.style.display = 'none';
            }
        }
    }, 1500);
}

function startStoreResendTimer() {
    const resendBtn = document.getElementById('storeResendCodeBtn');
    const resendTimer = document.getElementById('storeResendTimer');
    const timerCount = document.getElementById('storeTimerCount');
    
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

function resendStoreVerificationCode(phoneNumber) {
    const resendBtn = document.getElementById('storeResendCodeBtn');
    const originalText = resendBtn.innerHTML;
    
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    resendBtn.disabled = true;
    
    // Generate new code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('New store verification code:', verificationCode);
    localStorage.setItem('storeVerificationCode', verificationCode);
    
    setTimeout(() => {
        resendBtn.innerHTML = originalText;
        resendBtn.disabled = false;
        showStoreToast('New verification code sent!', 'success');
        startStoreResendTimer();
    }, 2000);
}

function generateStoreWalkInNumber() {
    // Generate format: WI-YYYYMMDD-XXX (where XXX is random 3-digit number)
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 900) + 100;
    
    return `WI-${dateStr}-${randomNum}`;
}

// SIMPLE FIX: Replace this function in your store-script.js file

function showStoreBookingConfirmation(booking) {
    console.log('Showing confirmation for:', booking);
    
    // Find the modal
    const modal = document.getElementById('storeConfirmationModal');
    if (!modal) {
        // If modal doesn't exist, show a simple alert instead
        alert(`Walk-in number assigned: ${booking.queueNumber}\nTotal: ₱${booking.total}`);
        window.location.href = 'store-index.html';
        return;
    }

    // Update modal content safely (check if elements exist first)
    const queueNum = document.getElementById('storeQueueNumber');
    if (queueNum) queueNum.textContent = booking.queueNumber;

    const timeIssued = document.getElementById('storeTimeIssued');
    if (timeIssued) timeIssued.textContent = new Date().toLocaleTimeString();

    const staff = document.getElementById('storeConfirmedStaff');
    if (staff && booking.assignments) {
        staff.textContent = booking.assignments.map(a => a.staffName).join(', ');
    }

    const services = document.getElementById('storeConfirmedServices');
    if (services && booking.assignments) {
        services.textContent = booking.assignments
            .map(a => a.services.map(s => s.serviceName).join(', '))
            .join(', ');
    }

    const total = document.getElementById('storeConfirmedTotal');
    if (total) total.textContent = `₱${booking.total}`;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}
    // Online Check-in System
function initOnlineCheckin() {
    const bookingInput = document.getElementById('bookingNumberInput');
    const checkinBtn = document.getElementById('checkinBtn');
    const form = document.getElementById('onlineCheckinForm');
    
    if (!bookingInput || !checkinBtn || !form) return;
    
    // Initialize virtual keyboard for booking number input
    const keyboard = new VirtualKeyboard(bookingInput, {
        keyboardId: 'bookingVirtualKeyboard',
        maxLength: 20
    });
    
    // Booking number input validation
    bookingInput.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase().trim();
        
        // Format booking number (GQ-XXXXXXXX-XXX or WI-XXXXXXXX-XXX)
        value = value.replace(/[^A-Z0-9-]/g, '');
        
        e.target.value = value;
        keyboard.currentValue = value;
        
        // Validate booking number format
        const isValid = validateBookingNumber(value);
        
        checkinBtn.disabled = !isValid;
        checkinBtn.style.opacity = isValid ? '1' : '0.5';
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const bookingNumber = bookingInput.value.trim();
        
        if (validateBookingNumber(bookingNumber)) {
            processOnlineCheckin(bookingNumber);
        } else {
            showStoreToast('Please enter a valid booking number', 'error');
        }
    });
}

function validateBookingNumber(bookingNumber) {
    // Validate format: GQ-XXXXXXXX-XXX or WI-XXXXXXXX-XXX
    const pattern = /^(GQ|WI)-\d{8}-\d{3}$/;
    return pattern.test(bookingNumber);
}

function processOnlineCheckin(bookingNumber) {
    const checkinBtn = document.getElementById('checkinBtn');
    const btnText = checkinBtn?.querySelector('.btn-text-simple');
    const btnLoading = checkinBtn?.querySelector('.btn-loading-simple');
    
    if (checkinBtn) {
        checkinBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    }
    
    // Simulate checking booking in system
    setTimeout(() => {
        // Try to find the booking in localStorage
        const bookingKey = `booking_${bookingNumber}`;
        const storedBooking = localStorage.getItem(bookingKey);
        
        if (storedBooking) {
            const booking = JSON.parse(storedBooking);
            
            // Check if booking is for today and not already checked in
            const bookingDate = new Date(booking.date);
            const today = new Date();
            
            if (isSameDay(bookingDate, today) && booking.status !== 'checked-in') {
                // Successfully check in
                booking.status = 'checked-in';
                booking.checkinTime = new Date().toISOString();
                localStorage.setItem(bookingKey, JSON.stringify(booking));
                
                // Add to queue
                addToQueue(booking);
                
                // Show success modal
                showCheckinSuccess(booking);
            } else if (booking.status === 'checked-in') {
                showStoreToast('This booking has already been checked in', 'error');
                resetCheckinButton();
            } else {
                showStoreToast('This booking is not valid for today', 'error');
                resetCheckinButton();
            }
        } else {
            // Simulate valid booking for demo purposes
            const demoBooking = createDemoBooking(bookingNumber);
            showCheckinSuccess(demoBooking);
        }
    }, 2000);
}

function createDemoBooking(bookingNumber) {
    // Create a demo booking for demonstration
    const services = [
        { name: 'Classic Haircut', price: 370 },
        { name: 'Premium Cut', price: 400 },
        { name: 'Hair Spa', price: 400 },
        { name: 'Manicure + Pedicure', price: 500 }
    ];
    
    const staff = [
        'Miguel Santos - Master Barber',
        'Carlos Rivera - Senior Barber',
        'Luis Garcia - Barber',
        'Maria Cruz - Manicurist'
    ];
    
    const randomService = services[Math.floor(Math.random() * services.length)];
    const randomStaff = staff[Math.floor(Math.random() * staff.length)];
    
    return {
        queueNumber: bookingNumber,
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        services: [randomService],
        staff: [{ name: randomStaff }],
        total: randomService.price,
        phone: '+63 917 123 4567',
        status: 'checked-in',
        type: 'online'
    };
}

function addToQueue(booking) {
    // Add booking to queue system (this would integrate with your queue management)
    const queueKey = `queue_${booking.queueNumber}`;
    const queueEntry = {
        ...booking,
        queuePosition: getNextQueuePosition(),
        queueTime: new Date().toISOString()
    };
    
    localStorage.setItem(queueKey, JSON.stringify(queueEntry));
}

function getNextQueuePosition() {
    // Calculate next position in queue
    const queueItems = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('queue_')) {
            queueItems.push(JSON.parse(localStorage.getItem(key)));
        }
    }
    
    return queueItems.length + 1;
}

function showCheckinSuccess(booking) {
    const modal = document.getElementById('checkinSuccessModal');
    
    // Update modal content
    document.getElementById('checkinQueueNumber').textContent = booking.queueNumber;
    document.getElementById('checkinDate').textContent = formatDate(booking.date);
    document.getElementById('checkinTime').textContent = formatTime(booking.time);
    
    // Format services and staff
    const servicesText = Array.isArray(booking.services) 
        ? booking.services.map(s => s.serviceName || s.name).join(', ')
        : 'Service details';
    
    const staffText = Array.isArray(booking.staff)
        ? booking.staff.map(s => s.staffName || s.name).join(', ')
        : Array.isArray(booking.pairs)
        ? booking.pairs.map(p => p.staff.name).join(', ')
        : 'Staff assignment';
    
    document.getElementById('checkinServices').textContent = servicesText;
    document.getElementById('checkinStaff').textContent = staffText;
    document.getElementById('checkinTotal').textContent = `₱${booking.total}`;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function resetCheckinButton() {
    const checkinBtn = document.getElementById('checkinBtn');
    const btnText = checkinBtn?.querySelector('.btn-text-simple');
    const btnLoading = checkinBtn?.querySelector('.btn-loading-simple');
    
    if (checkinBtn) {
        checkinBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

function isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
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

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    return `${hour12}:${minutes} ${ampm}`;
}

// Queue Monitor System
function initQueueMonitor() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Update queue display every 30 seconds
    updateQueueDisplay();
    setInterval(updateQueueDisplay, 30000);
    
    // Update last updated timestamp
    updateLastUpdated();
    setInterval(updateLastUpdated, 60000);
}

function updateCurrentTime() {
    const timeDisplay = document.getElementById('timeDisplay');
    if (timeDisplay) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        timeDisplay.textContent = timeString;
    }
}

function updateQueueDisplay() {
    // This would fetch real queue data from your backend
    // For demo purposes, we'll simulate queue updates
    const queueList = document.getElementById('queueList');
    
    if (queueList) {
        // Load queue items from localStorage and display them
        const queueItems = getQueueItems();
        displayQueueItems(queueItems);
    }
}

function getQueueItems() {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('queue_')) {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                items.push(item);
            } catch (e) {
                console.error('Error parsing queue item:', e);
            }
        }
    }
    
    // Sort by queue time
    return items.sort((a, b) => new Date(a.queueTime) - new Date(b.queueTime));
}

function displayQueueItems(items) {
    const queueList = document.getElementById('queueList');
    if (!queueList) return;
    
    if (items.length === 0) {
        queueList.innerHTML = '<div class="no-queue-items">No customers in queue</div>';
        return;
    }
    
    queueList.innerHTML = items.map((item, index) => {
        const isNext = index === 0;
        const position = index + 1;
        
        return `
            <div class="queue-item ${isNext ? 'next-up' : ''}">
                <div class="queue-number">${item.queueNumber}</div>
                <div class="queue-details">
                    <div class="queue-type ${item.type}">${item.type.toUpperCase()}</div>
                    <div class="queue-staff">${getStaffNames(item)}</div>
                    <div class="queue-service">${getServiceNames(item)}</div>
                    <div class="queue-status ${isNext ? 'next' : 'waiting'}">
                        ${isNext ? 'Next Up' : `Position ${position}`}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getStaffNames(item) {
    if (Array.isArray(item.staff)) {
        return item.staff.map(s => s.name || s.staffName).join(', ');
    } else if (Array.isArray(item.assignments)) {
        return item.assignments.map(a => a.staffName).join(', ');
    } else if (Array.isArray(item.pairs)) {
        return item.pairs.map(p => p.staff.name).join(', ');
    }
    return 'Staff TBD';
}

function getServiceNames(item) {
    if (Array.isArray(item.services)) {
        return item.services.map(s => s.name || s.serviceName).join(', ');
    } else if (Array.isArray(item.assignments)) {
        return item.assignments.map(a => 
            a.services.map(s => s.serviceName).join(', ')
        ).join(' | ');
    } else if (Array.isArray(item.pairs)) {
        return item.pairs.map(p => p.service.name).join(', ');
    }
    return 'Services TBD';
}

function updateLastUpdated() {
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        lastUpdated.textContent = timeString;
    }
}