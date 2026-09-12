// ======================================================
// HITAM 3D COLLEGE PORTAL
// Student + Leader Frontend
// ======================================================

let currentUser = null;
let locationWatchId = null;

let studentMap = null;
let studentMarkers = [];
let studentAccuracyCircles = [];


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
// LOGIN PAGES
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
// STUDENT LOGIN
// ======================================================

async function studentLogin() {

  const username =
    document.getElementById("username")?.value.trim();

  const mobile =
    document.getElementById("mobileNumber")?.value.trim();

  const password =
    document.getElementById("password")?.value;

  const message =
    document.getElementById("loginMessage");


  if (!username || !mobile || !password) {

    if (message) {
      message.textContent =
        "Enter username, mobile number and password.";
    }

    return;
  }


  try {

    const response =
      await fetch("/api/student/login", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          username,
          mobile,
          password
        })

      });


    const result =
      await response.json();


    if (!response.ok || !result.success) {

      if (message) {
        message.textContent =
          result.message || "Student login failed.";
      }

      return;
    }


    currentUser = result;


    updateStudentInformation();

    showPage("studentDashboard");


    // Ask for location permission after login
    startStudentLocationTracking();


  } catch (error) {

    console.error(error);

    if (message) {
      message.textContent =
        "Unable to connect to HITAM server.";
    }

  }

}


// ======================================================
// LEADER LOGIN
// ======================================================

async function leaderLogin() {

  const username =
    document.getElementById("leaderUsername")?.value.trim();

  const password =
    document.getElementById("leaderPassword")?.value;

  const message =
    document.getElementById("leaderMessage");


  if (!username || !password) {

    if (message) {
      message.textContent =
        "Enter leader username and password.";
    }

    return;
  }


  try {

    const response =
      await fetch("/api/leader/login", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          username,
          password
        })

      });


    const result =
      await response.json();


    if (!response.ok || !result.success) {

      if (message) {
        message.textContent =
          result.message || "Leader login failed.";
      }

      return;
    }


    currentUser = result;


    showPage("leadersDashboard");


    // Prepare leader map
    setTimeout(() => {
      initializeStudentMap();
      loadAllStudentLocations();
    }, 400);


  } catch (error) {

    console.error(error);

    if (message) {
      message.textContent =
        "Unable to connect to HITAM server.";
    }

  }

}


// ======================================================
// CHECK CURRENT LOGIN
// ======================================================

async function checkLogin() {

  try {

    const response =
      await fetch("/api/me");


    if (!response.ok) {
      return;
    }


    const result =
      await response.json();


    if (!result.success) {
      return;
    }


    currentUser =
      result.user;


    if (currentUser.role === "leader") {

      showPage("leadersDashboard");

      setTimeout(() => {
        initializeStudentMap();
        loadAllStudentLocations();
      }, 300);

    } else {

      updateStudentInformation();

      showPage("studentDashboard");

    }


  } catch (error) {

    console.log(
      "No active login session."
    );

  }

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
      currentUser.username || "-";
  }


  if (settingsUsername) {
    settingsUsername.textContent =
      currentUser.username || "-";
  }


  if (settingsMobile) {
    settingsMobile.textContent =
      currentUser.mobile || "-";
  }

}


// ======================================================
// DASHBOARD
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
  renderAssignments();
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
// STUDENT GPS LOCATION
// ======================================================

function startStudentLocationTracking() {

  if (!currentUser) return;

  if (currentUser.role !== "student") return;


  if (!navigator.geolocation) {

    alert(
      "Your phone does not support GPS location."
    );

    return;

  }


  navigator.geolocation.getCurrentPosition(

    position => {

      sendStudentLocation(position);


      // Continue receiving location updates
      locationWatchId =
        navigator.geolocation.watchPosition(

          sendStudentLocation,

          locationError,

          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 15000
          }

        );

    },

    locationError,

    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }

  );

}


// ======================================================
// SEND LOCATION TO SERVER
// ======================================================

async function sendStudentLocation(position) {

  if (!currentUser) return;

  if (currentUser.role !== "student") return;


  try {

    const response =
      await fetch("/api/location", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          accuracy:
            position.coords.accuracy

        })

      });


    const result =
      await response.json();


    if (result.success) {

      console.log(
        "HITAM GPS location updated."
      );

    }


  } catch (error) {

    console.error(
      "Unable to send location:",
      error
    );

  }

}


// ======================================================
// LOCATION ERROR
// ======================================================

function locationError(error) {

  console.error(
    "Location error:",
    error
  );


  if (error.code === 1) {

    alert(
      "Please allow location permission for HITAM."
    );

  }

  else if (error.code === 2) {

    alert(
      "Your phone could not determine your location."
    );

  }

  else if (error.code === 3) {

    alert(
      "Location request timed out. Please try again."
    );

  }

}


// ======================================================
// STOP LOCATION SESSION
// ======================================================

async function stopStudentLocationTracking() {

  if (locationWatchId !== null) {

    navigator.geolocation.clearWatch(
      locationWatchId
    );

    locationWatchId = null;

  }


  try {

    await fetch(
      "/api/location",
      {
        method: "DELETE"
      }
    );

  } catch (error) {

    console.error(error);

  }

}


// ======================================================
// REAL LEADER MAP
// ======================================================

function initializeStudentMap() {

  const mapElement =
    document.getElementById("studentMap");


  if (!mapElement) {
    return;
  }


  if (typeof L === "undefined") {

    console.error(
      "Leaflet map library not loaded."
    );

    return;

  }


  if (studentMap) {

    setTimeout(() => {
      studentMap.invalidateSize();
    }, 300);

    return;

  }


  studentMap =
    L.map("studentMap")
      .setView(
        [20.5937, 78.9629],
        5
      );


  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,

      attribution:
        "&copy; OpenStreetMap contributors"
    }
  ).addTo(studentMap);


  setTimeout(() => {

    studentMap.invalidateSize();

  }, 500);

}


// ======================================================
// FIND ONE STUDENT
// ======================================================

async function findStudent() {

  if (
    !currentUser ||
    currentUser.role !== "leader"
  ) {

    alert(
      "Only authorized leaders can track students."
    );

    return;

  }


  const input =
    document.getElementById("searchMobile");

  const status =
    document.getElementById("mapStatus");


  if (!input) return;


  const mobile =
    input.value.trim();


  if (!mobile) {

    if (status) {

      status.textContent =
        "Enter a student's mobile number.";

    }

    return;

  }


  initializeStudentMap();


  if (status) {

    status.textContent =
      "Searching for student location...";

  }


  try {

    const response =
      await fetch(
        `/api/location/${encodeURIComponent(mobile)}`
      );


    const result =
      await response.json();


    if (!response.ok || !result.success) {

      if (status) {

        status.textContent =
          result.message ||
          "No active location found.";

      }

      return;

    }


    displayStudentLocation(
      result.student
    );


  } catch (error) {

    console.error(error);

    if (status) {

      status.textContent =
        "Unable to connect to location server.";

    }

  }

}


// ======================================================
// DISPLAY ONE STUDENT
// ======================================================

function displayStudentLocation(student) {

  if (!studentMap) {
    initializeStudentMap();
  }


  const latitude =
    Number(student.latitude);

  const longitude =
    Number(student.longitude);


  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {

    return;

  }


  studentMap.setView(
    [latitude, longitude],
    17,
    {
      animate: true
    }
  );


  // Remove old markers
  clearMapMarkers();


  const marker =
    L.marker([
      latitude,
      longitude
    ]).addTo(studentMap);


  const accuracy =
    student.accuracy
      ? Math.round(student.accuracy)
      : "Unknown";


  marker.bindPopup(`

    <div>

      <strong>📍 HITAM Student</strong>

      <br><br>

      <strong>
        ${escapeHTML(student.username)}
      </strong>

      <br>

      Mobile:
      ${escapeHTML(student.mobile)}

      <br><br>

      Accuracy:
      ${accuracy} m

      <br>

      Updated:
      ${new Date(
        student.updatedAt
      ).toLocaleString()}

    </div>

  `).openPopup();


  studentMarkers.push(marker);


  if (
    student.accuracy &&
    Number.isFinite(
      Number(student.accuracy)
    )
  ) {

    const circle =
      L.circle(
        [latitude, longitude],
        {
          radius:
            Number(student.accuracy)
        }
      ).addTo(studentMap);


    studentAccuracyCircles.push(
      circle
    );

  }


  const status =
    document.getElementById("mapStatus");


  if (status) {

    status.innerHTML = `

      <strong>📍 Location Active</strong>

      <br><br>

      Student:
      ${escapeHTML(student.username)}

      <br>

      Mobile:
      ${escapeHTML(student.mobile)}

      <br>

      Coordinates:
      ${latitude.toFixed(6)},
      ${longitude.toFixed(6)}

      <br>

      Accuracy:
      ${accuracy} m

    `;

  }

}


// ======================================================
// LOAD ALL STUDENTS
// ======================================================

async function loadAllStudentLocations() {

  if (
    !currentUser ||
    currentUser.role !== "leader"
  ) {

    return;

  }


  initializeStudentMap();


  try {

    const response =
      await fetch(
        "/api/locations"
      );


    const result =
      await response.json();


    if (
      !response.ok ||
      !result.success
    ) {

      console.error(
        result.message
      );

      return;

    }


    clearMapMarkers();


    if (result.locations.length === 0) {

      const status =
        document.getElementById("mapStatus");


      if (status) {

        status.textContent =
          "No students are currently sharing their location.";

      }

      return;

    }


    const mapPoints = [];


    result.locations.forEach(
      student => {

        const latitude =
          Number(student.latitude);

        const longitude =
          Number(student.longitude);


        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {

          return;

        }


        const marker =
          L.marker([
            latitude,
            longitude
          ]).addTo(studentMap);


        marker.bindPopup(`

          <div>

            <strong>📍 HITAM Student</strong>

            <br><br>

            <strong>
              ${escapeHTML(student.username)}
            </strong>

            <br>

            Mobile:
            ${escapeHTML(student.mobile)}

            <br><br>

            Updated:
            ${new Date(
              student.updatedAt
            ).toLocaleString()}

          </div>

        `);


        studentMarkers.push(
          marker
        );


        mapPoints.push([
          latitude,
          longitude
        ]);

      }
    );


    if (mapPoints.length > 0) {

      studentMap.fitBounds(
        mapPoints,
        {
          padding: [40, 40]
        }
      );

    }


    const status =
      document.getElementById("mapStatus");


    if (status) {

      status.innerHTML = `

        <strong>
          📍 ${mapPoints.length}
          active student location(s)
        </strong>

        <br><br>

        Only authorized leaders can view
        these locations.

      `;

    }


  } catch (error) {

    console.error(
      "Unable to load locations:",
      error
    );

  }

}


// ======================================================
// CLEAR MAP MARKERS
// ======================================================

function clearMapMarkers() {

  if (!studentMap) return;


  studentMarkers.forEach(
    marker => {

      studentMap.removeLayer(
        marker
      );

    }
  );


  studentAccuracyCircles.forEach(
    circle => {

      studentMap.removeLayer(
        circle
      );

    }
  );


  studentMarkers = [];

  studentAccuracyCircles = [];

}


// ======================================================
// ASSIGNMENTS
// ======================================================

function addAssignment() {

  const title =
    document.getElementById(
      "assignmentTitle"
    )?.value.trim();


  const details =
    document.getElementById(
      "assignmentDetails"
    )?.value.trim();


  if (!title) {

    alert(
      "Enter an assignment title."
    );

    return;

  }


  const assignments =
    JSON.parse(
      localStorage.getItem(
        "hitamAssignments"
      ) || "[]"
    );


  assignments.push({

    id: Date.now(),

    title,

    details

  });


  localStorage.setItem(
    "hitamAssignments",
    JSON.stringify(assignments)
  );


  document.getElementById(
    "assignmentTitle"
  ).value = "";


  document.getElementById(
    "assignmentDetails"
  ).value = "";


  renderAssignments();

}


function renderAssignments() {

  const container =
    document.getElementById(
      "assignmentList"
    );


  if (!container) return;


  const assignments =
    JSON.parse(
      localStorage.getItem(
        "hitamAssignments"
      ) || "[]"
    );


  if (assignments.length === 0) {

    container.innerHTML = `

      <div class="empty-state">

        <div>📚</div>

        <h2>No assignments</h2>

        <p>
          Add an assignment to see it here.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    assignments.map(
      item => `

        <div
          class="assignment-item glass"
          style="
            padding:20px;
            margin-bottom:15px;
            border-radius:18px;
          "
        >

          <h2>
            ${escapeHTML(item.title)}
          </h2>

          <p>
            ${escapeHTML(
              item.details || ""
            )}
          </p>

          <button
            onclick="deleteAssignment(${item.id})"
          >
            DELETE
          </button>

        </div>

      `
    ).join("");

}


function deleteAssignment(id) {

  const assignments =
    JSON.parse(
      localStorage.getItem(
        "hitamAssignments"
      ) || "[]"
    );


  const updated =
    assignments.filter(
      item => item.id !== id
    );


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
    document.getElementById(
      "fileUpload"
    );


  const list =
    document.getElementById(
      "fileList"
    );


  if (!input || !list) return;


  if (!input.files.length) {

    alert(
      "Please select a file first."
    );

    return;

  }


  list.innerHTML = "";


  Array.from(
    input.files
  ).forEach(file => {

    const item =
      document.createElement(
        "div"
      );


    item.style.padding =
      "15px";

    item.style.marginTop =
      "10px";

    item.style.borderRadius =
      "14px";

    item.style.background =
      "rgba(255,255,255,0.06)";


    item.textContent =
      `📄 ${file.name}`;


    list.appendChild(item);

  });

}


function addGoogleDriveFile() {

  alert(
    "Google Drive integration will be connected in the next storage stage."
  );

}


// ======================================================
// CHAT
// ======================================================

function sendMessage() {

  const input =
    document.getElementById(
      "chatInput"
    );


  const messages =
    document.getElementById(
      "chatMessages"
    );


  if (!input || !messages) return;


  const text =
    input.value.trim();


  if (!text) return;


  const message =
    document.createElement(
      "div"
    );


  message.style.padding =
    "12px 16px";

  message.style.marginBottom =
    "10px";

  message.style.borderRadius =
    "15px";

  message.style.background =
    "rgba(90,105,255,0.18)";


  message.textContent =
    text;


  messages.appendChild(
    message
  );


  input.value = "";


  messages.scrollTop =
    messages.scrollHeight;

}


// ======================================================
// TIMETABLE
// ======================================================

function showDailyTimetable() {

  const display =
    document.getElementById(
      "timetableDisplay"
    );


  if (!display) return;


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
    document.getElementById(
      "timetableDisplay"
    );


  if (!display) return;


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


// ======================================================
// SETTINGS
// ======================================================

async function changePassword() {

  const message =
    document.getElementById(
      "settingsMessage"
    );


  if (message) {

    message.textContent =
      "Password management will be connected to the database authentication stage.";

  }

}


async function requestPasswordReset() {

  const username =
    document.getElementById(
      "forgotUsername"
    )?.value.trim();


  const mobile =
    document.getElementById(
      "forgotMobile"
    )?.value.trim();


  const message =
    document.getElementById(
      "forgotMessage"
    );


  if (!username || !mobile) {

    if (message) {

      message.textContent =
        "Enter your username and registered mobile number.";

    }

    return;

  }


  if (message) {

    message.textContent =
      "Account verification will be connected to the secure account system.";

  }

}


// ======================================================
// LOGOUT
// ======================================================

async function logout() {

  stopStudentLocationTracking();


  try {

    await fetch(
      "/api/logout",
      {
        method: "POST"
      }
    );

  } catch (error) {

    console.error(error);

  }


  currentUser = null;


  clearMapMarkers();


  if (studentMap) {

    studentMap.remove();

    studentMap = null;

  }


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

    .replaceAll(
      "'",
      "&#039;"
    );

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
          event.clientX -
          rect.left;

        const y =
          event.clientY -
          rect.top;


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
// START
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderAssignments();

    checkLogin();

  }
);
