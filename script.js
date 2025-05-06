// Script for the Logic League website

// Initialize Firebase and website features
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyC1kYLP4GbVbtXYxq4nwQgKLsK1-q9kO-k",
    authDomain: "logic-league.firebaseapp.com",
    projectId: "logic-league",
    storageBucket: "logic-league.firebasestorage.app",
    messagingSenderId: "352937903231",
    appId: "1:352937903231:web:02fede5b8d3de8d0a5ab4a",
    databaseURL: "https://logic-league-default-rtdb.firebaseio.com" // Adding database URL
  };

  // Initialize Firebase - check if Firebase is already initialized
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Initialize random positions for floating icons
  initializeFloatingIcons();

  // Highlight nav link on scroll
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (sections.length > 0 && navLinks.length > 0) {
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
  }

  // Initialize specific page functionality
  if (window.location.pathname.includes('standings.html')) {
    loadStandingsData();
  } else if (window.location.pathname.includes('team-management.html')) {
    loadTeamsForManagement();
  }
});

// Initialize floating icons
function initializeFloatingIcons() {
  const icons = document.querySelectorAll(".icon-bg i");
  if (icons.length > 0) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    icons.forEach((icon, index) => {
      // Create random positions
      const randomX = Math.random() * windowWidth;
      const randomY = Math.random() * windowHeight;
      
      // Position icons
      icon.style.left = `${randomX}px`;
      icon.style.top = `${randomY}px`;
      
      // Calculate random movement
      const moveX = Math.random() * 300 - 150;
      const moveY = Math.random() * 300 - 150;
      
      // Set CSS variables for animation
      icon.style.setProperty('--random-x', `${moveX}px`);
      icon.style.setProperty('--random-y', `${moveY}px`);
      
      // Opacity
      icon.style.opacity = '0.35';
    });
  }
}

// Admin Authentication
// NEW: Load Firebase Auth
if (typeof firebase.auth === 'undefined') {
  document.write('<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>');
}

// UPDATED: Use email/password authentication instead of anonymous
function adminLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  console.log("Login attempt:", username); // Debug

  // Only allow predefined admin login
  if (username === 'admin' && password === 'logicleague2025') {
    console.log("Admin credentials match"); // Debug
    
    // Use email/password authentication instead of anonymous
    // We'll use a predefined admin email with the password
    const adminEmail = "admin@logicleague.com";
    
    firebase.auth().signInWithEmailAndPassword(adminEmail, password)
      .then((userCredential) => {
        console.log("Firebase auth successful");
        sessionStorage.setItem('adminAuthenticated', 'true');
        window.location.href = 'admin.html';
      })
      .catch((error) => {
        console.error("Firebase auth error:", error);
        
        // If the user doesn't exist yet, create it first
        if (error.code === 'auth/user-not-found') {
          firebase.auth().createUserWithEmailAndPassword(adminEmail, password)
            .then((userCredential) => {
              console.log("Admin user created");
              sessionStorage.setItem('adminAuthenticated', 'true');
              window.location.href = 'admin.html';
            })
            .catch((createError) => {
              console.error("Error creating admin user:", createError);
              alert("Authentication error: " + createError.message);
            });
        } else {
          alert("Authentication error: " + error.message);
        }
      });
  } else {
    alert('Invalid username or password. Only admin can login.');
  }
}

// Check if admin is logged in and Firebase auth is active
function checkAdminAuth() {
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
  console.log("Admin auth check:", isAuthenticated); // Debug
  
  if (!isAuthenticated && (window.location.pathname.includes('admin.html') || window.location.pathname.includes('team-management.html'))) {
    window.location.href = 'login.html';
    return;
  }
  
  // Check Firebase auth status
  firebase.auth().onAuthStateChanged((user) => {
    if (!user && isAuthenticated && (window.location.pathname.includes('admin.html') || window.location.pathname.includes('team-management.html'))) {
      // Session says we're authenticated but Firebase says we're not
      console.log("Firebase auth state doesn't match session, redirecting to login");
      sessionStorage.removeItem('adminAuthenticated');
      window.location.href = 'login.html';
    }
  });
  
  // If we're on the team management page, load the teams
  if (window.location.pathname.includes('team-management.html')) {
    loadTeamsForManagement();
  }
}

// Admin logout
function adminLogout() {
  sessionStorage.removeItem('adminAuthenticated');
  
  // Sign out from Firebase
  firebase.auth().signOut().then(() => {
    console.log("Signed out from Firebase");
    window.location.href = 'login.html';
  }).catch((error) => {
    console.error("Sign out error:", error);
    window.location.href = 'login.html';
  });
}

// Initialize admin panel if on admin page
function initializeAdminPanel() {
  console.log("Initializing admin panel"); // Debug
  checkAdminAuth();
  
  // Get teams from Firebase
  firebase.database().ref('teams').once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        // Teams already exist, show scoring section
        document.getElementById('addTeamsSection').style.display = 'none';
        document.getElementById('scoringSection').style.display = 'block';
        generateScoringForm();
      } else {
        // No teams yet, show add teams section
        document.getElementById('addTeamsSection').style.display = 'block';
        document.getElementById('scoringSection').style.display = 'none';
      }
    })
    .catch((error) => {
      console.error("Error loading teams:", error);
    });
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

  // Check if user is authenticated with Firebase
  if (!firebase.auth().currentUser) {
    alert('Authentication error: Please log in again');
    adminLogout(); // Force re-login
    return;
  }

  // Save teams to Firebase
  const teamsRef = firebase.database().ref('teams');
  teamsRef.set(teams)
    .then(() => {
      document.getElementById('addTeamsSection').style.display = 'none';
      document.getElementById('scoringSection').style.display = 'block';
      generateScoringForm();
    })
    .catch((error) => {
      console.error("Error saving teams:", error);
      alert('Error saving teams: ' + error.message);
      
      // If we get a permission error, redirect to login
      if (error.code === 'PERMISSION_DENIED') {
        alert('Permission denied. Please log in again.');
        adminLogout();
      }
    });
}


// Generate scoring form based on saved teams - FIXED
function generateScoringForm() {
  firebase.database().ref('teams').once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        const teams = snapshot.val();
        const scoringForm = document.getElementById('scoringForm');
        
        // Clear the form first
        scoringForm.innerHTML = '';

        // Add each team as a table row
        teams.forEach((team, index) => {
          const row = document.createElement('tr');
          
          // Create table cells
          row.innerHTML = `
            <td style="text-align: left;">${team.name} <span class="text-gray-400">(${team.college})</span></td>
            <td><input type="number" data-team="${index}" data-round="0" value="${team.scores[0]}" min="0" class="score-input"></td>
            <td><input type="number" data-team="${index}" data-round="1" value="${team.scores[1]}" min="0" class="score-input"></td>
            <td><input type="number" data-team="${index}" data-round="2" value="${team.scores[2]}" min="0" class="score-input"></td>
            <td><input type="number" data-team="${index}" data-round="3" value="${team.scores[3]}" min="0" class="score-input"></td>
            <td class="total-score">${team.total}</td>
          `;
          
          scoringForm.appendChild(row);
        });

        // Add event listeners to all score inputs
        document.querySelectorAll('.score-input').forEach(input => {
          input.addEventListener('change', updateScores);
          input.addEventListener('input', updateScores); // Also listen for input to update in real-time
        });
      } else {
        console.log("No teams found in the database");
      }
    })
    .catch((error) => {
      console.error("Error generating scoring form:", error);
    });
}

// Update scores when score inputs change - FIXED
function updateScores(event) {
  const teamIndex = parseInt(event.target.dataset.team);
  const roundIndex = parseInt(event.target.dataset.round);
  const score = parseInt(event.target.value) || 0;

  // Check authentication
  if (!firebase.auth().currentUser) {
    alert('Authentication error: Please log in again');
    adminLogout();
    return;
  }

  // Get current teams from Firebase
  firebase.database().ref('teams').once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        const teams = snapshot.val();
        
        // Update the score in the teams array
        teams[teamIndex].scores[roundIndex] = score;
        
        // Recalculate total score
        const total = teams[teamIndex].scores.reduce((sum, score) => sum + score, 0);
        teams[teamIndex].total = total;

        // Update the total score in the UI
        const row = event.target.closest('tr');
        const totalScoreElement = row.querySelector('.total-score');
        totalScoreElement.textContent = total;

        // Update just this team's data in Firebase
        return firebase.database().ref(`teams/${teamIndex}`).update({
          scores: teams[teamIndex].scores,
          total: total
        });
      }
    })
    .then(() => {
      console.log(`Score updated for team ${teamIndex}, round ${roundIndex}`);
    })
    .catch((error) => {
      console.error("Error updating scores:", error);
      alert('Error updating scores: ' + error.message);
      
      // If we get a permission error, redirect to login
      if (error.code === 'PERMISSION_DENIED') {
        alert('Permission denied. Please log in again.');
        adminLogout();
      }
    });
}

// Save all scores
function saveScores() {
  // Check authentication
  if (!firebase.auth().currentUser) {
    alert('Authentication error: Please log in again');
    adminLogout();
    return;
  }
  
  // Get all score inputs
  const scoreInputs = document.querySelectorAll('.score-input');
  const scoreUpdates = [];
  
  // Create an array of updates for batch processing
  scoreInputs.forEach(input => {
    const teamIndex = parseInt(input.dataset.team);
    const roundIndex = parseInt(input.dataset.round);
    const score = parseInt(input.value) || 0;
    
    scoreUpdates.push({
      teamIndex: teamIndex,
      roundIndex: roundIndex,
      score: score
    });
  });
  
  // Get current teams from Firebase
  firebase.database().ref('teams').once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        const teams = snapshot.val();
        
        // Apply all score updates
        scoreUpdates.forEach(update => {
          teams[update.teamIndex].scores[update.roundIndex] = update.score;
        });
        
        // Recalculate all totals
        teams.forEach(team => {
          team.total = team.scores.reduce((sum, score) => sum + score, 0);
        });
        
        // Save all updates to Firebase
        return firebase.database().ref('teams').set(teams);
      }
    })
    .then(() => {
      alert('Scores saved successfully!');
      
      // Update UI to show new totals
      firebase.database().ref('teams').once('value')
        .then((snapshot) => {
          if (snapshot.exists()) {
            const teams = snapshot.val();
            const rows = document.querySelectorAll('#scoringForm tr');
            
            teams.forEach((team, index) => {
              if (rows[index]) {
                const totalCell = rows[index].querySelector('.total-score');
                if (totalCell) {
                  totalCell.textContent = team.total;
                }
              }
            });
          }
        });
    })
    .catch((error) => {
      console.error("Error saving scores:", error);
      alert('Error saving scores: ' + error.message);
      
      // If we get a permission error, redirect to login
      if (error.code === 'PERMISSION_DENIED') {
        alert('Permission denied. Please log in again.');
        adminLogout();
      }
    });
}

// Load standings data on standings page
function loadStandingsData() {
  console.log("Loading standings data"); // Debug
  const standingsTable = document.getElementById('standingsTable');
  if (standingsTable) {
    // Get teams from Firebase
    firebase.database().ref('teams').once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          const teams = snapshot.val();
          // Sort teams by total score
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
        } else {
          // No teams yet
          const tbody = standingsTable.querySelector('tbody');
          tbody.innerHTML = '<tr><td colspan="8">No teams registered yet</td></tr>';
        }
      })
      .catch((error) => {
        console.error("Error loading standings:", error);
      });
  }
}

// Register modal functions - disabled as per requirements
function showRegisterModal() {
  alert("Only admin login is permitted. Registration is disabled.");
  return false;
}

function closeRegisterModal() {
  document.getElementById('registerModal').classList.add('hidden');
}

// Load teams for the management page
function loadTeamsForManagement() {
  console.log("Loading teams for management");
  
  // Make sure user is authenticated
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
  if (!isAuthenticated) {
    window.location.href = 'login.html';
    return;
  }
  
  const tableBody = document.getElementById('teamManagementTableBody');
  if (!tableBody) {
    console.error("Team management table body not found");
    return;
  }
  
  // Clear the table
  tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading teams...</td></tr>';
  
  // Get teams from Firebase
  firebase.database().ref('teams').once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        const teams = snapshot.val();
        
        // Clear loading message
        tableBody.innerHTML = '';
        
        // If no teams found
        if (teams.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No teams found</td></tr>';
          return;
        }
        
        // Add each team to the table
        teams.forEach((team, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td><input type="checkbox" class="team-checkbox" data-index="${index}"></td>
            <td>${team.name}</td>
            <td>${team.college}</td>
            <td>${team.scores[0]}</td>
            <td>${team.scores[1]}</td>
            <td>${team.scores[2]}</td>
            <td>${team.scores[3]}</td>
            <td>${team.total}</td>
          `;
          
          // Make the entire row clickable to select the checkbox
          row.addEventListener('click', function(e) {
            // Skip if the checkbox itself was clicked
            if (e.target.type !== 'checkbox') {
              const checkbox = this.querySelector('.team-checkbox');
              checkbox.checked = !checkbox.checked;
              updateRemoveButtonState();
            }
          });
          
          tableBody.appendChild(row);
        });
        
        // Add event listeners to checkboxes
        document.querySelectorAll('.team-checkbox').forEach(checkbox => {
          checkbox.addEventListener('change', updateRemoveButtonState);
        });
        
        // Initialize remove button state
        updateRemoveButtonState();
      } else {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No teams found</td></tr>';
      }
    })
    .catch((error) => {
      console.error("Error loading teams:", error);
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-red-500">Error loading teams: ${error.message}</td></tr>`;
    });
}

// Toggle all team checkboxes
function toggleAllTeams() {
  const selectAllCheckbox = document.getElementById('selectAllTeams');
  const teamCheckboxes = document.querySelectorAll('.team-checkbox');
  
  teamCheckboxes.forEach(checkbox => {
    checkbox.checked = selectAllCheckbox.checked;
  });
  
  updateRemoveButtonState();
}

// Update the remove button state based on selections
function updateRemoveButtonState() {
  const removeButton = document.getElementById('removeTeamsBtn');
  const checkedBoxes = document.querySelectorAll('.team-checkbox:checked');
  
  if (removeButton) {
    if (checkedBoxes.length > 0) {
      removeButton.removeAttribute('disabled');
      removeButton.textContent = `Remove Selected Teams (${checkedBoxes.length})`;
    } else {
      removeButton.setAttribute('disabled', 'disabled');
      removeButton.textContent = 'Remove Selected Teams';
    }
  }
}

// Show password prompt modal
function showPasswordPrompt(callback) {
  // Create modal container if it doesn't exist
  let modalContainer = document.getElementById('passwordPromptModal');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'passwordPromptModal';
    modalContainer.className = 'modal-overlay';
    modalContainer.style.display = 'flex';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `
      <h3 class="text-xl font-bold mb-4">Confirm Admin Password</h3>
      <p class="mb-4">Please enter the admin password to remove selected teams:</p>
      <input type="password" id="adminPasswordConfirm" class="input-field mb-4" placeholder="Enter admin password">
      <div class="flex justify-end space-x-2">
        <button class="cancel-btn" onclick="closePasswordPrompt()">Cancel</button>
        <button class="submit-btn" id="confirmPasswordBtn">Confirm</button>
      </div>
    `;
    
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
    
    // Add event listener to the confirm button
    document.getElementById('confirmPasswordBtn').addEventListener('click', function() {
      const password = document.getElementById('adminPasswordConfirm').value;
      if (password === 'logicleague2025') {
        closePasswordPrompt();
        if (callback) callback(true);
      } else {
        alert('Incorrect password!');
      }
    });
    
    // Add event listener for Enter key
    document.getElementById('adminPasswordConfirm').addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        document.getElementById('confirmPasswordBtn').click();
      }
    });
    
    // Focus the password input
    setTimeout(() => {
      document.getElementById('adminPasswordConfirm').focus();
    }, 100);
  } else {
    modalContainer.style.display = 'flex';
  }
}

// Close password prompt modal
function closePasswordPrompt() {
  const modal = document.getElementById('passwordPromptModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Updated Remove selected teams function with proper Firebase authentication
function removeSelectedTeams() {
  const checkedBoxes = document.querySelectorAll('.team-checkbox:checked');
  
  if (checkedBoxes.length === 0) {
    alert('Please select at least one team to remove');
    return;
  }
  
  // Confirm deletion
  const confirmDelete = confirm(`Are you sure you want to remove ${checkedBoxes.length} team(s)?`);
  if (!confirmDelete) return;
  
  // Show password prompt
  showPasswordPrompt(function(isVerified) {
    if (isVerified) {
      // Check authentication
      if (!firebase.auth().currentUser) {
        alert('Authentication error: Please log in again');
        adminLogout();
        return;
      }
      
      // Now get the indices of teams to remove
      const indicesToRemove = Array.from(checkedBoxes).map(checkbox => 
        parseInt(checkbox.getAttribute('data-index'))
      );
      
      console.log("Indices to remove:", indicesToRemove);
      
      // Get current teams from Firebase
      firebase.database().ref('teams').once('value')
        .then((snapshot) => {
          if (snapshot.exists()) {
            const teams = snapshot.val();
            
            // Create new array without the selected teams
            // Sort indices in descending order to remove from end first
            const sortedIndices = [...indicesToRemove].sort((a, b) => b - a);
            
            // Make a copy of the teams array
            let updatedTeams = [...teams];
            
            // Remove teams from the copy, starting from the highest index
            sortedIndices.forEach(index => {
              updatedTeams.splice(index, 1);
            });
            
            console.log("Updated teams length:", updatedTeams.length);
            
            // Update Firebase
            return firebase.database().ref('teams').set(updatedTeams);
          } else {
            throw new Error("No teams found in database");
          }
        })
        .then(() => {
          alert('Teams removed successfully!');
          // Reload the teams table
          loadTeamsForManagement();
        })
        .catch((error) => {
          console.error("Error removing teams:", error);
          alert('Error removing teams: ' + error.message);
          
          // If we get a permission error, redirect to login
          if (error.code === 'PERMISSION_DENIED') {
            alert('Permission denied. Please log in again.');
            adminLogout();
          }
        });
    }
  });
}
