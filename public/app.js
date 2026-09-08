let currentUser = null;
let locationWatchId = null;


/* ================= PAGE CONTROL ================= */

function showPage(pageId) {

  document.querySelectorAll(".page")
    .forEach(page => {
      page.classList.remove("active");
    });

  document
    .getElementById(pageId)
    .classList.add("active");
}


function showStudentLogin() {
  showPage("loginPage");
}


function showLeaderLogin() {
  showPage("leaderLoginPage");
}


function showForgotPassword() {
  showPage("forgotPage");
}


/* ================= STUDENT LOGIN ================= */

function studentLogin() {

  const username =
    document.getElementById("username")
      .value.trim();

  const password =
    document.getElementById("password")
      .value;

  const message =
    document.getElementById("loginMessage");


  if (!username || !password) {

    message.textContent =
      "Enter your username and password.";

    return;
  }


  /*
    TEMPORARY UI LOGIN.

    Real authentication will be connected
    to the secure backend/database next.
  */

  currentUser = {
    username: username,
    mobile: ""
  };


  sessionStorage.setItem(
    "hitamStudent",
    JSON.stringify(currentUser)
  );


  document.getElementById(
    "studentName"
  ).textContent = username;


  document.getElementById(
    "settingsUsername"
  ).textContent = username;


  showPage("studentDashboard");
}


/* ================= LEADER LOGIN ================= */

function leaderLogin() {

  const username =
    document.getElementById("leaderUsername")
      .value.trim();

  const password =
    document.getElementById("leaderPassword")
      .value;

  const message =
    document.getElementById("leaderMessage");


  if (!username || !password) {

    message.textContent =
      "Enter your leader credentials.";

    return;
  }


  /*
    DEMO ONLY.

    Real leader authentication will be
    moved completely to the server.
  */

  if (password === "HITAM26") {

    sessionStorage.setItem(
      "hitamLeader",
      "true"
    );

    showPage("leadersDashboard");

  } else {

    message.textContent =
      "Invalid leader credentials.";
  }
}


/* ================= PASSWORD RESET ================= */

function requestPasswordReset() {

  const username =
    document.getElementById(
      "forgotUsername"
    ).value.trim();

  const mobile =
    document.getElementById(
      "forgotMobile"
    ).value.trim();

  const message =
    document.getElementById(
      "forgotMessage"
    );


  if (!username || !mobile) {

    message.textContent =
      "Enter your username and registered mobile number.";

    return;
  }


  message.style.color = "#aeb8ff";

  message.textContent =
    "Account verification will be connected securely next.";
}


/* ================= SETTINGS ================= */

function openSettings() {

  if (!currentUser) {

    const saved =
      sessionStorage.getItem(
        "hitamStudent"
      );

    if (saved) {
      currentUser = JSON.parse(saved);
    }
  }


  if (currentUser) {

    document.getElementById(
      "settingsUsername"
    ).textContent =
      currentUser.username;

    document.getElementById(
      "settingsMobile"
    ).textContent =
      currentUser.mobile ||
      "Not registered";
  }


  showPage("settingsPage");
}


function backToDashboard() {
  showPage("studentDashboard");
}


function changePassword() {

  const oldPassword =
    document.getElementById(
      "oldPassword"
    ).value;

  const newPassword =
    document.getElementById(
      "newPassword"
    ).value;

  const confirmPassword =
    document.getElementById(
      "confirmPassword"
    ).value;

  const message =
    document.getElementById(
      "settingsMessage"
    );


  if (
    !oldPassword ||
    !newPassword ||
    !confirmPassword
  ) {

    message.textContent =
      "Complete all password fields.";

    return;
  }


  if (newPassword !== confirmPassword) {

    message.textContent =
      "New passwords do not match.";

    return;
  }


  if (newPassword.length < 8) {

    message.textContent =
      "Password must contain at least 8 characters.";

    return;
  }


  message.style.color =
    "#aeb8ff";

  message.textContent =
    "Secure password changing will be connected next.";
}


/* ================= LOCATION ================= */

function enableLocation() {

  const mobile =
    document.getElementById(
      "mobileNumber"
    ).value.trim();

  const status =
    document.getElementById(
      "locationStatus"
    );


  if (!mobile) {

    status.textContent =
      "Enter your registered mobile number.";

    return;
  }


  if (!navigator.geolocation) {

    status.textContent =
      "Location is not supported by this browser.";

    return;
  }


  status.textContent =
    "Requesting location permission...";


  locationWatchId =
    navigator.geolocation.watchPosition(

      position => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        status.textContent =
          "🟢 Location sharing is ON.";


        /*
          Database storage will be connected
          after authentication is completed.
        */

        console.log({
          mobile,
          latitude,
          longitude,
          time: new Date().toISOString()
        });

      },

      error => {

        if (error.code === 1) {

          status.textContent =
            "Location permission was denied.";

        } else {

          status.textContent =
            "Unable to get your location.";

        }

      },

      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000
      }

    );
}


function stopLocation() {

  if (locationWatchId !== null) {

    navigator.geolocation.clearWatch(
      locationWatchId
    );

    locationWatchId = null;
  }


  document.getElementById(
    "locationStatus"
  ).textContent =
    "🔴 Location sharing is OFF.";
}


/* ================= LEADER SEARCH ================= */

function findStudent() {

  const mobile =
    document.getElementById(
      "searchMobile"
    ).value.trim();

  const result =
    document.getElementById(
      "trackingResult"
    );


  if (!mobile) {

    result.textContent =
      "Enter the student's mobile number.";

    return;
  }


  result.innerHTML = `
    Student search:
    <strong>${escapeHTML(mobile)}</strong>
    <br><br>
    Secure location lookup will be connected
    to the database and real map next.
  `;
}


/* ================= SECURITY HELPER ================= */

function escapeHTML(value) {

  const element =
    document.createElement("div");

  element.textContent = value;

  return element.innerHTML;
}


/* ================= LOGOUT ================= */

function logout() {

  stopLocation();

  currentUser = null;

  sessionStorage.clear();

  showStudentLogin();
}
