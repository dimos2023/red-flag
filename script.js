// ===== Red Flag Platform - JavaScript =====

// ===== Global Variables =====
let currentUser = null;
let currentFilter = 'ALL';
let selectedReportId = null;

// ===== Demo Data =====
const demoUsers = [
    {
        id: '1',
        name: 'Demo User',
        email: 'user@test.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'USER',
        emailVerified: true,
        phoneVerified: true
    },
    {
        id: '2',
        name: 'Admin User',
        email: 'admin@test.com',
        phone: '+0987654321',
        password: 'admin123',
        role: 'ADMIN',
        emailVerified: true,
        phoneVerified: true
    }
];

let demoReports = [
    {
        id: '1',
        scammerPhone: '+1234567890',
        scammerName: 'John Smith',
        scammerAddress: 'New York, USA',
        scammerNationalId: '123456789',
        description: 'This person contacted me via phone claiming to be from a tech support company. They asked for remote access to my computer and $500 for "virus removal". After paying, they never contacted me again.',
        status: 'APPROVED',
        reporterId: '1',
        adminNotes: 'Valid report with detailed information.',
        createdAt: new Date('2024-12-15').toISOString()
    },
    {
        id: '2',
        scammerPhone: '+1111111111',
        scammerName: 'Fake Investment',
        scammerAddress: 'Unknown',
        scammerNationalId: null,
        description: 'Promised high returns on investment. After depositing $2000, they disappeared and blocked all communication.',
        status: 'APPROVED',
        reporterId: '1',
        adminNotes: 'Clear investment scam pattern.',
        createdAt: new Date('2024-12-10').toISOString()
    },
    {
        id: '3',
        scammerPhone: '+2222222222',
        scammerName: 'Online Shop Scammer',
        scammerAddress: 'Unknown',
        scammerNationalId: null,
        description: 'Ordered products online, paid in advance, never received items. Seller stopped responding.',
        status: 'PENDING',
        reporterId: '1',
        adminNotes: null,
        createdAt: new Date('2025-01-05').toISOString()
    }
];

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
    // Set current year
    const yearElements = document.querySelectorAll('#currentYear');
    yearElements.forEach(el => {
        el.textContent = new Date().getFullYear();
    });

    // Check for logged in user
    checkAuth();

    // Initialize page-specific functionality
    initPage();
});

// ===== Page Initialization =====
function initPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';

    switch(filename) {
        case 'index.html':
            initHomePage();
            break;
        case 'register.html':
            initRegisterPage();
            break;
        case 'login.html':
            initLoginPage();
            break;
        case 'report.html':
            initReportPage();
            break;
        case 'search.html':
            initSearchPage();
            break;
        case 'search-results.html':
            initSearchResultsPage();
            break;
        case 'admin.html':
            initAdminPage();
            break;
    }
}

// ===== Home Page =====
function initHomePage() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('mobile-active');
        });
    }
}

// ===== Register Page =====
function initRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    const emailVerifyForm = document.getElementById('emailVerifyForm');
    const phoneVerifyForm = document.getElementById('phoneVerifyForm');

    // Registration form
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Email verification form
    if (emailVerifyForm) {
        emailVerifyForm.addEventListener('submit', handleEmailVerify);
    }

    // Phone verification form
    if (phoneVerifyForm) {
        phoneVerifyForm.addEventListener('submit', handlePhoneVerify);
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    // Check if email already exists
    if (demoUsers.find(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }

    if (demoUsers.find(u => u.phone === phone)) {
        showToast('Phone number already registered', 'error');
        return;
    }

    // Generate verification codes
    const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
    const phoneCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in sessionStorage for demo
    sessionStorage.setItem('tempUser', JSON.stringify({
        name,
        email,
        phone,
        password,
        emailCode,
        phoneCode
    }));

    // Show codes in console (for demo)
    console.log('Email verification code:', emailCode);
    console.log('Phone verification code:', phoneCode);
    
    // Show codes in alert for demo
    alert(`Demo Verification Codes:\nEmail: ${emailCode}\nPhone: ${phoneCode}`);

    // Move to email verification step
    showStep('step-email-verify');
    document.getElementById('emailVerifyText').textContent = 
        `We sent a verification code to ${email}`;
    
    showToast('Registration successful! Please verify your email.', 'success');
}

function handleEmailVerify(e) {
    e.preventDefault();
    
    const tempUser = JSON.parse(sessionStorage.getItem('tempUser') || '{}');
    const code = document.getElementById('emailCode').value;

    if (code === tempUser.emailCode) {
        tempUser.emailVerified = true;
        sessionStorage.setItem('tempUser', JSON.stringify(tempUser));
        
        showStep('step-phone-verify');
        document.getElementById('phoneVerifyText').textContent = 
            `We sent an OTP code to ${tempUser.phone}`;
        
        showToast('Email verified! Please verify your phone.', 'success');
    } else {
        showToast('Invalid verification code', 'error');
    }
}

function handlePhoneVerify(e) {
    e.preventDefault();
    
    const tempUser = JSON.parse(sessionStorage.getItem('tempUser') || '{}');
    const code = document.getElementById('phoneCode').value;

    if (code === tempUser.phoneCode) {
        // Create user
        const newUser = {
            id: Date.now().toString(),
            name: tempUser.name,
            email: tempUser.email,
            phone: tempUser.phone,
            password: tempUser.password,
            role: 'USER',
            emailVerified: true,
            phoneVerified: true
        };

        demoUsers.push(newUser);
        sessionStorage.removeItem('tempUser');

        showStep('step-success');
        showToast('Phone verified! Account created successfully.', 'success');
    } else {
        showToast('Invalid OTP code', 'error');
    }
}

function showStep(stepId) {
    document.querySelectorAll('.auth-step').forEach(step => {
        step.classList.remove('active');
        step.classList.add('hidden');
    });
    
    const activeStep = document.getElementById(stepId);
    if (activeStep) {
        activeStep.classList.remove('hidden');
        activeStep.classList.add('active');
    }
}

// ===== Login Page =====
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Find user
    const user = demoUsers.find(u => u.email === email && u.password === password);

    if (!user) {
        showToast('Invalid email or password', 'error');
        return;
    }

    if (!user.emailVerified || !user.phoneVerified) {
        showToast('Please verify your email and phone number', 'error');
        return;
    }

    // Login successful
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));

    showToast('Login successful!', 'success');

    // Redirect based on role
    if (user.role === 'ADMIN') {
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
    } else {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ===== Report Page =====
function initReportPage() {
    const reportForm = document.getElementById('reportForm');
    
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportSubmit);
    }

    // File preview handlers
    const profilePhotoInput = document.getElementById('profilePhoto');
    const nationalIdPhotoInput = document.getElementById('nationalIdPhoto');

    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function(e) {
            handleFilePreview(e, 'profilePreview');
        });
    }

    if (nationalIdPhotoInput) {
        nationalIdPhotoInput.addEventListener('change', function(e) {
            handleFilePreview(e, 'nationalIdPreview');
        });
    }
}

function handleFilePreview(event, previewId) {
    const file = event.target.files[0];
    const preview = document.getElementById(previewId);
    
    if (file && preview) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

function handleReportSubmit(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!currentUser) {
        showToast('Please login to submit a report', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const scammerPhone = document.getElementById('scammerPhone').value;
    const scammerName = document.getElementById('scammerName').value;
    const scammerAddress = document.getElementById('scammerAddress').value;
    const scammerNationalId = document.getElementById('scammerNationalId').value;
    const description = document.getElementById('description').value;

    if (!scammerPhone || !description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Create report
    const newReport = {
        id: Date.now().toString(),
        scammerPhone,
        scammerName: scammerName || null,
        scammerAddress: scammerAddress || null,
        scammerNationalId: scammerNationalId || null,
        description,
        status: 'PENDING',
        reporterId: currentUser.id,
        adminNotes: null,
        createdAt: new Date().toISOString()
    };

    demoReports.push(newReport);

    // Reset form
    document.getElementById('reportForm').reset();
    document.getElementById('profilePreview').innerHTML = '<span class="file-preview-icon">📷</span>';
    document.getElementById('nationalIdPreview').innerHTML = '<span class="file-preview-icon">📷</span>';

    showToast('Report submitted successfully! It will be reviewed by our team.', 'success');
}

// ===== Search Page =====
function initSearchPage() {
    const searchForm = document.getElementById('searchForm');
    const searchType = document.getElementById('searchType');
    const searchValueLabel = document.getElementById('searchValueLabel');
    const searchValue = document.getElementById('searchValue');

    // Update label when search type changes
    if (searchType && searchValueLabel) {
        searchType.addEventListener('change', function() {
            const type = this.value;
            const labels = {
                phone: 'Phone Number',
                name: 'Name',
                nationalId: 'National ID',
                address: 'Address'
            };
            const placeholders = {
                phone: '+1234567890',
                name: 'John Doe',
                nationalId: 'Enter ID number',
                address: 'City, State, Country'
            };

            searchValueLabel.textContent = labels[type];
            searchValue.placeholder = placeholders[type];
        });
    }

    // Handle search
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const type = searchType.value;
            const value = searchValue.value.trim();

            if (!value) {
                showToast('Please enter a search value', 'error');
                return;
            }

            // Redirect to results page
            window.location.href = `search-results.html?type=${encodeURIComponent(type)}&value=${encodeURIComponent(value)}`;
        });
    }
}

// ===== Search Results Page =====
function initSearchResultsPage() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const value = urlParams.get('value');

    if (!type || !value) {
        showToast('Invalid search parameters', 'error');
        setTimeout(() => {
            window.location.href = 'search.html';
        }, 1500);
        return;
    }

    performSearch(type, value);
}

function performSearch(type, value) {
    const loadingState = document.getElementById('loadingState');
    const resultsContainer = document.getElementById('resultsContainer');

    if (loadingState) loadingState.classList.remove('hidden');
    if (resultsContainer) resultsContainer.classList.add('hidden');

    // Simulate API delay
    setTimeout(() => {
        const reports = searchReports(type, value);
        displayResults(type, value, reports);
    }, 500);
}

function searchReports(type, value) {
    const searchTerm = value.toLowerCase();
    
    return demoReports.filter(report => {
        if (report.status !== 'APPROVED') return false;

        switch(type) {
            case 'phone':
                return report.scammerPhone.toLowerCase().includes(searchTerm);
            case 'name':
                return report.scammerName && report.scammerName.toLowerCase().includes(searchTerm);
            case 'nationalId':
                return report.scammerNationalId && report.scammerNationalId.toLowerCase().includes(searchTerm);
            case 'address':
                return report.scammerAddress && report.scammerAddress.toLowerCase().includes(searchTerm);
            default:
                return false;
        }
    });
}

function displayResults(type, value, reports) {
    const loadingState = document.getElementById('loadingState');
    const resultsContainer = document.getElementById('resultsContainer');

    if (loadingState) loadingState.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.remove('hidden');

    // Update search info
    const typeLabels = {
        phone: 'Phone Number',
        name: 'Name',
        nationalId: 'National ID',
        address: 'Address'
    };

    document.getElementById('searchTypeLabel').textContent = typeLabels[type];
    document.getElementById('searchValue').textContent = value;

    // Show appropriate flag
    const redFlagCard = document.getElementById('redFlagCard');
    const greenFlagCard = document.getElementById('greenFlagCard');
    const reportsList = document.getElementById('reportsList');

    if (reports.length > 0) {
        if (redFlagCard) redFlagCard.classList.remove('hidden');
        if (greenFlagCard) greenFlagCard.classList.add('hidden');
        if (reportsList) {
            reportsList.classList.remove('hidden');
            document.getElementById('reportCount').textContent = reports.length;
        }

        // Display report details
        const reportsContainerDiv = document.getElementById('reportsContainer');
        if (reportsContainerDiv) {
            reportsContainerDiv.innerHTML = reports.map(report => `
                <div class="report-detail-card">
                    <div class="report-detail-header">
                        <div>
                            <h3 class="report-detail-title">${report.scammerName || 'Unknown'}</h3>
                            <p class="report-detail-meta">Reported on ${new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span class="admin-report-status status-approved">APPROVED</span>
                    </div>
                    <div class="report-detail-section">
                        <span class="report-detail-label">Phone:</span>
                        <span class="report-detail-value">${report.scammerPhone}</span>
                    </div>
                    ${report.scammerAddress ? `
                    <div class="report-detail-section">
                        <span class="report-detail-label">Address:</span>
                        <span class="report-detail-value">${report.scammerAddress}</span>
                    </div>` : ''}
                    <div class="report-detail-section">
                        <span class="report-detail-label">Description:</span>
                        <span class="report-detail-value">${report.description}</span>
                    </div>
                </div>
            `).join('');
        }
    } else {
        if (redFlagCard) redFlagCard.classList.add('hidden');
        if (greenFlagCard) {
            greenFlagCard.classList.remove('hidden');
            document.getElementById('flagTypeLabel').textContent = typeLabels[type].toLowerCase();
        }
        if (reportsList) reportsList.classList.add('hidden');
    }
}

// ===== Admin Page =====
function initAdminPage() {
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'ADMIN') {
        showToast('Admin access required', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    // Load reports
    loadReports();

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            loadReports();
        });
    });

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadReports);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Modal handlers
    const modal = document.getElementById('reviewModal');
    const closeModal = document.getElementById('closeModal');
    const cancelReview = document.getElementById('cancelReview');
    const approveReport = document.getElementById('approveReport');
    const rejectReport = document.getElementById('rejectReport');

    if (closeModal) {
        closeModal.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (cancelReview) {
        cancelReview.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (approveReport) {
        approveReport.addEventListener('click', () => handleReportAction('APPROVED'));
    }

    if (rejectReport) {
        rejectReport.addEventListener('click', () => handleReportAction('REJECTED'));
    }

    // Close modal on background click
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
}

function loadReports() {
    const loadingState = document.getElementById('adminLoadingState');
    const reportsContainer = document.getElementById('adminReportsContainer');
    const noReports = document.getElementById('noReports');

    if (loadingState) loadingState.classList.remove('hidden');
    if (reportsContainer) reportsContainer.innerHTML = '';
    if (noReports) noReports.classList.add('hidden');

    // Filter reports
    let filteredReports = demoReports;
    if (currentFilter !== 'ALL') {
        filteredReports = demoReports.filter(r => r.status === currentFilter);
    }

    // Simulate API delay
    setTimeout(() => {
        if (loadingState) loadingState.classList.add('hidden');

        // Update stats
        document.getElementById('totalReports').textContent = demoReports.length;
        document.getElementById('pendingReports').textContent = demoReports.filter(r => r.status === 'PENDING').length;
        document.getElementById('approvedReports').textContent = demoReports.filter(r => r.status === 'APPROVED').length;

        if (filteredReports.length === 0) {
            if (noReports) noReports.classList.remove('hidden');
        } else {
            filteredReports.forEach(report => {
                const reporter = demoUsers.find(u => u.id === report.reporterId);
                const card = createAdminReportCard(report, reporter);
                if (reportsContainer) reportsContainer.appendChild(card);
            });
        }
    }, 300);
}

function createAdminReportCard(report, reporter) {
    const card = document.createElement('div');
    card.className = 'admin-report-card';
    
    const statusClass = `status-${report.status.toLowerCase()}`;
    
    card.innerHTML = `
        <div class="admin-report-header">
            <div>
                <h3 class="report-detail-title">${report.scammerName || 'Unknown'}</h3>
                <p class="report-detail-meta">Phone: ${report.scammerPhone}</p>
                ${reporter ? `<p class="report-detail-meta">Reported by: ${reporter.name}</p>` : ''}
            </div>
            <span class="admin-report-status ${statusClass}">${report.status}</span>
        </div>
        <p style="margin-bottom: 1rem; font-size: 0.875rem; color: #6b7280;">
            ${report.description.substring(0, 100)}${report.description.length > 100 ? '...' : ''}
        </p>
        <div class="admin-report-actions">
            <button class="btn btn-secondary btn-sm" onclick="viewReportDetails('${report.id}')">
                View Details
            </button>
            ${report.status === 'PENDING' ? `
            <button class="btn btn-success btn-sm" onclick="openReviewModal('${report.id}')">
                Approve
            </button>
            <button class="btn btn-danger btn-sm" onclick="openReviewModal('${report.id}')">
                Reject
            </button>
            ` : ''}
        </div>
    `;
    
    return card;
}

function viewReportDetails(reportId) {
    const report = demoReports.find(r => r.id === reportId);
    if (!report) return;

    alert(`Full Report Details:\n\n` +
        `Phone: ${report.scammerPhone}\n` +
        `Name: ${report.scammerName || 'Not provided'}\n` +
        `Address: ${report.scammerAddress || 'Not provided'}\n` +
        `National ID: ${report.scammerNationalId || 'Not provided'}\n` +
        `Status: ${report.status}\n` +
        `Description: ${report.description}\n` +
        `Admin Notes: ${report.adminNotes || 'None'}\n` +
        `Created: ${new Date(report.createdAt).toLocaleString()}`
    );
}

function openReviewModal(reportId) {
    selectedReportId = reportId;
    const modal = document.getElementById('reviewModal');
    const report = demoReports.find(r => r.id === reportId);
    
    if (modal && report) {
        document.getElementById('adminNotes').value = report.adminNotes || '';
        document.getElementById('reportDetails').innerHTML = `
            <p><strong>Phone:</strong> ${report.scammerPhone}</p>
            <p><strong>Name:</strong> ${report.scammerName || 'Not provided'}</p>
            <p><strong>Address:</strong> ${report.scammerAddress || 'Not provided'}</p>
            <p><strong>National ID:</strong> ${report.scammerNationalId || 'Not provided'}</p>
            <div style="margin-top: 1rem;">
                <p><strong>Description:</strong></p>
                <p style="background: var(--color-gray-100); padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem;">
                    ${report.description}
                </p>
            </div>
        `;
        modal.classList.remove('hidden');
    }
}

function handleReportAction(action) {
    const report = demoReports.find(r => r.id === selectedReportId);
    if (!report) return;

    const adminNotes = document.getElementById('adminNotes').value;
    report.status = action;
    report.adminNotes = adminNotes;

    const modal = document.getElementById('reviewModal');
    modal.classList.add('hidden');

    showToast(action === 'APPROVED' ? 'Report approved successfully' : 'Report rejected', 'success');
    loadReports();
}

// ===== Auth Helpers =====
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container');
    if (!container) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    const containerEl = document.querySelector('.toast-container');
    if (containerEl) {
        containerEl.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}
