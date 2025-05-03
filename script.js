// Script for the Logic League website

// Initialize random positions for floating icons
document.addEventListener('DOMContentLoaded', function() {
    // Initialize random positions for floating icons
    const icons = document.querySelectorAll(".icon-bg i");
    icons.forEach((icon) => {
      const randomX = Math.random() * 300 - 150;
      const randomY = Math.random() * 300 - 150;
      icon.style.setProperty('--random-x', `${randomX}px`);
      icon.style.setProperty('--random-y', `${randomY}px`);
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
  
    // Registration form submission
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
      registrationForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = {
          teamName: document.getElementById('teamName').value,
          collegeName: document.getElementById('collegeName').value,
          member1Name: document.getElementById('member1Name').value,
          member1Email: document.getElementById('member1Email').value,
          member2Name: document.getElementById('member2Name').value,
          member2Email: document.getElementById('member2Email').value,
          contactNumber: document.getElementById('contactNumber').value
        };
        
        // In a real application, you would send this data to a server
        // For now, we'll just show an alert
        alert('Registration submitted successfully! We will contact you soon.');
        registrationForm.reset();
        
        // Save to localStorage for demo purposes
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        registrations.push(formData);
        localStorage.setItem('registrations', JSON.stringify(registrations));
      });
    }
  });
  
  // Admin Authentication
  function adminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Hard-coded admin credentials (in a real app, this would be server-side)
    const adminUsername = 'admin';
    const adminPassword = 'logicleague2025';
    
    if (username === adminUsername && password === adminPassword) {
      // Set authentication state
      localStorage.setItem('adminAuthenticated', 'true');
      // Redirect to admin panel
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
    const teamCount = teamsList.children.length + 1;
    
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
    // Get all team names
    const teamInputs = document.querySelectorAll('.team-input-row');
    const teams = [];
    
    teamInputs.forEach((row) => {
      const teamName = row.querySelector('.team-name').value;
      const teamCollege = row.querySelector('.team-college').value;
      
      if (teamName && teamCollege) {
        teams.push({
          name: teamName,
          college: teamCollege,
          scores: [0, 0, 0, 0], // Scores for 4 rounds
          total: 0
        });
      }
    });
    
    if (teams.length === 0) {
      alert('Please add at least one team');
      return;
    }
    
    // Save teams to localStorage
    localStorage.setItem('teams', JSON.stringify(teams));
    
    // Hide team input section and show scoring section
    document.getElementById('addTeamsSection').style.display = 'none';
    document.getElementById('scoringSection').style.display = 'block';
    
    // Generate scoring form
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
    
    // Add event listeners to score inputs
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
    
    // Get teams from localStorage
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    
    // Update score for the specific team and round
    teams[teamIndex].scores[roundIndex] = score;
    
    // Recalculate total score
    teams[teamIndex].total = teams[teamIndex].scores.reduce((sum, score) => sum + score, 0);
    
    // Update the UI
    const teamScoreRow = event.target.closest('.team-scores-row');
    const totalScoreElement = teamScoreRow.querySelector('.total-score');
    totalScoreElement.textContent = teams[teamIndex].total;
    
    // Save updated teams back to localStorage
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
      // Get teams from localStorage
      const teams = JSON.parse(localStorage.getItem('teams') || '[]');
      
      // Sort teams by total score (descending)
      teams.sort((a, b) => b.total - a.total);
      
      // Build table rows
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
  
  // Initialize admin panel if on admin page
  function initializeAdminPanel() {
    checkAdminAuth();
    
    // Load teams if any exist
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    
    if (teams.length > 0) {
      // Teams exist, show scoring section
      document.getElementById('addTeamsSection').style.display = 'none';
      document.getElementById('scoringSection').style.display = 'block';
      generateScoringForm();
    } else {
      // No teams yet, show team input section
      document.getElementById('addTeamsSection').style.display = 'block';
      document.getElementById('scoringSection').style.display = 'none';
    }
  }