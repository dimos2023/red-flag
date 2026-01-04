// Firebase initialization for Red Flag frontend
// Uses Firebase Web SDK (compat) to keep existing non-module scripts working.

const firebaseConfig = {
    apiKey: "AIzaSyAe9jXcH1AmAQzUDWUgqOnisjt4VePB-04",
    authDomain: "regflag2-bdd31.firebaseapp.com",
    projectId: "regflag2-bdd31",
    storageBucket: "regflag2-bdd31.appspot.com",
    messagingSenderId: "1085612199748",
    appId: "1:1085612199748:web:80fb6f94bcae4642414011",
    measurementId: "G-DCQQR1PGX"
};

// Initialize Firebase (guard against double init on multiple pages)
if (!window.firebaseApp) {
    window.firebaseApp = firebase.initializeApp(firebaseConfig);
    window.firebaseAuth = firebase.auth();
    window.firebaseAuth.useDeviceLanguage();
}

