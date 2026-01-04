// Firebase initialization for Red Flag frontend
// Uses Firebase Web SDK (compat) to keep existing non-module scripts working.

const firebaseConfig = {
    apiKey: "AIzaSyAejxcH1AmAQzUDWU0gqOnisjt4VePB-04",
    authDomain: "regflag2-bdd31.firebaseapp.com",
    projectId: "regflag2-bdd31",
    storageBucket: "regflag2-bdd31.firebasestorage.app",
    messagingSenderId: "1056512199748",
    appId: "1:1056512199748:web:80fb6f94bcae4642414011",
    measurementId: "G-DCQQ9R1PGX"
};

// Initialize Firebase (guard against double init on multiple pages)
if (!window.firebaseApp) {
    window.firebaseApp = firebase.initializeApp(firebaseConfig);
    window.firebaseAuth = firebase.auth();
    window.firebaseAuth.useDeviceLanguage();
}
