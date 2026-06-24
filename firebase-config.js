<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAT3so0sZpenOVRWtezf8eVgVqFueNJgyI",
    authDomain: "qaalam-calligraphy.firebaseapp.com",
    projectId: "qaalam-calligraphy",
    storageBucket: "qaalam-calligraphy.firebasestorage.app",
    messagingSenderId: "69899543168",
    appId: "1:69899543168:web:480563a96f52d2d5013c65",
    measurementId: "G-PN9DEXKFWW"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
