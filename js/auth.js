import { auth, db } from './firebase-config.js';
import { logAction } from './logger.js';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

if (loginForm) {
  loginForm.onsubmit = async e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const snap = await db.collection('users').doc(cred.user.uid).get();
      const role = snap.exists ? snap.data().role : 'user';
      logAction('login', {email, role});
      window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
    } catch (err) {
      document.getElementById('login-msg').innerText = err.message;
    }
  };
}

if (registerForm) {
  registerForm.onsubmit = async e => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection('users').doc(cred.user.uid).set({email, role});
      logAction('register', {email, role});
      window.location.href = 'login.html';
    } catch (err) {
      document.getElementById('register-msg').innerText = err.message;
    }
  };
}
