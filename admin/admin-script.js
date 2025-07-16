

/* ====================================
   GQ BARBERSHOP ADMIN SYSTEM JAVASCRIPT
   ==================================== */

// Global Variables

let currentUser = null;
let queueData = [];
let staffData = [];
let bookingsData = [];
let servicesData = [];
let customersData = [];
let currentQueueFilter = 'all';
let currentStatusFilter = 'all';
let autoCallEnabled = false;
// Add these variables near the top with other global variables
let editingPackageId = null;
let editingServiceId = null;
let currentCategory = 'all';
let currentPriceFilter = 'all';
let editingStaffId = null;

// ====================================
// AUTHENTICATION SYSTEM
// ====================================

// Check if user is authenticated
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const loginTime = sessionStorage.getItem('loginTime');
    
    if (!isLoggedIn || !loginTime) {
        return false;
    }
    
    // Check if session is older than 8 hours
    const now = new Date().getTime();
    const loginTimestamp = parseInt(loginTime);
    const eightHours = 8 * 60 * 60 * 1000;
    
    if (now - loginTimestamp > eightHours) {
        logout();
        return false;
    }
    
    return true;
}

// Login function
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('login-message');
    const loader = document.getElementById('login-loader');
    
    // Show loader
    loader.style.display = 'block';
    loginMessage.textContent = '';
    
    // Simulate API call delay
    setTimeout(() => {
        if (username === 'admin' && password === 'gqbarberbats111') {
            // Set session data
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('loginTime', new Date().getTime().toString());
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: 'admin',
                role: 'administrator',
                name: 'Admin User'
            }));
            
            // Redirect to dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            loginMessage.textContent = 'Invalid username or password';
            loader.style.display = 'none';
        }
    }, 1000);
}

// Logout function
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('loginTime');
    sessionStorage.removeItem('currentUser');
    window.location.href = 'admin-index.html';
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword');
    
    if (passwordInput && toggleIcon) {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        toggleIcon.classList.toggle('fa-eye-slash');
    }
}

// ====================================
// DATA MANAGEMENT
// ====================================

// Initialize sample data
function initializeSampleData() {
    // Initialize staff data
    if (!localStorage.getItem('staffData')) {
        staffData = [
            {
                id: 'miguel',
                name: 'Miguel Santos',
                role: 'Master Barber',
                status: 'available',
                currentCustomer: null,
                totalToday: 8,
                avatar: 'MS'
            },
            {
                id: 'carlos',
                name: 'Carlos Rivera',
                role: 'Senior Barber',
                status: 'busy',
                currentCustomer: 'WI-20250108-123',
                totalToday: 6,
                avatar: 'CR'
            },
            {
                id: 'luis',
                name: 'Luis Garcia',
                role: 'Barber',
                status: 'available',
                currentCustomer: null,
                totalToday: 5,
                avatar: 'LG'
            },
            {
                id: 'jose',
                name: 'Jose Martinez',
                role: 'Barber',
                status: 'break',
                currentCustomer: null,
                totalToday: 4,
                avatar: 'JM'
            },
            {
                id: 'maria',
                name: 'Maria Cruz',
                role: 'Manicurist',
                status: 'available',
                currentCustomer: null,
                totalToday: 7,
                avatar: 'MC'
            }
        ];
        localStorage.setItem('staffData', JSON.stringify(staffData));
    } else {
        staffData = JSON.parse(localStorage.getItem('staffData'));
    }
    
    // Initialize services data
    if (!localStorage.getItem('servicesData')) {
        servicesData = [
            { id: 'haircut', name: 'Haircut', price: 300, duration: 45, category: 'grooming' },
            { id: 'haircut-shampoo', name: 'Haircut with Shampoo', price: 370, duration: 50, category: 'grooming' },
            { id: 'hair-spa', name: 'Hair Spa', price: 400, duration: 60, category: 'treatment' },
            { id: 'manicure', name: 'Manicure', price: 250, duration: 30, category: 'nail-care' },
            { id: 'pedicure', name: 'Pedicure', price: 300, duration: 40, category: 'nail-care' },
            { id: 'facial', name: 'Facial', price: 450, duration: 50, category: 'treatment' },
            { id: 'shave', name: 'Shave', price: 280, duration: 25, category: 'grooming' }
        ];
        localStorage.setItem('servicesData', JSON.stringify(servicesData));
    } else {
        servicesData = JSON.parse(localStorage.getItem('servicesData'));
    }
    
    // Load existing queue and bookings data
    loadQueueData();
    loadBookingsData();
}

// Load queue data from localStorage (from store system)
function loadQueueData() {
    queueData = [];
    
    // Load from both store system and website system
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Load store system queue items
        if (key && (key.startsWith('store_booking_') || key.startsWith('queue_'))) {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item && item.queueNumber) {
                    queueData.push({
                        id: item.queueNumber,
                        queueNumber: item.queueNumber,
                        customerName: item.customerName || 'Walk-in Customer',
                        phone: item.phone || '',
                        type: item.type || 'walk-in',
                        services: item.services || item.assignments?.map(a => a.services).flat() || [],
                        staff: item.staff || item.assignments?.map(a => a.staffName).join(', ') || '',
                        status: item.status || 'waiting',
                        timestamp: item.timestamp || new Date().toISOString(),
                        total: item.total || 0,
                        waitTime: calculateWaitTime(item.timestamp)
                    });
                }
            } catch (error) {
                console.error('Error parsing queue item:', error);
            }
        }
        
        // Load website system bookings
        if (key && key.startsWith('booking_')) {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item && item.queueNumber) {
                    queueData.push({
                        id: item.queueNumber,
                        queueNumber: item.queueNumber,
                        customerName: item.customerName || 'Online Customer',
                        phone: item.phone || '',
                        type: 'online',
                        services: item.services || item.assignments?.map(a => a.services).flat() || [],
                        staff: item.staff || item.assignments?.map(a => a.staffName).join(', ') || '',
                        status: item.status || 'waiting',
                        timestamp: item.timestamp || new Date().toISOString(),
                        date: item.date,
                        time: item.time,
                        total: item.total || 0,
                        waitTime: calculateWaitTime(item.timestamp)
                    });
                }
            } catch (error) {
                console.error('Error parsing booking item:', error);
            }
        }
    }
    
    // Sort by timestamp
    queueData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Load bookings data
function loadBookingsData() {
    bookingsData = queueData.filter(item => item.type === 'online');
}

// Calculate wait time
function calculateWaitTime(timestamp) {
    if (!timestamp) return 0;
    const now = new Date();
    const created = new Date(timestamp);
    return Math.floor((now - created) / (1000 * 60)); // minutes
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('staffData', JSON.stringify(staffData));
    localStorage.setItem('servicesData', JSON.stringify(servicesData));
}

// ====================================
// DASHBOARD FUNCTIONS
// ====================================

// Initialize dashboard
function initDashboard() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    initializeSampleData();
    updateDashboardMetrics();
    loadQueuePreview();
    loadStaffOverview();
    loadRecentActivity();
    
    // Refresh data every 30 seconds
    setInterval(() => {
        loadQueueData();
        updateDashboardMetrics();
        loadQueuePreview();
        loadStaffOverview();
    }, 30000);
}

// Update date and time display
function updateDateTime() {
    const now = new Date();
    const dateTimeElement = document.getElementById('current-date-time');
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// Update dashboard metrics
function updateDashboardMetrics() {
    const today = new Date().toDateString();
    
    // Filter today's data
    const todayQueue = queueData.filter(item => {
        const itemDate = new Date(item.timestamp).toDateString();
        return itemDate === today;
    });
    
    const walkIns = todayQueue.filter(item => item.type === 'walk-in').length;
    const appointments = todayQueue.filter(item => item.type === 'online').length;
    const completed = todayQueue.filter(item => item.status === 'completed').length;
    const totalRevenue = todayQueue
        .filter(item => item.status === 'completed')
        .reduce((sum, item) => sum + (item.total || 0), 0);
    const activeStaff = staffData.filter(staff => staff.status !== 'offline').length;
    
    // Update UI
    updateMetricElement('walkins-count', walkIns);
    updateMetricElement('appointments-count', appointments);
    updateMetricElement('revenue-count', `₱${totalRevenue.toLocaleString()}`);
    updateMetricElement('staff-count', activeStaff);
    
    // Update queue stats
    updateMetricElement('queue-waiting', queueData.filter(item => item.status === 'waiting').length);
    updateMetricElement('queue-serving', queueData.filter(item => item.status === 'serving').length);
}

// Update metric element
function updateMetricElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Load queue preview for dashboard
function loadQueuePreview() {
    const container = document.getElementById('queue-preview');
    if (!container) return;
    
    const nextFive = queueData
        .filter(item => item.status === 'waiting')
        .slice(0, 5);
    
    if (nextFive.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-medium">No customers in queue</p>';
        return;
    }
    
    container.innerHTML = nextFive.map(item => `
        <div class="queue-item-preview">
            <span class="queue-number">${item.queueNumber}</span>
            <span class="customer-name">${item.customerName}</span>
            <span class="queue-type ${item.type}">${item.type.toUpperCase()}</span>
            <span class="wait-time">${item.waitTime}m</span>
        </div>
    `).join('');
}

// Load staff overview for dashboard
function loadStaffOverview() {
    const container = document.getElementById('staff-overview');
    if (!container) return;
    
    container.innerHTML = staffData.map(staff => `
        <div class="staff-card ${staff.status}">
            <div class="staff-header">
                <div class="staff-avatar">${staff.avatar}</div>
                <div class="staff-info">
                    <h3>${staff.name}</h3>
                    <div class="staff-role">${staff.role}</div>
                </div>
            </div>
            <div class="staff-status">
                <div class="status-indicator ${staff.status}"></div>
                <span>${staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}</span>
            </div>
            <div class="staff-current">
                ${staff.currentCustomer ? `Serving: ${staff.currentCustomer}` : 'No current customer'}
            </div>
        </div>
    `).join('');
}

// Load recent activity
function loadRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;
    
    // Generate sample recent activities
    const activities = [
        {
            icon: 'fa-user-plus',
            title: 'New walk-in customer added',
            description: 'Customer added to queue for haircut service',
            time: '2 minutes ago'
        },
        {
            icon: 'fa-check-circle',
            title: 'Service completed',
            description: 'Miguel Santos completed haircut for customer #WI-123',
            time: '5 minutes ago'
        },
        {
            icon: 'fa-calendar-check',
            title: 'Online appointment checked in',
            description: 'Customer #GQ-456 checked in for appointment',
            time: '8 minutes ago'
        },
        {
            icon: 'fa-coffee',
            title: 'Staff break started',
            description: 'Jose Martinez started break',
            time: '12 minutes ago'
        }
    ];
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-description">${activity.description}</div>
            </div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

// ====================================
// QUEUE MANAGEMENT FUNCTIONS
// ====================================

// Initialize queue management
function initQueueManagement() {
    initializeSampleData();
    updateQueueStats();
    renderQueueList();
    renderQueueHistory();
    loadServicesForModal();
    loadStaffForModal();
    
    // Auto-refresh every 15 seconds
    setInterval(() => {
        loadQueueData();
        updateQueueStats();
        renderQueueList();
    }, 15000);
}

// Update queue statistics
function updateQueueStats() {
    const waiting = queueData.filter(item => item.status === 'waiting').length;
    const serving = queueData.filter(item => item.status === 'serving').length;
    const today = new Date().toDateString();
    const completed = queueData.filter(item => 
        item.status === 'completed' && 
        new Date(item.timestamp).toDateString() === today
    ).length;
    
    
    updateMetricElement('waiting-count', waiting);
    updateMetricElement('serving-count', serving);
    updateMetricElement('completed-count', completed);

}

// Render queue list
function renderQueueList() {
    const container = document.getElementById('queue-list');
    if (!container) return;
    
    let filteredQueue = queueData;
    
    // Apply filters
    if (currentQueueFilter !== 'all') {
        filteredQueue = filteredQueue.filter(item => item.type === currentQueueFilter);
    }
    
    if (currentStatusFilter !== 'all') {
        filteredQueue = filteredQueue.filter(item => item.status === currentStatusFilter);
    }
    
    // Show only current queue (not completed)
    filteredQueue = filteredQueue.filter(item => item.status !== 'completed');
    
    if (filteredQueue.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-medium">No customers in queue</p>';
        return;
    }
    
    container.innerHTML = filteredQueue.map(item => `
        <div class="queue-item ${item.status}" onclick="openQueueActions('${item.id}')">
            <div class="queue-number">${item.queueNumber}</div>
            <div class="queue-customer">
                <div class="customer-name">${item.customerName}</div>
                <div class="customer-service">${getServiceNames(item.services)}</div>
                <div class="customer-staff">Staff: ${item.staff || 'Unassigned'}</div>
            </div>
            <div class="queue-status ${item.status}">${item.status}</div>
            <div class="queue-time">
                <div>Wait: ${item.waitTime}m</div>
                <div>${formatTime(item.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

// Render queue history
function renderQueueHistory() {
    const container = document.getElementById('queue-history');
    if (!container) return;
    
    const today = new Date().toDateString();
    const completedToday = queueData.filter(item => 
        item.status === 'completed' && 
        new Date(item.timestamp).toDateString() === today
    );
    
    if (completedToday.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-medium">No completed services today</p>';
        return;
    }
    
    container.innerHTML = completedToday.map(item => `
        <div class="queue-item completed">
            <div class="queue-number">${item.queueNumber}</div>
            <div class="queue-customer">
                <div class="customer-name">${item.customerName}</div>
                <div class="customer-service">${getServiceNames(item.services)}</div>
                <div class="customer-staff">Staff: ${item.staff}</div>
            </div>
            <div class="queue-status completed">completed</div>
            <div class="queue-time">
                <div>Total: ₱${item.total || 0}</div>
                <div>${formatTime(item.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

// Get service names from services array
function getServiceNames(services) {
    if (!services || services.length === 0) return 'No services';
    
    if (Array.isArray(services) && services[0] && typeof services[0] === 'object') {
        return services.map(s => s.serviceName || s.name || s).join(', ');
    }
    
    return services.join ? services.join(', ') : services.toString();
}

// Filter queue
function filterQueue() {
    const queueFilter = document.getElementById('queue-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (queueFilter) currentQueueFilter = queueFilter.value;
    if (statusFilter) currentStatusFilter = statusFilter.value;
    
    renderQueueList();
}

// Format time
function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ====================================
// MODAL FUNCTIONS
// ====================================

// Load services for modal
function loadServicesForModal() {
    const container = document.getElementById('services-selection');
    if (!container) return;
    
    container.innerHTML = servicesData.map(service => `
        <div class="service-checkbox">
            <input type="checkbox" id="service-${service.id}" value="${service.id}">
            <label for="service-${service.id}">${service.name} - ₱${service.price}</label>
        </div>
    `).join('');
}

// Load staff for modal
function loadStaffForModal() {
    const selects = document.querySelectorAll('#queue-staff, #assigned-staff, #customer-service');
    
    selects.forEach(select => {
        if (select && select.id.includes('staff')) {
            select.innerHTML = '<option value="">Select staff member</option>' +
                staffData.map(staff => `
                    <option value="${staff.id}">${staff.name} - ${staff.role}</option>
                `).join('');
        }
    });
    
    // Load services for quick add
    const serviceSelect = document.getElementById('customer-service');
    if (serviceSelect) {
        serviceSelect.innerHTML = '<option value="">Select a service</option>' +
            servicesData.map(service => `
                <option value="${service.id}">${service.name} - ₱${service.price}</option>
            `).join('');
    }
}

// Open quick add customer modal
function openQuickAddCustomer() {
    const modal = document.getElementById('quick-add-modal');
    if (modal) {
        modal.classList.add('active');
        loadStaffForModal();
    }
}

// Close quick add modal
function closeQuickAddModal() {
    const modal = document.getElementById('quick-add-modal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('quick-add-form').reset();
    }
}

// Open add to queue modal
function openAddToQueueModal() {
    const modal = document.getElementById('add-queue-modal');
    if (modal) {
        modal.classList.add('active');
        loadServicesForModal();
        loadStaffForModal();
    }
}

// Close add to queue modal
function closeAddToQueueModal() {
    const modal = document.getElementById('add-queue-modal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('add-queue-form').reset();
    }
}

// Open queue actions modal
function openQueueActions(queueId) {
    const modal = document.getElementById('queue-actions-modal');
    if (modal) {
        const item = queueData.find(q => q.id === queueId);
        if (item) {
            modal.classList.add('active');
            displayQueueItemDetails(item);
            window.selectedQueueItem = item;
        }
    }
}

// Close queue actions modal
function closeQueueActionsModal() {
    const modal = document.getElementById('queue-actions-modal');
    if (modal) {
        modal.classList.remove('active');
        window.selectedQueueItem = null;
    }
}

// Display queue item details
function displayQueueItemDetails(item) {
    const container = document.getElementById('selected-queue-item');
    if (container) {
        container.innerHTML = `
            <div class="queue-item-detail">
                <h4>Queue #${item.queueNumber}</h4>
                <p><strong>Customer:</strong> ${item.customerName}</p>
                <p><strong>Phone:</strong> ${item.phone || 'Not provided'}</p>
                <p><strong>Type:</strong> ${item.type.toUpperCase()}</p>
                <p><strong>Services:</strong> ${getServiceNames(item.services)}</p>
                <p><strong>Staff:</strong> ${item.staff || 'Unassigned'}</p>
                <p><strong>Status:</strong> ${item.status}</p>
                <p><strong>Wait Time:</strong> ${item.waitTime} minutes</p>
                <p><strong>Total:</strong> ₱${item.total || 0}</p>
            </div>
        `;
    }
}

// ====================================
// QUEUE ACTIONS
// ====================================

// Call next customer
function callNext() {
    const nextCustomer = queueData.find(item => item.status === 'waiting');
    if (nextCustomer) {
        nextCustomer.status = 'serving';
        updateQueueItemInStorage(nextCustomer);
        showNotification(`Called customer ${nextCustomer.queueNumber}`, 'success');
        refreshQueue();
    } else {
        showNotification('No customers waiting in queue', 'info');
    }
}

// Start service
function startService() {
    if (window.selectedQueueItem) {
        window.selectedQueueItem.status = 'serving';
        updateQueueItemInStorage(window.selectedQueueItem);
        showNotification(`Started service for ${window.selectedQueueItem.queueNumber}`, 'success');
        closeQueueActionsModal();
        refreshQueue();
    }
}

// Complete service
function completeService() {
    if (window.selectedQueueItem) {
        window.selectedQueueItem.status = 'completed';
        window.selectedQueueItem.completedTime = new Date().toISOString();
        updateQueueItemInStorage(window.selectedQueueItem);
        showNotification(`Completed service for ${window.selectedQueueItem.queueNumber}`, 'success');
        closeQueueActionsModal();
        refreshQueue();
    }
}

// Remove from queue
function removeFromQueue() {
    if (window.selectedQueueItem) {
        if (confirm(`Are you sure you want to remove ${window.selectedQueueItem.queueNumber} from the queue?`)) {
            removeQueueItemFromStorage(window.selectedQueueItem);
            showNotification(`Removed ${window.selectedQueueItem.queueNumber} from queue`, 'info');
            closeQueueActionsModal();
            refreshQueue();
        }
    }
}

// Update queue item in storage
function updateQueueItemInStorage(item) {
    // Update in localStorage based on the original key format
    let storageKey = null;
    
    // Try different possible key formats
    const possibleKeys = [
        `store_booking_${item.queueNumber}`,
        `queue_${item.queueNumber}`,
        `booking_${item.queueNumber}`
    ];
    
    for (const key of possibleKeys) {
        if (localStorage.getItem(key)) {
            storageKey = key;
            break;
        }
    }
    
    if (storageKey) {
        const existingItem = JSON.parse(localStorage.getItem(storageKey));
        existingItem.status = item.status;
        if (item.completedTime) {
            existingItem.completedTime = item.completedTime;
        }
        localStorage.setItem(storageKey, JSON.stringify(existingItem));
    }
    
    // Update local queueData
    const index = queueData.findIndex(q => q.id === item.id);
    if (index !== -1) {
        queueData[index] = item;
    }
}

// Remove queue item from storage
function removeQueueItemFromStorage(item) {
    // Remove from localStorage
    const possibleKeys = [
        `store_booking_${item.queueNumber}`,
        `queue_${item.queueNumber}`,
        `booking_${item.queueNumber}`
    ];
    
    for (const key of possibleKeys) {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            break;
        }
    }
    
    // Remove from local queueData
    queueData = queueData.filter(q => q.id !== item.id);
}

// Refresh queue
function refreshQueue() {
    loadQueueData();
    if (typeof updateQueueStats === 'function') updateQueueStats();
    if (typeof renderQueueList === 'function') renderQueueList();
    if (typeof renderQueueHistory === 'function') renderQueueHistory();
    if (typeof updateDashboardMetrics === 'function') updateDashboardMetrics();
}

// Toggle auto call
function toggleAutoCall() {
    autoCallEnabled = !autoCallEnabled;
    const btn = document.getElementById('auto-call-btn');
    if (btn) {
        const icon = btn.querySelector('i');
        if (autoCallEnabled) {
            icon.className = 'fas fa-pause';
            btn.title = 'Pause Auto Call';
            startAutoCall();
        } else {
            icon.className = 'fas fa-play';
            btn.title = 'Start Auto Call';
            stopAutoCall();
        }
    }
}

// Auto call system
let autoCallInterval = null;

function startAutoCall() {
    if (autoCallInterval) return;
    
    autoCallInterval = setInterval(() => {
        const nextCustomer = queueData.find(item => item.status === 'waiting');
        if (nextCustomer) {
            const availableStaff = staffData.find(staff => staff.status === 'available');
            if (availableStaff) {
                callNext();
            }
        }
    }, 30000); // Check every 30 seconds
}

function stopAutoCall() {
    if (autoCallInterval) {
        clearInterval(autoCallInterval);
        autoCallInterval = null;
    }
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Get notification color
function getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    return colors[type] || colors.info;
}

// View queue (redirect to queue management)
function viewQueue() {
    window.location.href = 'admin-queue.html';
}

// Update staff status
function updateStaffStatus() {
    window.location.href = 'admin-barbers.html';
}

// Generate report
function generateReport() {
    window.location.href = 'admin-reports.html';
}

// ====================================
// FORM HANDLERS
// ====================================

// Handle quick add form submission
function handleQuickAddForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const customerName = formData.get('customer-name') || 'Walk-in Customer';
    const serviceId = formData.get('customer-service');
    const staffId = formData.get('assigned-staff');
    
    const service = servicesData.find(s => s.id === serviceId);
    const staff = staffData.find(s => s.id === staffId);
    
    if (!service || !staff) {
        showNotification('Please select both service and staff', 'error');
        return;
    }
    
    // Generate queue number
    const queueNumber = generateQueueNumber('WI');
    
    // Create queue item
    const queueItem = {
        id: queueNumber,
        queueNumber: queueNumber,
        customerName: customerName,
        phone: '',
        type: 'walk-in',
        services: [service],
        staff: staff.name,
        status: 'waiting',
        timestamp: new Date().toISOString(),
        total: service.price,
        waitTime: 0
    };
    
    // Add to queue
    queueData.unshift(queueItem);
    
    // Save to localStorage
    localStorage.setItem(`store_booking_${queueNumber}`, JSON.stringify({
        queueNumber: queueNumber,
        customerName: customerName,
        services: [service],
        staff: staff.name,
        status: 'waiting',
        timestamp: new Date().toISOString(),
        total: service.price,
        type: 'walk-in'
    }));
    
    showNotification(`Added ${customerName} to queue`, 'success');
    closeQuickAddModal();
    refreshQueue();
}

// Handle add to queue form submission
function handleAddToQueueForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const customerName = formData.get('queue-customer-name') || 'Customer';
    const phone = formData.get('queue-customer-phone') || '';
    const type = formData.get('queue-type');
    const staffId = formData.get('queue-staff');
    const priority = formData.get('queue-priority');
    
    // Get selected services
    const selectedServices = [];
    const serviceCheckboxes = document.querySelectorAll('#services-selection input[type="checkbox"]:checked');
    serviceCheckboxes.forEach(checkbox => {
        const service = servicesData.find(s => s.id === checkbox.value);
        if (service) selectedServices.push(service);
    });
    
    const staff = staffData.find(s => s.id === staffId);
    
    if (selectedServices.length === 0 || !staff) {
        showNotification('Please select at least one service and assign staff', 'error');
        return;
    }
    
    // Generate queue number
    const queueNumber = generateQueueNumber(type === 'walk-in' ? 'WI' : 'GQ');
    
    // Calculate total
    const total = selectedServices.reduce((sum, service) => sum + service.price, 0);
    
    // Create queue item
    const queueItem = {
        id: queueNumber,
        queueNumber: queueNumber,
        customerName: customerName,
        phone: phone,
        type: type,
        services: selectedServices,
        staff: staff.name,
        status: priority === 'high' ? 'priority' : 'waiting',
        timestamp: new Date().toISOString(),
        total: total,
        waitTime: 0
    };
    
    // Add to queue (priority customers go to front)
    if (priority === 'high') {
        queueData.unshift(queueItem);
    } else {
        queueData.push(queueItem);
    }
    
    // Save to localStorage
    const storageKey = type === 'walk-in' ? `store_booking_${queueNumber}` : `booking_${queueNumber}`;
    localStorage.setItem(storageKey, JSON.stringify({
        queueNumber: queueNumber,
        customerName: customerName,
        phone: phone,
        services: selectedServices,
        staff: staff.name,
        status: queueItem.status,
        timestamp: new Date().toISOString(),
        total: total,
        type: type
    }));
    
    showNotification(`Added ${customerName} to queue`, 'success');
    closeAddToQueueModal();
    refreshQueue();
}

// Generate queue number
function generateQueueNumber(prefix = 'GQ') {
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 900) + 100;
    
    return `${prefix}-${dateStr}-${randomNum}`;
}

// ====================================
// STAFF MANAGEMENT FUNCTIONS
// ====================================

// Initialize staff management
function initStaffManagement() {
    initializeSampleData();
    renderStaffTable();
    
    // Add form event listener
    const staffForm = document.getElementById('staff-form');
    if (staffForm) {
        staffForm.addEventListener('submit', handleStaffFormSubmit);
    }
}

// Render staff table
function renderStaffTable() {
    const tbody = document.querySelector('#staff-table tbody');
    if (!tbody) return;
    
    if (staffData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-gray-medium" style="padding: 30px 0;">
                    No staff members available yet.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = staffData.map(staff => `
        <tr>
            <td>
                <div class="staff-info">
                    <div class="staff-avatar">${staff.avatar}</div>
                    <div>
                        <div class="staff-name">${staff.name}</div>
                        <div class="staff-role">${staff.role}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="status-badge ${staff.status}" onclick="changeStaffStatus('${staff.id}')">
                    <div class="status-indicator ${staff.status}"></div>
                    ${staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                </span>
            </td>
            <td>${staff.currentCustomer || 'None'}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-primary btn-sm" onclick="editStaff('${staff.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="removeStaff('${staff.id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Change staff status
function changeStaffStatus(staffId) {
    const staff = staffData.find(s => s.id === staffId);
    if (!staff) return;
    
    const statuses = ['available', 'busy', 'break', 'offline'];
    const currentIndex = statuses.indexOf(staff.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    
    staff.status = statuses[nextIndex];
    
    // If going to available, clear current customer
    if (staff.status === 'available') {
        staff.currentCustomer = null;
    }
    
    saveData();
    renderStaffTable();
    showNotification(`${staff.name} status changed to ${staff.status}`, 'success');
}

// Add new staff member
function addStaff() {
    editingStaffId = null;
    
    // Reset form
    document.getElementById('staff-form').reset();
    document.getElementById('staff-modal-title').textContent = 'Add New Staff Member';
    
    // Show modal
    document.getElementById('add-staff-modal').classList.add('active');
}


// Edit staff member
function editStaff(staffId) {
    const staff = staffData.find(s => s.id === staffId);
    if (!staff) return;
    
    editingStaffId = staffId;
    
    // Pre-fill form
    document.getElementById('staff-name').value = staff.name;
    document.getElementById('staff-role').value = staff.role;
    document.getElementById('staff-status').value = staff.status;
    
    // Update modal title
    document.getElementById('staff-modal-title').textContent = 'Edit Staff Member';
    
    // Show modal
    document.getElementById('add-staff-modal').classList.add('active');
}
// Remove staff member
function removeStaff(staffId) {
    const staff = staffData.find(s => s.id === staffId);
    if (!staff) return;
    
    if (confirm(`Are you sure you want to remove ${staff.name} from staff?`)) {
        staffData = staffData.filter(s => s.id !== staffId);
        saveData();
        renderStaffTable();
        showNotification(`Removed ${staff.name} from staff`, 'info');
    }
}

function closeStaffModal() {
    document.getElementById('add-staff-modal').classList.remove('active');
    editingStaffId = null;
}

// Handle staff form submission
function handleStaffFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('staff-name').value.trim();
    const role = document.getElementById('staff-role').value;
    const status = document.getElementById('staff-status').value;
    
    // Validation
    if (!name || !role) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (editingStaffId) {
        // Update existing staff
        const staffIndex = staffData.findIndex(s => s.id === editingStaffId);
        if (staffIndex !== -1) {
            const existingStaff = staffData[staffIndex];
            staffData[staffIndex] = {
                ...existingStaff,
                name: name,
                role: role,
                status: status,
                avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
            };
            showNotification(`Updated ${name}`, 'success');
        }
    } else {
        // Create new staff
        const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        const newStaff = {
            id: id,
            name: name,
            role: role,
            status: status,
            currentCustomer: null,
            totalToday: 0,
            avatar: avatar
        };
        
        staffData.push(newStaff);
        showNotification(`Added ${name} to staff`, 'success');
    }
    
    // Save and update UI
    saveData();
    renderStaffTable();
    updateStaffMetrics();
    renderPerformanceGrid();
    closeStaffModal();
}

// ====================================
// SERVICES MANAGEMENT FUNCTIONS
// ====================================

// Global Variables for Services Management


// Initialize Services Management
function initServicesManagement() {
    initializeSampleData();
    renderServicesTable();
    renderPackagesGrid();
    setupServicesEventListeners();
}

// Setup event listeners for services management
function setupServicesEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('services-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            filterServices();
        }, 300));
    }
    
    // Service form submission
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', handleServiceFormSubmit);
    }
}

// Load packages data
function loadPackagesData() {
    const stored = localStorage.getItem('packagesData');
    if (stored) {
        packagesData = JSON.parse(stored);
    } else {
        // Initialize with sample packages
        packagesData = [
            {
                id: 'package1',
                name: 'Complete Grooming Package',
                services: ['haircut', 'shave', 'facial'],
                originalPrice: 1030,
                packagePrice: 900,
                description: 'Haircut + Shave + Facial treatment',
                popular: true
            },
            {
                id: 'package2',
                name: 'Relaxation Package',
                services: ['haircut-shampoo', 'hair-spa'],
                originalPrice: 770,
                packagePrice: 650,
                description: 'Haircut with Shampoo + Hair Spa',
                popular: false
            }
        ];
        savePackagesData();
    }
}

// Save packages data
function savePackagesData() {
    localStorage.setItem('packagesData', JSON.stringify(packagesData));
}
// Render services table
function renderServicesTable() {
    const tbody = document.querySelector('#services-table tbody');
    if (!tbody) return;
    
    let filteredServices = [...servicesData];
    
    // Apply category filter
    if (currentCategory !== 'all') {
        filteredServices = filteredServices.filter(service => 
            getCategoryForService(service) === currentCategory
        );
    }
    
    // Apply price filter
    if (currentPriceFilter !== 'all') {
        filteredServices = filteredServices.filter(service => {
            switch (currentPriceFilter) {
                case 'low': return service.price < 400;
                case 'medium': return service.price >= 400 && service.price <= 800;
                case 'high': return service.price > 800;
                default: return true;
            }
        });
    }
    
    // Apply search filter
    const searchTerm = document.getElementById('services-search')?.value.toLowerCase() || '';
    if (searchTerm) {
        filteredServices = filteredServices.filter(service =>
            service.name.toLowerCase().includes(searchTerm) ||
            getCategoryDisplayName(getCategoryForService(service)).toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredServices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-gray-medium" style="padding: 30px 0;">
                    No services found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredServices.map(service => `
        <tr>
            <td>
                <div class="service-info">
                    <h4>${service.name}</h4>
                    
                </div>
            </td>
            <td class="price-cell">₱${service.price.toFixed(2)}</td>
            <td>
                <span class="category-badge ${getCategoryForService(service)}">
                    ${getCategoryDisplayName(getCategoryForService(service))}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-primary btn-sm" onclick="editService('${service.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteService('${service.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get category for service (mapping from existing service data)
function getCategoryForService(service) {
    // If service has category property, use it directly
    if (service.category) {
        return service.category;
    }
    
    // Fallback mapping for existing services
    const categoryMapping = {
        'haircut': 'mens-grooming',
        'haircut-shampoo': 'mens-grooming',
        'shave': 'mens-grooming',
        'hair-spa': 'treatment-services',
        'facial': 'treatment-services',
        'manicure': 'hand-foot-care',
        'pedicure': 'hand-foot-care'
    };
    
    return categoryMapping[service.id] || 'others';
}
// Get category display name
function getCategoryDisplayName(category) {
    const categoryNames = {
        'mens-grooming': "Men's Grooming",
        'treatment-services': 'Treatment Services',
        'hand-foot-care': 'Hand & Foot Care',
        'others': 'Others',
    };
    
    return categoryNames[category] || category;
}

// Render packages grid
function renderPackagesGrid() {
    loadPackagesData();
    const grid = document.getElementById('packages-grid');
    if (!grid) return;
    
    if (packagesData.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No packages created yet</h3>
                <p>Create your first service package to offer bundled deals to customers.</p>
                <button class="btn btn-primary" onclick="createPackage()">
                    <i class="fas fa-plus"></i>
                    Create Package
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = packagesData.map(package => {
        const savings = package.originalPrice - package.packagePrice;
        const savingsPercent = Math.round((savings / package.originalPrice) * 100);
        
        return `
            <div class="package-card ${package.popular ? 'popular' : ''}">
                ${package.popular ? '<div class="popular-badge">Popular</div>' : ''}
                <div class="package-header">
                    <h3>${package.name}</h3>
                    <div class="package-price">
                        <span class="original-price">₱${package.originalPrice}</span>
                        <span class="package-price-main">₱${package.packagePrice}</span>
                    </div>
                </div>
                <div class="package-content">
                    <p class="package-description">${package.description}</p>
                    <div class="package-services">
                        <strong>Includes:</strong>
                        <ul>
                            ${package.services.map(serviceId => {
                                const service = servicesData.find(s => s.id === serviceId);
                                return service ? `<li>${service.name}</li>` : '';
                            }).join('')}
                        </ul>
                    </div>
                    <div class="package-savings">
                        Save ₱${savings} (${savingsPercent}% off)
                    </div>
                </div>
                <div class="package-actions">
                    <button class="btn btn-primary btn-sm" onclick="editPackage('${package.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deletePackage('${package.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter by category
function filterByCategory(category) {
    currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    renderServicesTable();
}

// Filter services
function filterServices() {
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
        currentPriceFilter = priceFilter.value;
    }
    
    renderServicesTable();
}

// Add new service
function addService() {
    editingServiceId = null;
    
    // Show modal first
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.add('active');
    }
    
    // Wait a moment, then reset form
    setTimeout(() => {
        const form = document.getElementById('service-form');
        const modalTitle = document.getElementById('service-modal-title');
        
        if (form) form.reset();
        if (modalTitle) modalTitle.textContent = 'Add New Service';
    }, 100);
}
// Edit service
// Fixed Edit service function
function editService(serviceId) {
    const service = servicesData.find(s => s.id === serviceId);
    if (!service) {
        showNotification('Service not found', 'error');
        return;
    }
    
    editingServiceId = serviceId;
    
    // Show modal first
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.add('active');
    }
    
    // Wait a moment for modal to be visible, then pre-fill form
    setTimeout(() => {
        // Pre-fill form fields - check if elements exist
        const nameField = document.getElementById('service-name');
        const priceField = document.getElementById('service-price');
        const categoryField = document.getElementById('service-category');
        const modalTitle = document.getElementById('service-modal-title');
        
        if (nameField) nameField.value = service.name;
        if (priceField) priceField.value = service.price;
        if (categoryField) categoryField.value = getCategoryForService(service);
        if (modalTitle) modalTitle.textContent = 'Edit Service';
        
        // If any field is missing, log it for debugging
        if (!nameField) console.error('service-name field not found');
        if (!priceField) console.error('service-price field not found');
        if (!categoryField) console.error('service-category field not found');
        
    }, 100);
}

// Delete service
function deleteService(serviceId) {
    const service = servicesData.find(s => s.id === serviceId);
    if (!service) {
        showNotification('Service not found', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
        // Remove from array
        servicesData = servicesData.filter(s => s.id !== serviceId);
        
        // Save to localStorage
        saveData();
        
        // Update UI
        if (typeof updateServiceMetrics === 'function') updateServiceMetrics();
        if (typeof renderServicesTable === 'function') renderServicesTable();
        
        showNotification(`"${service.name}" has been deleted`, 'success');
    }
}
// Close service modal
function closeServiceModal() {
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    editingServiceId = null;
}

// Handle service form submission
function handleServiceFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('service-name').value.trim();
    const price = parseFloat(document.getElementById('service-price').value);
    const category = document.getElementById('service-category').value;
    
    // Validation
    if (!name || !price || !category) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (price <= 0) {
        showNotification('Price must be greater than 0', 'error');
        return;
    }
    
    // Check if service name already exists (except when editing)
    const existingService = servicesData.find(s => 
        s.name.toLowerCase() === name.toLowerCase() && s.id !== editingServiceId
    );
    
    if (existingService) {
        showNotification('A service with this name already exists', 'error');
        return;
    }
    
    if (editingServiceId) {
        // Update existing service
        const serviceIndex = servicesData.findIndex(s => s.id === editingServiceId);
        if (serviceIndex !== -1) {
            servicesData[serviceIndex] = {
                ...servicesData[serviceIndex],
                name: name,
                price: price,
                category: category
            };
            showNotification(`"${name}" has been updated`, 'success');
        }
    } else {
        // Create new service
        const newService = {
            id: generateServiceId(name),
            name: name,
            price: price,
            category: category,
            duration: 30 // Default duration
        };
        
        servicesData.push(newService);
        showNotification(`"${name}" has been added`, 'success');
    }
    
    // Save and update UI
    saveData();
    renderServicesTable();
    closeServiceModal();
}

// Generate service ID
function generateServiceId(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 20) + '-' + Date.now();
}

// Create package
function createPackage() {
    editingPackageId = null;
    
    // Create and show package modal
    showPackageModal();
}

// Edit package
function editPackage(packageId) {
    const package = packagesData.find(p => p.id === packageId);
    if (!package) return;
    
    editingPackageId = packageId;
    showPackageModal(package);
}

// Delete package
function deletePackage(packageId) {
    const package = packagesData.find(p => p.id === packageId);
    if (!package) return;
    
    if (confirm(`Are you sure you want to delete "${package.name}"? This action cannot be undone.`)) {
        packagesData = packagesData.filter(p => p.id !== packageId);
        savePackagesData();
        renderPackagesGrid();
        showNotification(`"${package.name}" package has been deleted`, 'success');
    }
}

// Show package modal
function showPackageModal(package = null) {
    // Create modal HTML if it doesn't exist
    let modal = document.getElementById('package-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'package-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3 id="package-modal-title">${package ? 'Edit Package' : 'Create New Package'}</h3>
                    <button class="modal-close" onclick="closePackageModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <form id="package-form">
                        <div class="form-group">
                            <label for="package-name">Package Name</label>
                            <input type="text" id="package-name" required placeholder="Enter package name">
                        </div>
                        <div class="form-group">
                            <label for="package-description">Description</label>
                            <textarea id="package-description" rows="2" placeholder="Brief description of the package"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Select Services</label>
                            <div class="services-selection" id="package-services-selection">
                                ${servicesData.map(service => `
                                    <div class="service-checkbox">
                                        <input type="checkbox" id="pkg-service-${service.id}" value="${service.id}">
                                        <label for="pkg-service-${service.id}">
                                            ${service.name} - ₱${service.price}
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="package-price">Package Price (₱)</label>
                            <input type="number" id="package-price" required min="0" step="0.01" placeholder="0.00">
                            <small class="form-help">Original total: <span id="original-total-display">₱0</span></small>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="package-popular"> Mark as Popular
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closePackageModal()">Cancel</button>
                    <button type="submit" form="package-form" class="btn btn-primary">
                        ${package ? 'Update Package' : 'Create Package'}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('package-form').addEventListener('submit', handlePackageFormSubmit);
        
        // Add service selection change listener
        document.getElementById('package-services-selection').addEventListener('change', updatePackageTotal);
    }
    
    // Pre-fill form if editing
    if (package) {
        document.getElementById('package-name').value = package.name;
        document.getElementById('package-description').value = package.description || '';
        document.getElementById('package-price').value = package.packagePrice;
        document.getElementById('package-popular').checked = package.popular || false;
        
        // Check selected services
        package.services.forEach(serviceId => {
            const checkbox = document.getElementById(`pkg-service-${serviceId}`);
            if (checkbox) checkbox.checked = true;
        });
        
        updatePackageTotal();
    } else {
        // Reset form
        document.getElementById('package-form').reset();
        updatePackageTotal();
    }
    
    modal.classList.add('active');
}

// Close package modal
function closePackageModal() {
    const modal = document.getElementById('package-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    editingPackageId = null;
}

// Update package total when services are selected
function updatePackageTotal() {
    const selectedServices = document.querySelectorAll('#package-services-selection input:checked');
    let originalTotal = 0;
    
    selectedServices.forEach(checkbox => {
        const service = servicesData.find(s => s.id === checkbox.value);
        if (service) {
            originalTotal += service.price;
        }
    });
    
    document.getElementById('original-total-display').textContent = `₱${originalTotal}`;
    
    // Suggest a discounted price (20% off)
    const suggestedPrice = Math.round(originalTotal * 0.8);
    const packagePriceInput = document.getElementById('package-price');
    if (packagePriceInput && !packagePriceInput.value) {
        packagePriceInput.value = suggestedPrice;
    }
}

// Handle package form submission
function handlePackageFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('package-name').value.trim();
    const description = document.getElementById('package-description').value.trim();
    const packagePrice = parseFloat(document.getElementById('package-price').value);
    const popular = document.getElementById('package-popular').checked;
    
    // Get selected services
    const selectedServices = [];
    const serviceCheckboxes = document.querySelectorAll('#package-services-selection input:checked');
    serviceCheckboxes.forEach(checkbox => {
        selectedServices.push(checkbox.value);
    });
    
    // Validation
    if (!name || selectedServices.length === 0 || !packagePrice) {
        showNotification('Please fill in all required fields and select at least one service', 'error');
        return;
    }
    
    if (packagePrice <= 0) {
        showNotification('Package price must be greater than 0', 'error');
        return;
    }
    
    if (selectedServices.length < 2) {
        showNotification('A package must include at least 2 services', 'error');
        return;
    }
    
    // Calculate original price
    const originalPrice = selectedServices.reduce((total, serviceId) => {
        const service = servicesData.find(s => s.id === serviceId);
        return total + (service ? service.price : 0);
    }, 0);
    
    if (packagePrice >= originalPrice) {
        showNotification('Package price should be less than the original total for it to be a deal', 'warning');
    }
    
    if (editingPackageId) {
        // Update existing package
        const packageIndex = packagesData.findIndex(p => p.id === editingPackageId);
        if (packageIndex !== -1) {
            packagesData[packageIndex] = {
                ...packagesData[packageIndex],
                name: name,
                description: description,
                services: selectedServices,
                originalPrice: originalPrice,
                packagePrice: packagePrice,
                popular: popular
            };
            showNotification(`"${name}" package has been updated`, 'success');
        }
    } else {
        // Create new package
        const newPackage = {
            id: 'package-' + Date.now(),
            name: name,
            description: description,
            services: selectedServices,
            originalPrice: originalPrice,
            packagePrice: packagePrice,
            popular: popular
        };
        
        packagesData.push(newPackage);
        showNotification(`"${name}" package has been created`, 'success');
    }
    
    // Save and update UI
    savePackagesData();
    renderPackagesGrid();
    closePackageModal();
}

// Export services
function exportServices() {
    if (servicesData.length === 0) {
        showNotification('No services to export', 'warning');
        return;
    }
    
    const csvData = servicesData.map(service => ({
        'Service Name': service.name,
        'Price': service.price,
        'Category': getCategoryDisplayName(getCategoryForService(service)),
        'Description': service.description || ''
    }));
    
    exportToCSV(csvData, 'gq-barbershop-services.csv');
    showNotification('Services exported successfully', 'success');
}

// Make functions globally available
window.initServicesManagement = initServicesManagement;
window.addService = addService;
window.editService = editService;
window.deleteService = deleteService;
window.closeServiceModal = closeServiceModal;
window.filterByCategory = filterByCategory;
window.filterServices = filterServices;
window.createPackage = createPackage;
window.editPackage = editPackage;
window.deletePackage = deletePackage;
window.closePackageModal = closePackageModal;
window.exportServices = exportServices;

// ====================================
// EVENT LISTENERS
// ====================================

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Login form handler
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Password toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
    
    // Quick add form handler
    const quickAddForm = document.getElementById('quick-add-form');
    if (quickAddForm) {
        quickAddForm.addEventListener('submit', handleQuickAddForm);
    }
    
    // Add to queue form handler
    const addQueueForm = document.getElementById('add-queue-form');
    if (addQueueForm) {
        addQueueForm.addEventListener('submit', handleAddToQueueForm);
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-overlay')) {
            const modal = event.target;
            modal.classList.remove('active');
        }
    });
    
    // Initialize based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'admin-dashboard.html':
            if (checkAuth()) initDashboard();
            break;
        case 'admin-queue.html':
            if (checkAuth()) initQueueManagement();
            break;
        case 'admin-barbers.html':
            if (checkAuth()) initStaffManagement();
            break;
        case 'admin-services.html':
            if (checkAuth()) initServicesManagement();
            break;
        default:
            // Login page or other pages
            break;
    }
});

// ====================================
// ADDITIONAL UTILITY FUNCTIONS
// ====================================

// Export data to CSV
function exportToCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8," + 
        data.map(e => Object.values(e).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Print report
function printReport() {
    window.print();
}

// Search functionality
function search(query, data, fields) {
    if (!query) return data;
    
    const lowercaseQuery = query.toLowerCase();
    return data.filter(item => {
        return fields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(lowercaseQuery);
        });
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format time
function formatDateTime(date) {
    return new Date(date).toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize the system
console.log('GQ Barbershop Admin System Loaded');

// Export functions for global access
window.checkAuth = checkAuth;
window.logout = logout;
window.openQuickAddCustomer = openQuickAddCustomer;
window.closeQuickAddModal = closeQuickAddModal;
window.openAddToQueueModal = openAddToQueueModal;
window.closeAddToQueueModal = closeAddToQueueModal;
window.openQueueActions = openQueueActions;
window.closeQueueActionsModal = closeQueueActionsModal;
window.viewQueue = viewQueue;
window.updateStaffStatus = updateStaffStatus;
window.generateReport = generateReport;
window.callNext = callNext;
window.startService = startService;
window.completeService = completeService;
window.removeFromQueue = removeFromQueue;
window.refreshQueue = refreshQueue;
window.toggleAutoCall = toggleAutoCall;
window.filterQueue = filterQueue;
window.addStaff = addStaff;
window.editStaff = editStaff;
window.removeStaff = removeStaff;
window.changeStaffStatus = changeStaffStatus;
window.addService = addService;
window.editService = editService;
window.removeService = removeService;

/* ====================================
   DISCOUNT MANAGEMENT FUNCTIONS
   ==================================== */

// Global Variables for Discount Management
let discountData = [];
let filteredDiscounts = [];

// Initialize Discount Management
function initDiscountManagement() {
    loadDiscountData();
    updateDiscountMetrics();
    renderDiscountsTable();
    renderSummary();
    setupDiscountEventListeners();
    setupDateFilters();
}

// Load discount data from localStorage
function loadDiscountData() {
    const stored = localStorage.getItem('discountTransactions');
    if (stored) {
        discountData = JSON.parse(stored);
    } else {
        // Initialize with sample data
        discountData = [
            {
                id: 'W0001',
                costNumber: '#W0001',
                customerName: 'Mark Louis Reyes',
                discountType: 'pwd',
                idNumber: 'PWD223344',
                originalTotal: 1000,
                discountAmount: 200,
                finalTotal: 800,
                date: '2024-04-06',
                barber: 'Arnel',
                timestamp: new Date().toISOString()
            }
        ];
        saveDiscountData();
    }
}

// Save discount data to localStorage
function saveDiscountData() {
    localStorage.setItem('discountTransactions', JSON.stringify(discountData));
}

// Update discount metrics
function updateDiscountMetrics() {
    const today = new Date().toDateString();
    const todayDiscounts = discountData.filter(item => 
        new Date(item.timestamp).toDateString() === today
    );
    
    const totalDiscounts = todayDiscounts.length;
    const seniorCount = todayDiscounts.filter(item => item.discountType === 'senior').length;
    const pwdCount = todayDiscounts.filter(item => item.discountType === 'pwd').length;
    const tenantCount = todayDiscounts.filter(item => item.discountType === 'tenant').length;
    
    updateMetricElement('total-discounts-count', totalDiscounts);
    updateMetricElement('senior-discounts-count', seniorCount);
    updateMetricElement('pwd-discounts-count', pwdCount);
    updateMetricElement('tenant-discounts-count', tenantCount);
}

// Render discounts table
function renderDiscountsTable() {
    const tbody = document.querySelector('#discounts-table tbody');
    if (!tbody) return;
    
    const dataToRender = filteredDiscounts.length > 0 ? filteredDiscounts : discountData;
    
    if (dataToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-gray-medium" style="padding: 30px 0;">
                    No discount transactions found.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = dataToRender.map(discount => `
        <tr>
            <td>
                <input type="checkbox" class="row-checkbox" value="${discount.id}" onchange="updateDeleteButton()">
            </td>
            <td class="transaction-id">${discount.costNumber}</td>
            <td>${discount.customerName}</td>
            <td>
                <span class="discount-badge ${discount.discountType}">
                    ${getDiscountTypeName(discount.discountType)}
                </span>
            </td>
            <td>${discount.idNumber}</td>
            <td class="amount-original">₱${discount.originalTotal.toFixed(2)}</td>
            <td class="amount-discount">₱${discount.discountAmount.toFixed(2)}</td>
            <td class="amount-final">₱${discount.finalTotal.toFixed(2)}</td>
            <td>${formatDate(discount.date)}</td>
            <td>${discount.barber}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-primary btn-sm" onclick="editDiscount('${discount.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteDiscount('${discount.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get discount type display name
function getDiscountTypeName(type) {
    const types = {
        'senior': 'Senior',
        'pwd': 'PWD',
        'tenant': 'SM Tenant'
    };
    return types[type] || type;
}

// Render summary section
function renderSummary() {
    const today = new Date().toDateString();
    const todayDiscounts = discountData.filter(item => 
        new Date(item.timestamp).toDateString() === today
    );
    
    const totalDiscountAmount = todayDiscounts.reduce((sum, item) => sum + item.discountAmount, 0);
    const totalTransactions = todayDiscounts.length;
    
    // Find most used discount type
    const typeCount = {};
    todayDiscounts.forEach(item => {
        typeCount[item.discountType] = (typeCount[item.discountType] || 0) + 1;
    });
    
    const mostUsedType = Object.keys(typeCount).reduce((a, b) => 
        typeCount[a] > typeCount[b] ? a : b, 'senior'
    );
    
    const mostUsedCount = typeCount[mostUsedType] || 0;
    const mostUsedPercentage = totalTransactions > 0 ? 
        Math.round((mostUsedCount / totalTransactions) * 100) : 0;
    
    updateMetricElement('total-discount-amount', `₱${totalDiscountAmount.toLocaleString()}`);
    updateMetricElement('total-discount-count-summary', `${totalTransactions} transactions`);
    updateMetricElement('revenue-loss', `₱${totalDiscountAmount.toLocaleString()}`);
    updateMetricElement('most-used-discount', getDiscountTypeName(mostUsedType));
    updateMetricElement('most-used-percentage', `${mostUsedPercentage}% of transactions`);
}

// Setup event listeners
function setupDiscountEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('discount-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.toLowerCase();
            filteredDiscounts = discountData.filter(discount => 
                discount.customerName.toLowerCase().includes(query) ||
                discount.costNumber.toLowerCase().includes(query) ||
                discount.idNumber.toLowerCase().includes(query) ||
                discount.barber.toLowerCase().includes(query)
            );
            renderDiscountsTable();
        }, 300));
    }
    
    // Form submission
    const discountForm = document.getElementById('discount-form');
    if (discountForm) {
        discountForm.addEventListener('submit', handleDiscountFormSubmit);
    }
}

// Setup date filters
function setupDateFilters() {
    const today = new Date();
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    
    if (startDate) {
        startDate.value = today.toISOString().split('T')[0];
    }
    if (endDate) {
        endDate.value = today.toISOString().split('T')[0];
    }
}

// Search customer by queue number (last 3 digits)
function searchCustomerByNumber(digits) {
    if (digits.length !== 3) {
        clearCustomerForm();
        return;
    }
    
    // Search in queue data for matching numbers
    const foundCustomer = queueData.find(customer => {
        const queueNumber = customer.queueNumber || '';
        return queueNumber.slice(-3) === digits;
    });
    
    if (foundCustomer) {
        // Auto-fill customer data
        document.getElementById('customer-name').value = foundCustomer.customerName || 'Customer';
        document.getElementById('original-total').value = foundCustomer.total || 0;
        
        // Get staff name - handle different data structures
        let staffName = '';
        if (foundCustomer.staff) {
            staffName = foundCustomer.staff;
        } else if (foundCustomer.assignments && foundCustomer.assignments.length > 0) {
            staffName = foundCustomer.assignments.map(a => a.staffName).join(', ');
        }
        document.getElementById('assigned-barber').value = staffName;
        
        // Calculate discount when amount is available
        calculateDiscount();
        
        showNotification('Customer found! Data auto-filled.', 'success');
    } else {
        clearCustomerForm();
        showNotification('Customer not found with those digits.', 'warning');
    }
}

// Clear customer form data
function clearCustomerForm() {
    document.getElementById('customer-name').value = '';
    document.getElementById('original-total').value = '';
    document.getElementById('assigned-barber').value = '';
    document.getElementById('transaction-id').value = '';
    
    // Reset summary display
    document.getElementById('display-original').textContent = '₱0.00';
    document.getElementById('display-discount').textContent = '₱0.00';
    document.getElementById('display-final').textContent = '₱0.00';
}

// Generate transaction ID from ID number
function generateTransactionId() {
    const idNumber = document.getElementById('id-number').value;
    const transactionIdField = document.getElementById('transaction-id');
    
    if (idNumber && idNumber.length >= 3) {
        const lastThreeDigits = idNumber.slice(-3);
        transactionIdField.value = lastThreeDigits;
    } else {
        transactionIdField.value = '';
    }
}

// Update discount information when type changes
function updateDiscountInfo() {
    calculateDiscount();
}

// Calculate discount amounts
function calculateDiscount() {
    const originalTotal = parseFloat(document.getElementById('original-total').value) || 0;
    const discountPercentage = 0.20; // 20% discount for all types
    
    const discountAmount = originalTotal * discountPercentage;
    const finalTotal = originalTotal - discountAmount;
    
    // Update display elements
    document.getElementById('display-original').textContent = `₱${originalTotal.toFixed(2)}`;
    document.getElementById('display-discount').textContent = `₱${discountAmount.toFixed(2)}`;
    document.getElementById('display-final').textContent = `₱${finalTotal.toFixed(2)}`;
}

// Handle form submission
function handleDiscountFormSubmit(event) {
    event.preventDefault();
    
    const customerName = document.getElementById('customer-name').value;
    const discountType = document.getElementById('discount-type').value;
    const idNumber = document.getElementById('id-number').value;
    const originalTotal = parseFloat(document.getElementById('original-total').value);
    const barber = document.getElementById('assigned-barber').value;
    const transactionId = document.getElementById('transaction-id').value;
    
    // Validation
    if (!customerName || !discountType || !idNumber || !originalTotal || !barber) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (originalTotal <= 0) {
        showNotification('Original total must be greater than 0', 'error');
        return;
    }
    
    // Calculate discount
    const discountAmount = originalTotal * 0.20;
    const finalTotal = originalTotal - discountAmount;
    
    // Generate cost number
    const costNumber = generateCostNumber();
    
    // Create new discount transaction
    const newDiscount = {
        id: generateUniqueId(),
        costNumber: costNumber,
        customerName: customerName,
        discountType: discountType,
        idNumber: idNumber,
        originalTotal: originalTotal,
        discountAmount: discountAmount,
        finalTotal: finalTotal,
        date: new Date().toISOString().split('T')[0],
        barber: barber,
        timestamp: new Date().toISOString()
    };
    
    // Add to data
    discountData.unshift(newDiscount);
    saveDiscountData();
    
    // Update UI
    updateDiscountMetrics();
    renderDiscountsTable();
    renderSummary();
    closeDiscountModal();
    
    showNotification('Discount transaction added successfully', 'success');
}

// Generate cost number
function generateCostNumber() {
    const count = discountData.length + 1;
    return `#W${count.toString().padStart(4, '0')}`;
}

// Generate unique ID
function generateUniqueId() {
    return 'discount_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Modal functions
function addDiscount() {
    const modal = document.getElementById('discount-modal');
    if (modal) {
        // Reset form
        document.getElementById('discount-form').reset();
        document.getElementById('display-original').textContent = '₱0.00';
        document.getElementById('display-discount').textContent = '₱0.00';
        document.getElementById('display-final').textContent = '₱0.00';
        document.getElementById('transaction-id').value = '';
        modal.classList.add('active');
    }
}

function closeDiscountModal() {
    const modal = document.getElementById('discount-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Filter functions
function filterDiscounts() {
    const typeFilter = document.getElementById('discount-type-filter').value;
    
    if (typeFilter === 'all') {
        filteredDiscounts = [];
    } else {
        filteredDiscounts = discountData.filter(discount => discount.discountType === typeFilter);
    }
    
    renderDiscountsTable();
}

function applyDateFilter() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates', 'warning');
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    
    filteredDiscounts = discountData.filter(discount => {
        const discountDate = new Date(discount.timestamp);
        return discountDate >= start && discountDate <= end;
    });
    
    renderDiscountsTable();
    showNotification('Date filter applied', 'success');
}

// Selection functions
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('select-all');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        const row = checkbox.closest('tr');
        if (checkbox.checked) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });
    
    updateDeleteButton();
}

function updateDeleteButton() {
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    const deleteButton = document.querySelector('[onclick="deleteSelected()"]');
    
    if (deleteButton) {
        if (selectedCheckboxes.length > 0) {
            deleteButton.style.display = 'inline-flex';
        } else {
            deleteButton.style.display = 'none';
        }
    }
    
    // Update row highlighting
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (checkbox.checked) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });
}

// CRUD operations
function editDiscount(discountId) {
    const discount = discountData.find(d => d.id === discountId);
    if (!discount) return;
    
    // Pre-fill the form with existing data
    document.getElementById('customer-name').value = discount.customerName;
    document.getElementById('discount-type').value = discount.discountType;
    document.getElementById('id-number').value = discount.idNumber;
    document.getElementById('original-total').value = discount.originalTotal;
    document.getElementById('assigned-barber').value = discount.barber;
    
    // Generate transaction ID and calculate discount
    generateTransactionId();
    calculateDiscount();
    
    // Store the ID for updating
    window.editingDiscountId = discountId;
    
    // Open modal
    addDiscount();
    
    // Change modal title
    const modalTitle = document.querySelector('#discount-modal .modal-header h3');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Discounted Transaction';
    }
}

function deleteDiscount(discountId) {
    if (confirm('Are you sure you want to delete this discount transaction?')) {
        discountData = discountData.filter(d => d.id !== discountId);
        saveDiscountData();
        updateDiscountMetrics();
        renderDiscountsTable();
        renderSummary();
        showNotification('Discount transaction deleted', 'success');
    }
}

function deleteSelected() {
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.value);
    
    if (selectedIds.length === 0) {
        showNotification('No transactions selected', 'warning');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected transactions?`)) {
        discountData = discountData.filter(d => !selectedIds.includes(d.id));
        saveDiscountData();
        updateDiscountMetrics();
        renderDiscountsTable();
        renderSummary();
        
        // Reset select all checkbox
        const selectAllCheckbox = document.getElementById('select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        
        updateDeleteButton();
        showNotification(`${selectedIds.length} transactions deleted`, 'success');
    }
}

function refreshDiscounts() {
    loadDiscountData();
    updateDiscountMetrics();
    renderDiscountsTable();
    renderSummary();
    
    // Clear filters
    document.getElementById('discount-type-filter').value = 'all';
    document.getElementById('discount-search').value = '';
    filteredDiscounts = [];
    
    showNotification('Discount data refreshed', 'success');
}

function exportDiscounts() {
    if (discountData.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const csvData = discountData.map(discount => ({
        'Cost Number': discount.costNumber,
        'Customer Name': discount.customerName,
        'Discount Type': getDiscountTypeName(discount.discountType),
        'ID Number': discount.idNumber,
        'Original Total': discount.originalTotal,
        'Discount Amount': discount.discountAmount,
        'Final Total': discount.finalTotal,
        'Date': discount.date,
        'Barber': discount.barber
    }));
    
    exportToCSV(csvData, 'gq-barbershop-discounts.csv');
    showNotification('Discount data exported successfully', 'success');
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Update the existing handleDiscountFormSubmit to handle editing
function handleDiscountFormSubmit(event) {
    event.preventDefault();
    
    const customerName = document.getElementById('customer-name').value;
    const discountType = document.getElementById('discount-type').value;
    const idNumber = document.getElementById('id-number').value;
    const originalTotal = parseFloat(document.getElementById('original-total').value);
    const barber = document.getElementById('assigned-barber').value;
    
    // Validation
    if (!customerName || !discountType || !idNumber || !originalTotal || !barber) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (originalTotal <= 0) {
        showNotification('Original total must be greater than 0', 'error');
        return;
    }
    
    // Calculate discount
    const discountAmount = originalTotal * 0.20;
    const finalTotal = originalTotal - discountAmount;
    
    if (window.editingDiscountId) {
        // Update existing discount
        const discountIndex = discountData.findIndex(d => d.id === window.editingDiscountId);
        if (discountIndex !== -1) {
            discountData[discountIndex] = {
                ...discountData[discountIndex],
                customerName: customerName,
                discountType: discountType,
                idNumber: idNumber,
                originalTotal: originalTotal,
                discountAmount: discountAmount,
                finalTotal: finalTotal,
                barber: barber
            };
            
            showNotification('Discount transaction updated successfully', 'success');
        }
        
        // Clear editing state
        window.editingDiscountId = null;
        
        // Reset modal title
        const modalTitle = document.querySelector('#discount-modal .modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'Add Discounted Transaction';
        }
    } else {
        // Create new discount transaction
        const costNumber = generateCostNumber();
        
        const newDiscount = {
            id: generateUniqueId(),
            costNumber: costNumber,
            customerName: customerName,
            discountType: discountType,
            idNumber: idNumber,
            originalTotal: originalTotal,
            discountAmount: discountAmount,
            finalTotal: finalTotal,
            date: new Date().toISOString().split('T')[0],
            barber: barber,
            timestamp: new Date().toISOString()
        };
        
        discountData.unshift(newDiscount);
        showNotification('Discount transaction added successfully', 'success');
    }
    
    // Save and update UI
    saveDiscountData();
    updateDiscountMetrics();
    renderDiscountsTable();
    renderSummary();
    closeDiscountModal();
}

// Make functions globally available
window.initDiscountManagement = initDiscountManagement;
window.addDiscount = addDiscount;
window.closeDiscountModal = closeDiscountModal;
window.filterDiscounts = filterDiscounts;
window.applyDateFilter = applyDateFilter;
window.toggleSelectAll = toggleSelectAll;
window.updateDeleteButton = updateDeleteButton;
window.editDiscount = editDiscount;
window.deleteDiscount = deleteDiscount;
window.deleteSelected = deleteSelected;
window.refreshDiscounts = refreshDiscounts;
window.exportDiscounts = exportDiscounts;
window.searchCustomerByNumber = searchCustomerByNumber;
window.generateTransactionId = generateTransactionId;
window.updateDiscountInfo = updateDiscountInfo;
window.calculateDiscount = calculateDiscount;

