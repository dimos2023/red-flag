// ===== Red Flag Platform - JavaScript =====

// ===== Global Variables =====
let currentUser = null;
let currentFilter = 'ALL';
let selectedReportId = null;
const adminEmails = ['admin@test.com', 'admin@regflag.com', 'AhmedAshry.hh@gmail.com'];
const REPORTS_STORAGE_KEY = 'reportsData';
const DELETED_REPORTS_STORAGE_KEY = 'deletedReportsData';
const BLOCKED_USERS_STORAGE_KEY = 'blockedUsersData';
const DELETED_USERS_STORAGE_KEY = 'deletedUsersData';

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

let demoReports = [];
let deletedReports = [];
let blockedUsers = [];
let deletedUsers = [];

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
function initReportData() {
    if (window.ReportDB) {
        demoReports = ReportDB.getAll();
        deletedReports = ReportDB.getDeleted();
        return;
    }

    loadStoredReports();
    loadStoredDeletedReports();
}

function loadBlockedUsers() {
    try {
        const stored = localStorage.getItem(BLOCKED_USERS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                blockedUsers = parsed;
            }
        }
    } catch (e) {
        console.warn('Failed to load blocked users', e);
    }
}

function saveBlockedUsers() {
    try {
        localStorage.setItem(BLOCKED_USERS_STORAGE_KEY, JSON.stringify(blockedUsers));
    } catch (e) {
        console.warn('Failed to save blocked users', e);
    }
}

function loadDeletedUsers() {
    try {
        const stored = localStorage.getItem(DELETED_USERS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                deletedUsers = parsed;
            }
        }
    } catch (e) {
        console.warn('Failed to load deleted users', e);
    }
}

function saveDeletedUsers() {
    try {
        localStorage.setItem(DELETED_USERS_STORAGE_KEY, JSON.stringify(deletedUsers));
    } catch (e) {
        console.warn('Failed to save deleted users', e);
    }
}

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

function loadStoredDeletedReports() {
    try {
        const stored = localStorage.getItem(DELETED_REPORTS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                deletedReports = parsed;
            }
        }
    } catch (e) {
        console.warn('Failed to load deleted reports', e);
    }
}

function saveDeletedReports() {
    try {
        localStorage.setItem(DELETED_REPORTS_STORAGE_KEY, JSON.stringify(deletedReports));
    } catch (e) {
        console.warn('Failed to save deleted reports', e);
    }
}

function getReportById(id) {
    const source = window.ReportDB ? ReportDB.getAll() : demoReports;
    return source.find(r => r.id === id);
}

function getAllStoredProfiles() {
    const profiles = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('userProfile_')) {
            try {
                const parsed = JSON.parse(localStorage.getItem(key));
                if (parsed && parsed.id) {
                    profiles.push(parsed);
                }
            } catch (e) {
                continue;
            }
        }
    }
    return profiles;
}

function getAllUsersForAdmin() {
    const storedProfiles = getAllStoredProfiles();
    const merged = [...demoUsers];
    const deletedIds = new Set(deletedUsers.map(u => u.id));
    const deletedEmails = new Set(deletedUsers.map(u => (u.email || '').toLowerCase()));

    storedProfiles.forEach(p => {
        const emailLower = (p.email || '').toLowerCase();
        if (deletedIds.has(p.id) || deletedEmails.has(emailLower)) return;
        if (!merged.find(u => u.id === p.id || (u.email && u.email.toLowerCase() === emailLower))) {
            merged.push({
                ...p,
                role: isAdminEmail(p.email) ? 'ADMIN' : (p.role || 'USER')
            });
        }
    });

    return merged.filter(u => !deletedIds.has(u.id) && !(u.email && deletedEmails.has(u.email.toLowerCase())));
}

function getBlockRecord(email, uid) {
    const targetEmail = (email || '').toLowerCase();
    return blockedUsers.find(b => b.email.toLowerCase() === targetEmail || (uid && b.id === uid)) || null;
}

function getDeletionRecord(email, uid) {
    const targetEmail = (email || '').toLowerCase();
    return deletedUsers.find(d => d.email.toLowerCase() === targetEmail || (uid && d.id === uid)) || null;
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
        let userPill = nav.querySelector('.user-pill');
        let logoutBtn = nav.querySelector('.logout-btn');

        if (currentUser) {
            const blockRecord = getBlockRecord(currentUser.email, currentUser.id);
            if (blockRecord) {
                showToast('Your account is blocked by admin. Reason: ' + (blockRecord.reason || 'Security'), 'error');
            }
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

            if (!userPill) {
                userPill = document.createElement('a');
                userPill.href = 'profile.html';
                userPill.className = 'user-pill';
                nav.appendChild(userPill);
            }

            const displayName = currentUser.name || currentUser.email || 'User';
            const avatarHtml = currentUser.photoUrl 
                ? `<img src="${currentUser.photoUrl}" alt="${displayName}">`
                : `<span class="avatar-fallback">${displayName.charAt(0).toUpperCase()}</span>`;
            userPill.innerHTML = `
                <span class="user-avatar">${avatarHtml}</span>
                <span class="user-name">${displayName}</span>
            `;
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

    // Sync logo text with current page title
    const pageTitle = document.title || 'Red Flag';
    document.querySelectorAll('.logo-text').forEach(el => {
        el.textContent = pageTitle;
    });

    // Load persisted reports
    initReportData();
    loadBlockedUsers();
    loadDeletedUsers();

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
        case 'report-details.html':
            initReportDetailsPage();
            break;
        case 'admin.html':
            initAdminPage();
            break;
        case 'user-details.html':
            initUserDetailsPage();
            break;
        case 'users.html':
            initUsersPage();
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

        const blockRecord = getBlockRecord(user.email, user.uid);
        if (blockRecord) {
            await firebaseAuth.signOut();
            showToast(`Account blocked by admin. Reason: ${blockRecord.reason || 'Security reasons'}`, 'error');
            return;
        }

        const deletionRecord = getDeletionRecord(user.email, user.uid);
        if (deletionRecord) {
            await firebaseAuth.signOut();
            showToast('Account removed by admin. Contact support to restore access.', 'error');
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

    // Make the dashed upload boxes clickable to open the hidden file inputs
    document.querySelectorAll('.file-upload').forEach(box => {
        const input = box.querySelector('.file-input');
        if (!input) return;
        box.addEventListener('click', () => input.click());
        box.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                input.click();
            }
        });
    });
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
        // Allow click on preview box to open file picker
        const uploadBox = profilePhotoInput.closest('.file-upload');
        if (uploadBox) {
            uploadBox.addEventListener('click', () => profilePhotoInput.click());
            uploadBox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    profilePhotoInput.click();
                }
            });
        }

        profilePhotoInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file || !profilePhotoPreview) return;

            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                showToast('Profile photo exceeds 5MB limit', 'error');
                return;
            }

            try {
                const dataUrl = await readFileAsDataURL(file);
                profilePhotoPreview.innerHTML = `<img src="${dataUrl}" alt="Profile Photo">`;
                storedProfile.photoUrl = dataUrl;
                saveUserProfile({ ...storedProfile, photoUrl: dataUrl });
                setCurrentUser({ ...storedProfile, photoUrl: dataUrl });
                updateNavAuthUI();
                showToast('Profile photo updated', 'success');
            } catch (err) {
                showToast('Failed to load profile photo. Try again.', 'error');
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

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

async function handleReportSubmit(e) {
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
    const profilePhotoInput = document.getElementById('profilePhoto');
    const nationalIdPhotoInput = document.getElementById('nationalIdPhoto');

    if (!scammerPhone || !description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const profileFile = profilePhotoInput && profilePhotoInput.files ? profilePhotoInput.files[0] : null;
    const idFile = nationalIdPhotoInput && nationalIdPhotoInput.files ? nationalIdPhotoInput.files[0] : null;

    if (profileFile && profileFile.size > maxSize) {
        showToast('Profile photo exceeds 5MB limit', 'error');
        return;
    }
    if (idFile && idFile.size > maxSize) {
        showToast('National ID photo exceeds 5MB limit', 'error');
        return;
    }

    let profilePhotoData = null;
    let nationalIdPhotoData = null;

    try {
        if (profileFile) {
            profilePhotoData = await readFileAsDataURL(profileFile);
        }
        if (idFile) {
            nationalIdPhotoData = await readFileAsDataURL(idFile);
        }
    } catch (err) {
        showToast('Failed to read attached files. Please try again.', 'error');
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
        createdAt: new Date().toISOString(),
        profilePhoto: profilePhotoData,
        nationalIdPhoto: nationalIdPhotoData
    };

    if (window.ReportDB) {
        ReportDB.addReport(newReport);
        demoReports = ReportDB.getAll();
    } else {
        demoReports.push(newReport);
        saveReports();
    }

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
    const sourceReports = window.ReportDB ? ReportDB.getAll() : demoReports;
    
    return sourceReports.filter(report => {
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
    renderUsers();
    renderDeletedUsersList();

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

    if (window.ReportDB) {
        demoReports = ReportDB.getAll();
        deletedReports = ReportDB.getDeleted();
    }

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

    // Render deleted reports section
    renderDeletedReports();
}

function renderDeletedReports() {
    const container = document.getElementById('deletedReportsContainer');
    const noDeleted = document.getElementById('noDeletedReports');
    if (!container) return;

    if (window.ReportDB) {
        deletedReports = ReportDB.getDeleted();
    }

    if (deletedReports.length === 0) {
        container.innerHTML = '';
        if (noDeleted) noDeleted.classList.remove('hidden');
        return;
    }

    if (noDeleted) noDeleted.classList.add('hidden');

    container.innerHTML = deletedReports.map(report => `
        <div class="admin-report-card" style="background-color: var(--color-gray-50);">
            <div class="admin-report-header">
                <div>
                    <h3 class="report-detail-title">${report.scammerName || 'Unknown'}</h3>
                    <p class="report-detail-meta">Phone: ${report.scammerPhone}</p>
                    <p class="report-detail-meta">Deleted: ${new Date(report.deletedAt).toLocaleString()}</p>
                </div>
                <span class="admin-report-status status-rejected">DELETED</span>
            </div>
            <p style="margin-bottom: 1rem; font-size: 0.875rem; color: #6b7280;">
                ${report.description.substring(0, 120)}${report.description.length > 120 ? '...' : ''}
            </p>
            <div class="admin-report-actions" style="gap: var(--spacing-sm);">
                <button class="btn btn-secondary btn-sm" onclick="restoreReport('${report.id}', false)">
                    Restore
                </button>
                <button class="btn btn-primary btn-sm" onclick="restoreReport('${report.id}', true)">
                    Restore & Review
                </button>
            </div>
        </div>
    `).join('');
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
            <a class="btn btn-secondary btn-sm" href="report-details.html?id=${report.id}">
                View Details
            </a>
            ${report.status === 'PENDING' ? `
            <button class="btn btn-success btn-sm" onclick="openReviewModal('${report.id}')">
                Approve
            </button>
            <button class="btn btn-danger btn-sm" onclick="openReviewModal('${report.id}')">
                Reject
            </button>
            ` : ''}
            <button class="btn btn-danger btn-sm" onclick="deleteReport('${report.id}')">
                Delete
            </button>
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
    const adminNotes = (document.getElementById('adminNotes').value || '').trim();
    if (action === 'REJECTED' && !adminNotes) {
        showToast('Please add a rejection reason before rejecting.', 'error');
        return;
    }

    const modal = document.getElementById('reviewModal');
    if (window.ReportDB) {
        ReportDB.updateStatus(selectedReportId, action, adminNotes);
        demoReports = ReportDB.getAll();
    } else {
        const report = demoReports.find(r => r.id === selectedReportId);
        if (!report) return;
        report.status = action;
        report.adminNotes = adminNotes;
        saveReports();
    }

    if (modal) {
        modal.classList.add('hidden');
    }

    showToast(action === 'APPROVED' ? 'Report approved successfully' : 'Report rejected', 'success');
    loadReports();
}

function deleteReport(reportId) {
    const confirmDelete = window.confirm('Are you sure you want to delete this report?');
    if (!confirmDelete) return;

    if (window.ReportDB) {
        ReportDB.deleteReport(reportId);
        demoReports = ReportDB.getAll();
        deletedReports = ReportDB.getDeleted();
    } else {
        const report = demoReports.find(r => r.id === reportId);
        if (!report) return;

        // Move to deleted bucket
        deletedReports.push({ ...report, deletedAt: new Date().toISOString() });
        saveDeletedReports();

        demoReports = demoReports.filter(r => r.id !== reportId);
        saveReports();
    }

    showToast('Report deleted', 'success');
    loadReports();
    renderDeletedReports();
}

// ===== Report Details Page =====
function initReportDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get('id');

    if (window.ReportDB) {
        demoReports = ReportDB.getAll();
        deletedReports = ReportDB.getDeleted();
    } else {
        loadStoredReports();
    }

    if (!reportId) {
        showToast('Invalid report ID', 'error');
        setTimeout(() => window.location.href = 'admin.html', 1200);
        return;
    }

    const report = getReportById(reportId);
    if (!report) {
        showToast('Report not found', 'error');
        setTimeout(() => window.location.href = 'admin.html', 1200);
        return;
    }

    const reporterProfile = getStoredUserProfile(report.reporterId) || demoUsers.find(u => u.id === report.reporterId);

    setDetailText('detailScammerName', report.scammerName || 'Unknown');
    setDetailText('detailPhone', report.scammerPhone || 'Not provided');
    setDetailText('detailAddress', report.scammerAddress || 'Not provided');
    setDetailText('detailNationalId', report.scammerNationalId || 'Not provided');
    setDetailText('detailDescription', report.description || 'No description provided');
    setDetailText('detailReporter', reporterProfile ? `${reporterProfile.name || 'Reporter'} (${reporterProfile.email || 'No email'})` : 'Reporter information not available');
    setDetailText('detailCreatedAt', report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Not available');

    const statusEl = document.getElementById('reportStatus');
    if (statusEl) {
        const statusClass = `status-${report.status.toLowerCase()}`;
        statusEl.className = `admin-report-status ${statusClass}`;
        statusEl.textContent = report.status;
    }

    const notesInput = document.getElementById('adminNotesInput');
    if (notesInput) {
        notesInput.value = report.adminNotes || '';
    }

    renderDetailAttachment('detailProfilePhoto', report.profilePhoto, 'No profile photo uploaded');
    renderDetailAttachment('detailNationalIdPhoto', report.nationalIdPhoto, 'No ID photo uploaded');

    const approveBtn = document.getElementById('approveReportBtn');
    const rejectBtn = document.getElementById('rejectReportBtn');

    if (approveBtn) {
        approveBtn.addEventListener('click', () => updateDetailStatus(reportId, 'APPROVED'));
    }
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => updateDetailStatus(reportId, 'REJECTED'));
    }
}

// ===== User Details Page =====
function initUserDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    if (!userId) {
        showToast('Invalid user ID', 'error');
        setTimeout(() => window.location.href = 'admin.html', 1200);
        return;
    }

    const user = getAllUsersForAdmin().find(u => u.id === userId);
    if (!user) {
        showToast('User not found', 'error');
        setTimeout(() => window.location.href = 'admin.html', 1200);
        return;
    }

    const blockRecord = getBlockRecord(user.email, user.id);
    const statusEl = document.getElementById('userStatus');
    if (statusEl) {
        statusEl.className = `admin-report-status ${blockRecord ? 'status-rejected' : 'status-approved'}`;
        statusEl.textContent = blockRecord ? 'BLOCKED' : 'ACTIVE';
    }

    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) {
        if (user.photoUrl) {
            avatarEl.innerHTML = `<img src="${user.photoUrl}" alt="${user.name || user.email}">`;
        } else {
            avatarEl.innerHTML = `<span class="avatar-fallback">${(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>`;
        }
    }

    setDetailText('userName', user.name || 'User');
    setDetailText('userEmail', user.email || '-');
    setDetailText('userPhone', user.phone || '-');
    setDetailText('userAddress', user.address || '-');
    setDetailText('userEducation', user.education || '-');
    setDetailText('userBirthDate', user.birthDate || '-');
    setDetailText('userGender', user.gender || '-');
    setDetailText('userWorkEmail', user.workEmail || '-');

    const blockText = document.getElementById('blockReasonText');
    if (blockText) {
        blockText.textContent = blockRecord ? `Blocked Reason: ${blockRecord.reason || 'Security'}` : '';
    }

    const blockBtn = document.getElementById('blockUserBtn');
    const unblockBtn = document.getElementById('unblockUserBtn');

    if (blockBtn) {
        blockBtn.addEventListener('click', () => {
            blockUser(user.id, user.email);
            initUserDetailsPage();
        });
    }
    if (unblockBtn) {
        unblockBtn.addEventListener('click', () => {
            unblockUser(user.id, user.email);
            initUserDetailsPage();
        });
    }
}

function setDetailText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function renderDetailAttachment(containerId, dataUrl, placeholder) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (dataUrl) {
        container.innerHTML = `<img src="${dataUrl}" alt="${placeholder}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        container.innerHTML = `<div style="font-size: 0.9rem; color: var(--color-gray-500); text-align: center;">${placeholder}</div>`;
    }
}

function updateDetailStatus(reportId, status) {
    const notesInput = document.getElementById('adminNotesInput');
    const adminNotes = notesInput ? (notesInput.value || '').trim() : '';

    if (status === 'REJECTED' && !adminNotes) {
        showToast('Please add a rejection reason before rejecting.', 'error');
        return;
    }

    if (window.ReportDB) {
        ReportDB.updateStatus(reportId, status, adminNotes);
        demoReports = ReportDB.getAll();
    } else {
        const report = demoReports.find(r => r.id === reportId);
        if (!report) return;
        report.status = status;
        report.adminNotes = adminNotes;
        saveReports();
    }

    const statusEl = document.getElementById('reportStatus');
    if (statusEl) {
        statusEl.className = `admin-report-status status-${status.toLowerCase()}`;
        statusEl.textContent = status;
    }

    showToast(status === 'APPROVED' ? 'Report approved' : 'Report rejected', 'success');
    setTimeout(() => window.location.href = 'admin.html', 800);
}

// ===== Users Page =====
function initUsersPage() {
    renderUsers();
    renderDeletedUsersList();
}

function restoreReport(reportId, openAfterRestore = false) {
    let restored = null;
    if (window.ReportDB) {
        restored = ReportDB.restore(reportId, 'PENDING');
        demoReports = ReportDB.getAll();
        deletedReports = ReportDB.getDeleted();
    } else {
        const report = deletedReports.find(r => r.id === reportId);
        if (!report) return;
        const restoredReport = { ...report, status: 'PENDING', restoredAt: new Date().toISOString() };
        deletedReports = deletedReports.filter(r => r.id !== reportId);
        demoReports = [restoredReport, ...demoReports];
        saveDeletedReports();
        saveReports();
        restored = restoredReport;
    }

    showToast('Report restored for review', 'success');
    loadReports();
    renderDeletedReports();

    if (openAfterRestore && restored) {
        setTimeout(() => {
            window.location.href = `report-details.html?id=${restored.id}`;
        }, 300);
    }
}

function renderUsers() {
    const container = document.getElementById('adminUsersContainer');
    if (!container) return;
    const users = getAllUsersForAdmin();
    const blockMap = new Map(blockedUsers.map(b => [b.id || b.email, b]));

    if (users.length === 0) {
        container.innerHTML = '<p class="report-detail-meta">No users found.</p>';
        return;
    }

    container.innerHTML = users.map(u => {
        const isBlocked = !!getBlockRecord(u.email, u.id);
        const statusClass = isBlocked ? 'status-rejected' : 'status-approved';
        const statusText = isBlocked ? 'BLOCKED' : 'ACTIVE';
        const reason = isBlocked ? (getBlockRecord(u.email, u.id)?.reason || 'Security') : '';
        const photo = u.photoUrl ? `<img src="${u.photoUrl}" alt="${u.name || u.email}" class="user-avatar-img">` : `<span class="avatar-fallback">${(u.name || u.email || 'U').charAt(0).toUpperCase()}</span>`;
        return `
            <div class="admin-report-card">
                <div class="admin-report-header">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="user-avatar user-avatar-sm">${photo}</div>
                        <div>
                            <h3 class="report-detail-title">${u.name || 'User'}</h3>
                            <p class="report-detail-meta">${u.email || 'No email'}</p>
                            <p class="report-detail-meta">${u.phone || ''}</p>
                        </div>
                    </div>
                    <span class="admin-report-status ${statusClass}">${statusText}</span>
                </div>
                <p class="report-detail-meta">Role: ${u.role || 'USER'}</p>
                ${reason ? `<p class="report-detail-meta">Blocked Reason: ${reason}</p>` : ''}
                <div class="admin-report-actions">
                    <a class="btn btn-secondary btn-sm" href="user-details.html?id=${u.id}">View Profile</a>
                    ${isBlocked ? `
                        <button class="btn btn-success btn-sm" onclick="unblockUser('${u.id}', '${u.email || ''}')">Unblock</button>
                    ` : `
                        <button class="btn btn-danger btn-sm" onclick="blockUser('${u.id}', '${u.email || ''}')">Block</button>
                    `}
                    <button class="btn btn-danger btn-sm" onclick="deleteUserAccount('${u.id}', '${u.email || ''}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function blockUser(userId, email = '') {
    const reason = window.prompt('Enter reason for blocking this user:', 'Security reasons');
    if (reason === null) return;
    const trimmedReason = (reason || '').trim() || 'Security reasons';
    if (!userId && !email) return;
    if (!blockedUsers.find(b => b.id === userId || (email && b.email === email))) {
        blockedUsers.push({
            id: userId,
            email,
            reason: trimmedReason,
            blockedAt: new Date().toISOString()
        });
        saveBlockedUsers();
        showToast('User blocked', 'success');
        renderUsers();
    }
}

function unblockUser(userId, email = '') {
    blockedUsers = blockedUsers.filter(b => b.id !== userId && (!email || b.email !== email));
    saveBlockedUsers();
    showToast('User unblocked', 'success');
    renderUsers();
}

function deleteUserAccount(userId, email = '') {
    const confirmDelete = window.confirm('Delete this user? They will be removed from active list and stored in deleted users.');
    if (!confirmDelete) return;

    // Gather profile
    const users = getAllUsersForAdmin();
    const target = users.find(u => u.id === userId || (email && u.email === email));
    if (!target) return;

    if (!deletedUsers.find(d => d.id === target.id || (target.email && d.email === target.email))) {
        deletedUsers.push({
            ...target,
            deletedAt: new Date().toISOString()
        });
        saveDeletedUsers();
    }

    blockedUsers = blockedUsers.filter(b => b.id !== target.id && (!target.email || b.email !== target.email));
    saveBlockedUsers();

    // Remove stored profile
    localStorage.removeItem(`userProfile_${target.id}`);
    // Remove from demo users list
    const demoIndex = demoUsers.findIndex(u => u.id === target.id);
    if (demoIndex > -1) {
        demoUsers.splice(demoIndex, 1);
    }

    // Logout if current user
    if (currentUser && currentUser.id === target.id) {
        clearCurrentUser();
        showToast('Your account has been deleted by admin.', 'error');
    }

    showToast('User deleted (soft)', 'success');
    renderUsers();
    renderDeletedUsersList();
}

function restoreDeletedUser(userId) {
    const record = deletedUsers.find(u => u.id === userId);
    if (!record) return;
    deletedUsers = deletedUsers.filter(u => u.id !== userId);
    saveDeletedUsers();

    // Re-add to demoUsers list if missing
    if (!demoUsers.find(u => u.id === record.id)) {
        demoUsers.push({
            ...record,
            role: isAdminEmail(record.email) ? 'ADMIN' : (record.role || 'USER')
        });
    }

    showToast('User restored', 'success');
    renderUsers();
    renderDeletedUsersList();
}

function renderDeletedUsersList() {
    const container = document.getElementById('deletedUsersContainer');
    if (!container) return;
    if (deletedUsers.length === 0) {
        container.innerHTML = '<p class="report-detail-meta">No deleted users.</p>';
        return;
    }
    container.innerHTML = deletedUsers.map(u => `
        <div class="admin-report-card" style="background-color: var(--color-gray-50);">
            <div class="admin-report-header">
                <div>
                    <h3 class="report-detail-title">${u.name || 'User'}</h3>
                    <p class="report-detail-meta">${u.email || ''}</p>
                    <p class="report-detail-meta">Deleted: ${new Date(u.deletedAt).toLocaleString()}</p>
                </div>
                <span class="admin-report-status status-rejected">DELETED</span>
            </div>
            <div class="admin-report-actions">
                <button class="btn btn-primary btn-sm" onclick="restoreDeletedUser('${u.id}')">Restore User</button>
            </div>
        </div>
    `).join('');
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
