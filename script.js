// ===== Red Flag Platform - JavaScript =====

// ===== Global Variables =====
let currentUser = null;
let currentFilter = 'ALL';
let selectedReportId = null;
const adminEmails = ['admin@test.com', 'admin@regflag.com', 'AhmedAshry.hh@gmail.com'];
const REPORTS_STORAGE_KEY = 'reportsData';

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

// ===== Auth Helpers (Firebase + local persistence) =====
function isAdminEmail(email = '') {
    const target = email.toLowerCase();
    return adminEmails.some(a => a.toLowerCase() === target);
}

function getStoredUserProfile(uid) {
    const raw = localStorage.getItem(`userProfile_${uid}`);
    return raw ? JSON.parse(raw) : null;
}

function saveUserProfile(profile) {
    if (!profile || !profile.id) return;
    localStorage.setItem(`userProfile_${profile.id}`, JSON.stringify(profile));
}

function buildLocalProfile(user, phone = '') {
    if (!user) return null;
    const role = isAdminEmail(user.email) ? 'ADMIN' : 'USER';
    return {
        id: user.uid,
        name: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
        email: user.email,
        phone: phone || '',
        role,
        emailVerified: user.emailVerified,
        phoneVerified: true
    };
}

function ensureDemoUser(profile) {
    if (!profile) return;
    if (!demoUsers.find(u => u.id === profile.id)) {
        demoUsers.push({
            id: profile.id,
            name: profile.name || 'User',
            email: profile.email,
            phone: profile.phone || '',
            password: profile.password || '',
            role: profile.role || 'USER',
            emailVerified: profile.emailVerified,
            phoneVerified: profile.phoneVerified
        });
    }
}

// ===== Reports Persistence =====
function loadStoredReports() {
    try {
        const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                demoReports = parsed;
            }
        }
    } catch (e) {
        console.warn('Failed to load stored reports', e);
    }
}

function saveReports() {
    try {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(demoReports));
    } catch (e) {
        console.warn('Failed to save reports', e);
    }
}

function setCurrentUser(profile) {
    currentUser = profile;
    localStorage.setItem('currentUser', JSON.stringify(profile));
    ensureDemoUser(profile);
    updateNavAuthUI();
}

function clearCurrentUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateNavAuthUI();
}

function updateNavAuthUI() {
    const navs = document.querySelectorAll('.nav');
    navs.forEach(nav => {
        const loginLink = nav.querySelector('a[href="login.html"]');
        const registerLink = nav.querySelector('a[href="register.html"]');
        let adminLink = nav.querySelector('a.admin-link');
        let profileLink = nav.querySelector('a[href="profile.html"]');
        let userPill = nav.querySelector('.user-pill');
        let logoutBtn = nav.querySelector('.logout-btn');

        if (currentUser) {
            if (loginLink) loginLink.classList.add('hidden');
            if (registerLink) registerLink.classList.add('hidden');
            // Admin link
            if (currentUser.role === 'ADMIN') {
                if (!adminLink) {
                    adminLink = document.createElement('a');
                    adminLink.href = 'admin.html';
                    adminLink.className = 'nav-link admin-link';
                    adminLink.textContent = 'Admin Dashboard';
                    nav.insertBefore(adminLink, nav.firstChild);
                }
                adminLink.classList.remove('hidden');
            } else if (adminLink) {
                adminLink.remove();
            }

            if (!profileLink) {
                profileLink = document.createElement('a');
                profileLink.href = 'profile.html';
                profileLink.className = 'nav-link';
                profileLink.textContent = 'Profile';
                nav.insertBefore(profileLink, nav.firstChild);
            }

            if (!userPill) {
                userPill = document.createElement('button');
                userPill.className = 'user-pill';
                userPill.type = 'button';
                nav.appendChild(userPill);
            }

            const displayName = currentUser.name || currentUser.email || 'User';
            userPill.textContent = displayName;
            userPill.classList.remove('hidden');

            if (!logoutBtn) {
                logoutBtn = document.createElement('button');
                logoutBtn.type = 'button';
                logoutBtn.className = 'logout-btn';
                logoutBtn.textContent = 'Logout';
                nav.appendChild(logoutBtn);
            }
            logoutBtn.classList.remove('hidden');
            logoutBtn.onclick = handleLogout;
        } else {
            if (loginLink) loginLink.classList.remove('hidden');
            if (registerLink) registerLink.classList.remove('hidden');
            if (adminLink) adminLink.remove();
            if (profileLink) profileLink.remove();
            if (userPill) {
                userPill.remove();
            }
            if (logoutBtn) {
                logoutBtn.remove();
            }
        }
    });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
    // Set current year
    const yearElements = document.querySelectorAll('#currentYear');
    yearElements.forEach(el => {
        el.textContent = new Date().getFullYear();
    });

    // Load persisted reports
    loadStoredReports();

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
        case 'profile.html':
            initProfilePage();
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

    // Show Admin Dashboard button for admins
    if (currentUser && currentUser.role === 'ADMIN') {
        const heroButtons = document.querySelector('.hero-buttons');
        if (heroButtons && !heroButtons.querySelector('.btn-admin')) {
            const adminBtn = document.createElement('a');
            adminBtn.href = 'admin.html';
            adminBtn.className = 'btn btn-secondary btn-lg btn-admin';
            adminBtn.textContent = 'Admin Dashboard';
            heroButtons.appendChild(adminBtn);
        }
    }
}

// ===== Register Page =====
function initRegisterPage() {
    const registerForm = document.getElementById('registerForm');

    // Registration form
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

async function handleRegister(e) {
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

    if (!window.firebaseAuth) {
        showToast('Authentication service not available.', 'error');
        return;
    }

    try {
        const credential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        const user = credential.user;

        // Save display name
        if (user && name) {
            await user.updateProfile({ displayName: name });
        }

        // Build and persist local profile for demo features
        const profile = buildLocalProfile(user, phone);
        saveUserProfile(profile);
        ensureDemoUser(profile);

        // Send verification email and sign out to enforce verification
        await user.sendEmailVerification();
        await firebaseAuth.signOut();

        // Move to success step
        showStep('step-success');
        const successText = document.getElementById('registerSuccessText');
        if (successText) {
            successText.textContent = 'Check your email for the verification link, then sign in.';
        }

        document.getElementById('registerForm').reset();
        showToast('Account created. Verify your email, then log in.', 'success');
    } catch (error) {
        let message = 'Registration failed. Please try again.';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'This email is already registered.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. Use at least 8 characters.';
                break;
            default:
                message = error.message || message;
        }
        showToast(message, 'error');
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
    const resendVerificationBtn = document.getElementById('resendVerificationBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (resendVerificationBtn) {
        resendVerificationBtn.addEventListener('click', handleResendVerification);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!window.firebaseAuth) {
        showToast('Authentication service not available.', 'error');
        return;
    }

    try {
        const credential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        const user = credential.user;

        if (!user.emailVerified) {
            await user.sendEmailVerification();
            await firebaseAuth.signOut();
            showToast('Please verify your email. We just resent the verification link.', 'error');
            return;
        }

        // Build profile from stored data or fallback from Firebase user
        const storedProfile = getStoredUserProfile(user.uid);
        const profile = storedProfile || buildLocalProfile(user);
        profile.role = isAdminEmail(user.email) ? 'ADMIN' : (profile.role || 'USER');
        profile.emailVerified = true;
        profile.phoneVerified = true;

        saveUserProfile(profile);
        setCurrentUser(profile);

        showToast('Login successful!', 'success');
        updateNavAuthUI();

        // Redirect based on role
        if (profile.role === 'ADMIN') {
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    } catch (error) {
        let message = 'Invalid email or password.';
        switch (error.code) {
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                message = 'Invalid email or password.';
                break;
            case 'auth/too-many-requests':
                message = 'Too many attempts. Try again later.';
                break;
            default:
                message = error.message || message;
        }
        showToast(message, 'error');
    }
}

async function handleResendVerification() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('Enter email and password to resend verification.', 'error');
        return;
    }

    if (!window.firebaseAuth) {
        showToast('Authentication service not available.', 'error');
        return;
    }

    try {
        const credential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        const user = credential.user;

        if (user.emailVerified) {
            await firebaseAuth.signOut();
            showToast('Email already verified. Please sign in.', 'success');
            return;
        }

        await user.sendEmailVerification();
        await firebaseAuth.signOut();
        showToast('Verification email sent. Check your inbox.', 'success');
    } catch (error) {
        let message = 'Could not resend verification. Please check your credentials.';
        switch (error.code) {
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                message = 'Invalid email or password.';
                break;
            case 'auth/too-many-requests':
                message = 'Too many attempts. Try again later.';
                break;
            default:
                message = error.message || message;
        }
        showToast(message, 'error');
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

// ===== Profile Page =====
function initProfilePage() {
    const profileForm = document.getElementById('profileForm');
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const profilePhotoPreview = document.getElementById('profilePhotoPreview');

    if (!currentUser) {
        showToast('Please login to view your profile', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);
        return;
    }

    const storedProfile = getStoredUserProfile(currentUser.id) || currentUser;

    // Populate fields
    const nameInput = document.getElementById('profileName');
    const phoneInput = document.getElementById('profilePhone');
    const emailInput = document.getElementById('profileEmail');
    const addressInput = document.getElementById('profileAddress');
    const educationInput = document.getElementById('profileEducation');
    const birthDateInput = document.getElementById('profileBirthDate');
    const genderSelect = document.getElementById('profileGender');
    const workEmailInput = document.getElementById('profileWorkEmail');

    if (nameInput) nameInput.value = storedProfile.name || '';
    if (phoneInput) phoneInput.value = storedProfile.phone || '';
    if (emailInput) emailInput.value = storedProfile.email || '';
    if (addressInput) addressInput.value = storedProfile.address || '';
    if (educationInput) educationInput.value = storedProfile.education || '';
    if (birthDateInput) birthDateInput.value = storedProfile.birthDate || '';
    if (genderSelect) genderSelect.value = storedProfile.gender || '';
    if (workEmailInput) workEmailInput.value = storedProfile.workEmail || '';

    if (storedProfile.photoUrl && profilePhotoPreview) {
        profilePhotoPreview.innerHTML = `<img src="${storedProfile.photoUrl}" alt="Profile Photo">`;
    }

    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && profilePhotoPreview) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    profilePhotoPreview.innerHTML = `<img src="${ev.target.result}" alt="Profile Photo">`;
                    storedProfile.photoUrl = ev.target.result;
                    saveUserProfile({ ...storedProfile, photoUrl: ev.target.result });
                    setCurrentUser({ ...storedProfile, photoUrl: ev.target.result });
                    updateNavAuthUI();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const updated = {
                ...storedProfile,
                name: nameInput ? nameInput.value : storedProfile.name,
                phone: phoneInput ? phoneInput.value : storedProfile.phone,
                address: addressInput ? addressInput.value : storedProfile.address,
                education: educationInput ? educationInput.value : storedProfile.education,
                birthDate: birthDateInput ? birthDateInput.value : storedProfile.birthDate,
                gender: genderSelect ? genderSelect.value : storedProfile.gender,
                workEmail: workEmailInput ? workEmailInput.value : storedProfile.workEmail
            };
            saveUserProfile(updated);
            setCurrentUser(updated);
            updateNavAuthUI();
            showToast('Profile updated successfully', 'success');
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
    saveReports();

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
    // Hydrate currentUser from Firebase if available
    if (!currentUser && window.firebaseAuth) {
        const user = firebaseAuth.currentUser;
        if (user && user.emailVerified) {
            const storedProfile = getStoredUserProfile(user.uid);
            const profile = storedProfile || buildLocalProfile(user);
            profile.emailVerified = true;
            profile.phoneVerified = true;
            profile.role = isAdminEmail(user.email) ? 'ADMIN' : (profile.role || 'USER');
            saveUserProfile(profile);
            setCurrentUser(profile);
            updateNavAuthUI();
        }
    }

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
    saveReports();

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
        ensureDemoUser(currentUser);
        updateNavAuthUI();
    }

    if (window.firebaseAuth) {
        firebaseAuth.onAuthStateChanged(user => {
            if (user && user.emailVerified) {
                const storedProfile = getStoredUserProfile(user.uid);
                const profile = storedProfile || buildLocalProfile(user);
                profile.emailVerified = true;
                profile.phoneVerified = true;
                profile.role = isAdminEmail(user.email) ? 'ADMIN' : (profile.role || 'USER');
                saveUserProfile(profile);
                setCurrentUser(profile);
                updateNavAuthUI();
            } else if (!user) {
                clearCurrentUser();
                updateNavAuthUI();
            }
        });
    }
}

function handleLogout() {
    if (window.firebaseAuth) {
        firebaseAuth.signOut();
    }
    clearCurrentUser();
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
