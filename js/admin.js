import { auth, db } from './firebase-config.js';
import { logAction } from './logger.js';

auth.onAuthStateChanged(async user => {
  if (!user) { window.location.href = 'login.html'; return; }
  const snap = await db.collection('users').doc(user.uid).get();
  if (!snap.exists || snap.data().role !== 'admin') { window.location.href = 'index.html'; return; }
  loadAll();
});

function loadAll() {
  // categories
  db.collection('categories').onSnapshot(snap => {
    const list = document.getElementById('admin-category-list');
    list.innerHTML = '';
    snap.forEach(doc => {
      list.innerHTML += `<div>${doc.data().name}<button onclick="deleteCategory('${doc.id}')">Delete</button></div>`;
    });
  });
  // cities
  db.collection('cities').onSnapshot(snap => {
    const list = document.getElementById('admin-city-list');
    list.innerHTML = '';
    snap.forEach(doc => {
      list.innerHTML += `<div>${doc.data().name}<button onclick="deleteCity('${doc.id}')">Delete</button></div>`;
    });
  });
  // areas
  db.collection('areas').onSnapshot(snap => {
    const list = document.getElementById('admin-area-list');
    list.innerHTML = '';
    snap.forEach(doc => {
      list.innerHTML += `<div>${doc.data().name}<button onclick="deleteArea('${doc.id}')">Delete</button></div>`;
    });
  });
  // sports
  db.collection('sports').onSnapshot(snap => {
    const list = document.getElementById('admin-sports-list');
    list.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      list.innerHTML += `<div>${d.name} (${d.city}, ${d.area})<button onclick="deleteSport('${doc.id}')">Delete</button></div>`;
    });
  });
}

window.deleteCategory = id => { db.collection('categories').doc(id).delete(); logAction('delete_category', id); };
window.deleteCity = id => { db.collection('cities').doc(id).delete(); logAction('delete_city', id); };
window.deleteArea = id => { db.collection('areas').doc(id).delete(); logAction('delete_area', id); };
window.deleteSport = id => { db.collection('sports').doc(id).delete(); logAction('delete_sport_admin', id); };

document.getElementById('add-category-form').onsubmit = e => { e.preventDefault(); const n = document.getElementById('category-name').value; db.collection('categories').add({name:n}); logAction('add_category',n); e.target.reset(); };
document.getElementById('add-city-form').onsubmit = e => { e.preventDefault(); const n = document.getElementById('city-name').value; db.collection('cities').add({name:n}); logAction('add_city',n); e.target.reset(); };
document.getElementById('add-area-form').onsubmit = e => { e.preventDefault(); const n = document.getElementById('area-name').value; db.collection('areas').add({name:n}); logAction('add_area',n); e.target.reset(); };

document.getElementById('logout-btn').onclick = () => auth.signOut().then(() => window.location.href = 'login.html');
