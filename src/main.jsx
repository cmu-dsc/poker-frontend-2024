import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBjNxPV9oknW6sETIzez9plHNevn4DnjVU",
  authDomain: "pokerai-417521.firebaseapp.com",
  projectId: "pokerai-417521",
  storageBucket: "pokerai-417521.appspot.com",
  messagingSenderId: "979321260256",
  appId: "1:979321260256:web:2b7c7378f9107ec303e885"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LdH36YpAAAAAGIjzxHPHw_IE9hzvNwfISdjqDhM'),
  isTokenAutoRefreshEnabled: true
});

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App auth={auth} />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.log('Error setting persistence:', error);
  });
