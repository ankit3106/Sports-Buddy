import { auth, db } from './firebase-config.js';
import { logAction } from './logger.js';

document.addEventListener('DOMContentLoaded', () => {
  // Dark mode toggle
  const toggleBtn = document.getElementById('dark-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark)) {
    document.body.classList.add('dark');
  }
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      if (document.body.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // Fetch and render events from Firestore
  const eventsList = document.querySelector('.events-list');
  let allEvents = [];

  function renderEvents(events) {
    eventsList.innerHTML = '';
    if (events.length === 0) {
      eventsList.innerHTML = '<div style="text-align:center;color:#888;">No events found.</div>';
      return;
    }
    events.forEach(event => {
      const icon = event.icon || 'fa-futbol';
      const html = `
        <div class="event-card">
          <h4><i class="fas ${icon}"></i> ${event.name}</h4>
          <p>
            <i class="fas fa-calendar-alt"></i> ${event.time} &nbsp;
            <i class="fas fa-map-marker-alt"></i> ${event.city}${event.area ? ', ' + event.area : ''}
          </p>
        </div>
      `;
      eventsList.innerHTML += html;
    });
  }

  // Load events from Firestore
  db.collection('sports').orderBy('time').onSnapshot(snapshot => {
    allEvents = [];
    snapshot.forEach(doc => {
      allEvents.push(doc.data());
    });
    renderEvents(allEvents);
  });

  // Search functionality
  document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = allEvents.filter(ev =>
      (ev.name && ev.name.toLowerCase().includes(query)) ||
      (ev.city && ev.city.toLowerCase().includes(query)) ||
      (ev.area && ev.area.toLowerCase().includes(query)) ||
      (ev.time && ev.time.toLowerCase().includes(query))
    );
    renderEvents(filtered);
  });
});

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
  const eventsContainer = document.getElementById('user-events-container');
  db.collection('sports').where('userId', '==', userId).onSnapshot(snap => {
    eventsContainer.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      eventsContainer.innerHTML += `
        <div class="event-card">
          <h4><i class="fas fa-futbol"></i> ${d.name}</h4>
          <p>
            <i class="fas fa-calendar-alt"></i> ${d.time} &nbsp;
            <i class="fas fa-map-marker-alt"></i> ${d.city}${d.area ? ', ' + d.area : ''}
          </p>
          <button onclick="deleteSport('${doc.id}')" class="btn-primary" style="margin-top:0.5em;">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      `;
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
    db.collection('sports').add({ name, city, area, time, userId });
    logAction('add_sport', { name, city, area, time, userId });
    form.reset();
  };
}

document.getElementById('logout-btn').onclick = () => auth.signOut().then(() => window.location.href = 'login.html');
