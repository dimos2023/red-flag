// Simple local database helper for Red Flag reports.
// Stores data in localStorage and seeds demo reports on first load.
(function(global) {
    const REPORTS_KEY = 'reportsData';
    const DELETED_KEY = 'deletedReportsData';

    const seedReports = [
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

    function load(key, fallback) {
        try {
            const stored = global.localStorage.getItem(key);
            if (!stored) return fallback.slice();
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : fallback.slice();
        } catch (e) {
            console.warn('ReportDB: failed to load', key, e);
            return fallback.slice();
        }
    }

    function save(key, data) {
        try {
            global.localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('ReportDB: failed to save', key, e);
        }
    }

    let reports = load(REPORTS_KEY, seedReports);
    let deletedReports = load(DELETED_KEY, []);

    function sortByDateDesc(list) {
        return list.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const api = {
        getAll() {
            return sortByDateDesc(reports);
        },
        getById(id) {
            if (!id) return null;
            return reports.find(r => r.id === id) || null;
        },
        getDeleted() {
            return deletedReports.slice();
        },
        addReport(report) {
            if (!report || !report.id) return;
            const safeReport = {
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                ...report
            };
            reports = [safeReport, ...reports];
            save(REPORTS_KEY, reports);
        },
        updateStatus(id, status, adminNotes = null) {
            if (!id || !status) return;
            reports = reports.map(r => r.id === id ? { ...r, status, adminNotes } : r);
            save(REPORTS_KEY, reports);
        },
        deleteReport(id) {
            const report = reports.find(r => r.id === id);
            if (!report) return;
            deletedReports = [...deletedReports, { ...report, deletedAt: new Date().toISOString() }];
            reports = reports.filter(r => r.id !== id);
            save(REPORTS_KEY, reports);
            save(DELETED_KEY, deletedReports);
        },
        restore(id, status = 'PENDING') {
            const report = deletedReports.find(r => r.id === id);
            if (!report) return null;
            deletedReports = deletedReports.filter(r => r.id !== id);
            const restored = { ...report, status: status || report.status || 'PENDING', restoredAt: new Date().toISOString() };
            reports = [restored, ...reports];
            save(REPORTS_KEY, reports);
            save(DELETED_KEY, deletedReports);
            return restored;
        },
        replaceAll(list) {
            reports = Array.isArray(list) ? list.slice() : [];
            save(REPORTS_KEY, reports);
        },
        reset() {
            reports = seedReports.slice();
            deletedReports = [];
            save(REPORTS_KEY, reports);
            save(DELETED_KEY, deletedReports);
        }
    };

    global.ReportDB = api;
})(window);
