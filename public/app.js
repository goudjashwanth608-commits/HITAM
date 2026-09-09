// ======================================================
// HITAM - 3D STUDENT PORTAL
// Front-end navigation
// ======================================================

let currentUser = null;


// ======================================================
// PAGE NAVIGATION
// ======================================================

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
    window.scrollTo(0, 0);
  }
}


// ======================================================
// LOGIN SCREENS
// ======================================================

function showStudentLogin() {
  showPage("loginPage");
}

function showLeaderLogin() {
  showPage("leaderLoginPage");
}

function showForgotPassword() {
  showPage("forgotPage");
}


// ======================================================
// TEMPORARY STUDENT LOGIN
// ======================================================
// Real database authentication will replace this later.

function studentLogin() {

  const username =
    document.getElementById("username").value.trim();

  const mobile =
    document.getElementById("mobileNumber").value.trim();

  const password =
    document.getElementById("password").value;

  const message =
    document.getElementById("loginMessage");


  if (!username || !mobile || !password) {

    message.textContent =
      "Please enter username, mobile number and password.";

    return;
  }


  if (!/^[0-9+\-\s]{8,15}$/.test(mobile)) {

    message.textContent =
      "Please enter a valid mobile number.";

    return;
  }


  currentUser = {
    username: username,
    mobile: mobile
  };


  localStorage.setItem(
    "hitamCurrentUser",
    JSON.stringify(currentUser)
  );


  updateStudentInformation();

  showPage("studentDashboard");
}


// ======================================================
// LEADER LOGIN
// ======================================================
// Temporary front-end demonstration only.
// Real leader authentication will be moved to the server.

function leaderLogin() {

  const username =
    document.getElementById("leaderUsername").value.trim();

  const password =
    document.getElementById("leaderPassword").value;

  const message =
    document.getElementById("leaderMessage");


  if (!username || !password) {

    message.textContent =
      "Enter leader username and password.";

    return;
  }


  // Temporary password for development.
  // This MUST NOT be used for the final production system.

  if (password !== "HITAM26") {

    message.textContent =
      "Invalid leader credentials.";

    return;
  }


  currentUser = {
    username: username,
    role: "leader"
  };


  localStorage.setItem(
    "hitamCurrentUser",
    JSON.stringify(currentUser)
  );


  showPage("leadersDashboard");
}


// ======================================================
// STUDENT INFORMATION
// ======================================================

function updateStudentInformation() {

  if (!currentUser) return;


  const name =
    document.getElementById("studentName");

  const settingsUsername =
    document.getElementById("settingsUsername");

  const settingsMobile =
    document.getElementById("settingsMobile");


  if (name) {
    name.textContent =
      currentUser.username;
  }


  if (settingsUsername) {
    settingsUsername.textContent =
      currentUser.username;
  }


  if (settingsMobile) {
    settingsMobile.textContent =
      currentUser.mobile || "-";
  }
}


// ======================================================
// DASHBOARD NAVIGATION
// ======================================================

function backToDashboard() {

  if (
    currentUser &&
    currentUser.role === "leader"
  ) {
    showPage("leadersDashboard");
  } else {
    showPage("studentDashboard");
  }
}


function openAssignments() {
  showPage("assignmentsPage");
}


function openFiles() {
  showPage("filesPage");
}


function openChat() {
  showPage("chatPage");
}


function openTimetable() {
  showPage("timetablePage");
}


function openCharts() {
  showPage("chartsPage");
}


function openSettings() {

  updateStudentInformation();

  showPage("settingsPage");
}


// ======================================================
// ASSIGNMENTS
// ======================================================

function addAssignment() {

  const title =
    document.getElementById("assignmentTitle").value.trim();

  const details =
    document.getElementById("assignmentDetails").value.trim();


  if (!title) {
    alert("Please enter an assignment title.");
    return;
  }


  const assignment = {
    id: Date.now(),
    title: title,
    details: details
  };


  const assignments =
    JSON.parse(
      localStorage.getItem("hitamAssignments") || "[]"
    );


  assignments.push(assignment);


  localStorage.setItem(
    "hitamAssignments",
    JSON.stringify(assignments)
  );


  document.getElementById("assignmentTitle").value = "";
  document.getElementById("assignmentDetails").value = "";


  renderAssignments();
}


function renderAssignments() {

  const container =
    document.getElementById("assignmentList");

  if (!container) return;


  const assignments =
    JSON.parse(
      localStorage.getItem("hitamAssignments") || "[]"
    );


  if (assignments.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <div>📚</div>
        <h2>No assignments</h2>
        <p>Add an assignment to see it here.</p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    assignments.map(item => `

      <div class="assignment-item glass"
           style="padding:20px;margin-bottom:15px;border-radius:18px;">

        <h2>${escapeHTML(item.title)}</h2>

        <p style="color:#aab2ce;margin-top:8px;">
          ${escapeHTML(item.details || "")}
        </p>

        <button
          onclick="deleteAssignment(${item.id})"
        >
          DELETE
        </button>

      </div>

    `).join("");
}


function deleteAssignment(id) {

  const assignments =
    JSON.parse(
      localStorage.getItem("hitamAssignments") || "[]"
    );


  const updated =
    assignments.filter(item => item.id !== id);


  localStorage.setItem(
    "hitamAssignments",
    JSON.stringify(updated)
  );


  renderAssignments();
}


// ======================================================
// FILES
// ======================================================

function uploadFiles() {

  const input =
    document.getElementById("fileUpload");

  const list =
    document.getElementById("fileList");


  if (!input || !list) return;


  if (!input.files.length) {

    alert("Please select a file first.");

    return;
  }


  list.innerHTML = "";


  Array.from(input.files).forEach(file => {

    const item =
      document.createElement("div");


    item.style.padding = "15px";
    item.style.marginTop = "10px";
    item.style.borderRadius = "14px";
    item.style.background =
      "rgba(255,255,255,0.06)";


    item.textContent =
      `📄 ${file.name}`;


    list.appendChild(item);

  });


  /*
    IMPORTANT:

    Browser-selected files are NOT permanently
    uploaded by this temporary front-end code.

    The final version will send files to the
    secure backend/storage system.
  */
}


function addGoogleDriveFile() {

  alert(
    "Google Drive integration will be connected in the backend stage."
  );
}


// ======================================================
// CHAT
// ======================================================

function sendMessage() {

  const input =
    document.getElementById("chatInput");

  const messages =
    document.getElementById("chatMessages");


  if (!input || !messages) return;


  const text =
    input.value.trim();


  if (!text) return;


  const message =
    document.createElement("div");


  message.style.padding = "12px 16px";
  message.style.marginBottom = "10px";
  message.style.borderRadius = "15px";
  message.style.background =
    "rgba(90,105,255,0.18)";
  message.style.textAlign = "right";


  message.textContent = text;


  messages.appendChild(message);


  input.value = "";

  messages.scrollTop =
    messages.scrollHeight;
}


// ======================================================
// TIMETABLE
// ======================================================

function showDailyTimetable() {

  const display =
    document.getElementById("timetableDisplay");


  display.innerHTML = `

    <div class="empty-state">

      <div>🗓️</div>

      <h2>Daily Timetable</h2>

      <p>
        Your daily timetable will appear here.
      </p>

    </div>

  `;
}


function showMonthlyTimetable() {

  const display =
    document.getElementById("timetableDisplay");


  display.innerHTML = `

    <div class="empty-state">

      <div>📅</div>

      <h2>Monthly Timetable</h2>

      <p>
        Your monthly timetable will appear here.
      </p>

    </div>

  `;
}


function uploadTimetable() {

  const input =
    document.getElementById("timetableUpload");


  if (!input.files.length) {

    alert("Please select a timetable file.");

    return;
  }


  const display =
    document.getElementById("timetableDisplay");


  display.innerHTML = `

    <div class="empty-state">

      <div>✅</div>

      <h2>Timetable Selected</h2>

      <p>
        ${escapeHTML(input.files[0].name)}
      </p>

      <p>
        Permanent timetable storage will be
        connected to the backend.
      </p>

    </div>

  `;
}


// ======================================================
// PASSWORD
// ======================================================

function changePassword() {

  const oldPassword =
    document.getElementById("oldPassword").value;

  const newPassword =
    document.getElementById("newPassword").value;

  const confirmPassword =
    document.getElementById("confirmPassword").value;

  const message =
    document.getElementById("settingsMessage");


  if (!oldPassword ||
      !newPassword ||
      !confirmPassword) {

    message.textContent =
      "Please fill in all password fields.";

    return;
  }


  if (newPassword.length < 8) {

    message.textContent =
      "New password must contain at least 8 characters.";

    return;
  }


  if (newPassword !== confirmPassword) {

    message.textContent =
      "New passwords do not match.";

    return;
  }


  message.textContent =
    "Password changing will be connected to the secure server.";

}


function requestPasswordReset() {

  const username =
    document.getElementById("forgotUsername").value.trim();

  const mobile =
    document.getElementById("forgotMobile").value.trim();

  const message =
    document.getElementById("forgotMessage");


  if (!username || !mobile) {

    message.textContent =
      "Enter username and registered mobile number.";

    return;
  }


  message.textContent =
    "Account verification will be connected to the secure server.";

}


// ======================================================
// LEADER LOCATION INTERFACE
// ======================================================

function findStudent() {

  const mobile =
    document.getElementById("searchMobile").value.trim();

  const result =
    document.getElementById("trackingResult");


  if (!mobile) {

    result.textContent =
      "Enter a student's registered mobile number.";

    return;
  }


  result.innerHTML = `

    <strong>
      Student search
    </strong>

    <br><br>

    Mobile:
    ${escapeHTML(mobile)}

    <br><br>

    Location service will be connected to the
    secure server and real map in the next stage.

  `;
}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

  currentUser = null;

  localStorage.removeItem(
    "hitamCurrentUser"
  );


  document.getElementById("username").value = "";
  document.getElementById("mobileNumber").value = "";
  document.getElementById("password").value = "";

  showStudentLogin();
}


// ======================================================
// SECURITY HELPER
// ======================================================

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ======================================================
// 3D CARD MOVEMENT
// ======================================================

document.addEventListener(
  "pointermove",
  event => {

    const cards =
      document.querySelectorAll(
        ".feature-card"
      );


    cards.forEach(card => {

      const rect =
        card.getBoundingClientRect();


      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {

        const x =
          event.clientX - rect.left;

        const y =
          event.clientY - rect.top;


        const rotateY =
          ((x / rect.width) - 0.5) * 8;

        const rotateX =
          ((y / rect.height) - 0.5) * -8;


        card.style.transform =
          `perspective(900px)
           rotateX(${rotateX}deg)
           rotateY(${rotateY}deg)
           translateY(-12px)
           translateZ(25px)`;

      } else {

        card.style.transform = "";

      }

    });

  }
);


// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const savedUser =
      localStorage.getItem(
        "hitamCurrentUser"
      );


    if (savedUser) {

      try {

        currentUser =
          JSON.parse(savedUser);

        updateStudentInformation();

      } catch {

        localStorage.removeItem(
          "hitamCurrentUser"
        );

      }

    }


    renderAssignments();

  }
);
