import { auth, db } from './firebase-config.js';
import { logAction } from './logger.js';

let userId;
auth.onAuthStateChanged(user => {
  if (!user) { window.location.href = 'login.html'; return; }
  userId = user.uid;
  loadDropdowns();
  loadSports();
});

function loadDropdowns() {
  const catSelect = document.getElementById('sport-name');
  db.collection('categories').onSnapshot(snap => {
    catSelect.innerHTML = '<option value="">Select Sport Category</option>';
    snap.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.data().name;
      opt.textContent = doc.data().name;
      catSelect.appendChild(opt);
    });
  });
  const citySelect = document.getElementById('sport-city');
  db.collection('cities').onSnapshot(snap => {
    citySelect.innerHTML = '<option value="">Select City</option>';
    snap.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.data().name;
      opt.textContent = doc.data().name;
      citySelect.appendChild(opt);
    });
  });
  const areaSelect = document.getElementById('sport-area');
  db.collection('areas').onSnapshot(snap => {
    areaSelect.innerHTML = '<option value="">Select Area</option>';
    snap.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.data().name;
      opt.textContent = doc.data().name;
      areaSelect.appendChild(opt);
    });
  });
}

function loadSports() {
  db.collection('sports').where('userId', '==', userId).onSnapshot(snap => {
    const list = document.getElementById('user-sports-list');
    list.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      list.innerHTML += `<div><span>${d.name} | ${d.city}, ${d.area} | ${d.time}</span><button onclick="deleteSport('${doc.id}')">Delete</button></div>`;
    });
  });
}

window.deleteSport = id => {
  db.collection('sports').doc(id).delete();
  logAction('delete_sport', id);
};

const form = document.getElementById('add-sport-form');
if (form) {
  form.onsubmit = e => {
    e.preventDefault();
    const name = document.getElementById('sport-name').value;
    const city = document.getElementById('sport-city').value;
    const area = document.getElementById('sport-area').value;
    const time = document.getElementById('sport-time').value;
    db.collection('sports').add({name, city, area, time, userId});
    logAction('add_sport', {name, city, area, time, userId});
    form.reset();
  };
}

document.getElementById('logout-btn').onclick = () => auth.signOut().then(() => window.location.href = 'login.html');
