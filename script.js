// Script for the Logic League website

// Initialize random positions for floating icons
document.addEventListener('DOMContentLoaded', function () {
  const icons = document.querySelectorAll(".icon-bg i");
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  icons.forEach((icon) => {
    const randomX = Math.random() * windowWidth;
    const randomY = Math.random() * windowHeight;
    icon.style.left = `${randomX}px`;
    icon.style.top = `${randomY}px`;

    const moveX = Math.random() * 300 - 150;
    const moveY = Math.random() * 300 - 150;
    icon.style.setProperty('--random-x', `${moveX}px`);
    icon.style.setProperty('--random-y', `${moveY}px`);
    icon.style.opacity = 0.35;
  });

  // Highlight nav link on scroll
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-links a");

  window.addEventListener("scroll", () => {
    let currentSection = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (window.pageYOffset >= sectionTop - sectionHeight / 2) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (href && href.substring(1) === currentSection) {
        link.classList.add("active");
      }
    });
  });
});

// Admin Authentication
function adminLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const adminUsername = 'admin';
  const adminPassword = 'logicleague2025';

  if (username === adminUsername && password === adminPassword) {
    localStorage.setItem('adminAuthenticated', 'true');
    window.location.href = 'admin.html';
  } else {
    alert('Invalid username or password');
  }
}

// Check if admin is logged in
function checkAdminAuth() {
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  if (!isAuthenticated && window.location.pathname.includes('admin.html')) {
    window.location.href = 'login.html';
  }
}

// Admin logout
function adminLogout() {
  localStorage.removeItem('adminAuthenticated');
  window.location.href = 'login.html';
}

// Add team in admin panel
function addTeam() {
  const teamsList = document.getElementById('teamsList');
  const teamRow = document.createElement('div');
  teamRow.className = 'team-input-row';
  teamRow.innerHTML = `
    <input type="text" placeholder="Team Name" class="team-name">
    <input type="text" placeholder="College" class="team-college">
  `;
  teamsList.appendChild(teamRow);
}

// Finalize teams and enable scoring
function finalizeTeams() {
  const teamInputs = document.querySelectorAll('.team-input-row');
  const teams = [];

  teamInputs.forEach((row) => {
    const teamName = row.querySelector('.team-name').value;
    const teamCollege = row.querySelector('.team-college').value;

    if (teamName && teamCollege) {
      teams.push({
        name: teamName,
        college: teamCollege,
        scores: [0, 0, 0, 0],
        total: 0
      });
    }
  });

  if (teams.length === 0) {
    alert('Please add at least one team');
    return;
  }

  localStorage.setItem('teams', JSON.stringify(teams));
  document.getElementById('addTeamsSection').style.display = 'none';
  document.getElementById('scoringSection').style.display = 'block';

  generateScoringForm();
}

// Generate scoring form based on saved teams
function generateScoringForm() {
  const teams = JSON.parse(localStorage.getItem('teams') || '[]');
  const scoringForm = document.getElementById('scoringForm');
  scoringForm.innerHTML = '';

  teams.forEach((team, index) => {
    const teamScoreRow = document.createElement('div');
    teamScoreRow.className = 'team-scores-row';
    teamScoreRow.innerHTML = `
      <div style="flex: 1;">${team.name} (${team.college})</div>
      <input type="number" data-team="${index}" data-round="0" value="${team.scores[0]}" min="0" class="score-input">
      <input type="number" data-team="${index}" data-round="1" value="${team.scores[1]}" min="0" class="score-input">
      <input type="number" data-team="${index}" data-round="2" value="${team.scores[2]}" min="0" class="score-input">
      <input type="number" data-team="${index}" data-round="3" value="${team.scores[3]}" min="0" class="score-input">
      <div class="total-score">${team.total}</div>
    `;
    scoringForm.appendChild(teamScoreRow);
  });

  const scoreInputs = document.querySelectorAll('.score-input');
  scoreInputs.forEach(input => {
    input.addEventListener('change', updateScores);
  });
}

// Update scores when score inputs change
function updateScores(event) {
  const teamIndex = parseInt(event.target.dataset.team);
  const roundIndex = parseInt(event.target.dataset.round);
  const score = parseInt(event.target.value) || 0;

  const teams = JSON.parse(localStorage.getItem('teams') || '[]');
  teams[teamIndex].scores[roundIndex] = score;
  teams[teamIndex].total = teams[teamIndex].scores.reduce((sum, score) => sum + score, 0);

  const teamScoreRow = event.target.closest('.team-scores-row');
  const totalScoreElement = teamScoreRow.querySelector('.total-score');
  totalScoreElement.textContent = teams[teamIndex].total;

  localStorage.setItem('teams', JSON.stringify(teams));
}

// Save all scores
function saveScores() {
  alert('Scores saved successfully!');
}

// Load standings data on standings page
function loadStandingsData() {
  const standingsTable = document.getElementById('standingsTable');
  if (standingsTable) {
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    teams.sort((a, b) => b.total - a.total);

    const tbody = standingsTable.querySelector('tbody');
    tbody.innerHTML = '';

    teams.forEach((team, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${team.name}</td>
        <td>${team.college}</td>
        <td>${team.scores[0]}</td>
        <td>${team.scores[1]}</td>
        <td>${team.scores[2]}</td>
        <td>${team.scores[3]}</td>
        <td class="font-bold">${team.total}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// Show the team management modal to remove teams
function showRemoveTeamsModal() {
  const password = prompt('Enter admin password to access team removal:');
  if (password !== 'logicleague2025') {
    alert('Incorrect password');
    return;
  }

  let modalOverlay = document.getElementById('removeTeamsModal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'removeTeamsModal';
    modalOverlay.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `
      <h3 class="text-2xl font-bold mb-4">Remove Teams</h3>
      <p class="mb-4">Select the teams you want to remove:</p>
      <div id="removeTeamsList" class="mb-6"></div>
      <div class="flex justify-between">
        <button onclick="closeRemoveTeamsModal()">Cancel</button>
        <button onclick="removeSelectedTeams()" class="danger">Remove Selected</button>
      </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
  }

  const teams = JSON.parse(localStorage.getItem('teams') || '[]');
  const removeTeamsList = document.getElementById('removeTeamsList');
  removeTeamsList.innerHTML = '';

  teams.forEach((team, index) => {
    const teamItem = document.createElement('div');
    teamItem.innerHTML = `
      <label>
        <input type="checkbox" value="${index}">
        ${team.name} (${team.college})
      </label>
    `;
    removeTeamsList.appendChild(teamItem);
  });

  modalOverlay.style.display = 'flex';
}

// Close team removal modal
function closeRemoveTeamsModal() {
  const modal = document.getElementById('removeTeamsModal');
  if (modal) modal.style.display = 'none';
}

// Remove selected teams
function removeSelectedTeams() {
  const checkboxes = document.querySelectorAll('#removeTeamsList input[type="checkbox"]:checked');
  const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.value));

  let teams = JSON.parse(localStorage.getItem('teams') || '[]');
  teams = teams.filter((_, index) => !selectedIndexes.includes(index));

  localStorage.setItem('teams', JSON.stringify(teams));

  closeRemoveTeamsModal();
  alert('Selected teams have been removed.');
  location.reload();
}


function showRegisterModal() {
document.getElementById('registerModal').classList.remove('hidden');
}

function closeRegisterModal() {
document.getElementById('registerModal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const regUsername = document.getElementById('regUsername').value;
    const regPassword = document.getElementById('regPassword').value;
    const regCollege = document.getElementById('regCollege').value;

    if (!regUsername || !regPassword || !regCollege) {
      alert('Please fill in all fields.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const userExists = users.some(user => user.username === regUsername);
    if (userExists) {
      alert('Username already exists. Choose another.');
      return;
    }

    users.push({ username: regUsername, password: regPassword, college: regCollege });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful! You can now log in.');
    closeRegisterModal();
  });
}
});

function adminLogin(event) {
event.preventDefault();
const username = document.getElementById('username').value;
const password = document.getElementById('password').value;

const adminUsername = 'admin';
const adminPassword = 'logicleague2025';

if (username === adminUsername && password === adminPassword) {
  localStorage.setItem('adminAuthenticated', 'true');
  window.location.href = 'admin.html';
} else {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    alert(`Welcome, ${user.username} from ${user.college}`);
  } else {
    alert('Invalid username or password');
  }
}
}

