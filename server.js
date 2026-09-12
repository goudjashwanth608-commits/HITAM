const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================================
// BASIC SETTINGS
// ======================================================

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));


// ======================================================
// EXACTLY 5 LEADER ACCOUNTS
// ======================================================
//
// For the first working version, these usernames are
// defined on the server.
//
// IMPORTANT:
// Change these usernames before sharing the website.
//
// The password below is temporary development data.
// We will move these accounts to a database and hashed
// passwords before production use.
//

const LEADERS = [
  {
    username: "leader1",
    password: "HITAM26"
  },
  {
    username: "leader2",
    password: "HITAM26"
  },
  {
    username: "leader3",
    password: "HITAM26"
  },
  {
    username: "leader4",
    password: "HITAM26"
  },
  {
    username: "leader5",
    password: "HITAM26"
  }
];


// ======================================================
// DEVELOPMENT STUDENT STORAGE
// ======================================================
//
// This is temporary.
// A real database will replace this later.
//

const students = new Map();


// ======================================================
// LOCATION STORAGE
// ======================================================
//
// Stores the latest location for each registered mobile
// number while the server is running.
//

const studentLocations = new Map();


// ======================================================
// SECURITY HELPERS
// ======================================================

function requireLogin(req, res, next) {

  if (!req.session.user) {

    return res.status(401).json({
      success: false,
      message: "Login required."
    });

  }

  next();
}


function requireLeader(req, res, next) {

  if (!req.session.user) {

    return res.status(401).json({
      success: false,
      message: "Login required."
    });

  }


  if (req.session.user.role !== "leader") {

    return res.status(403).json({
      success: false,
      message: "Leader access required."
    });

  }


  next();
}


// ======================================================
// SERVER STATUS
// ======================================================

app.get("/api/status", (req, res) => {

  res.json({
    success: true,
    website: "HITAM",
    server: "online",
    studentsWithLocation:
      studentLocations.size
  });

});


// ======================================================
// STUDENT LOGIN
// ======================================================
//
// Development login.
// Real student accounts/database will be added next.
//

app.post("/api/student/login", (req, res) => {

  const {
    username,
    mobile,
    password
  } = req.body;


  if (!username || !mobile || !password) {

    return res.status(400).json({
      success: false,
      message:
        "Username, mobile number and password are required."
    });

  }


  const existingStudent =
    students.get(mobile);


  if (
    existingStudent &&
    existingStudent.password !== password
  ) {

    return res.status(401).json({
      success: false,
      message: "Invalid student password."
    });

  }


  if (!existingStudent) {

    students.set(mobile, {

      username,
      mobile,
      password

    });

  }


  req.session.user = {

    role: "student",

    username,

    mobile

  };


  res.json({

    success: true,

    role: "student",

    username,

    mobile

  });

});


// ======================================================
// LEADER LOGIN
// ======================================================

app.post("/api/leader/login", (req, res) => {

  const {
    username,
    password
  } = req.body;


  const leader =
    LEADERS.find(
      item =>
        item.username === username &&
        item.password === password
    );


  if (!leader) {

    return res.status(401).json({
      success: false,
      message: "Invalid leader credentials."
    });

  }


  req.session.user = {

    role: "leader",

    username: leader.username

  };


  res.json({

    success: true,

    role: "leader",

    username: leader.username

  });

});


// ======================================================
// CURRENT LOGIN
// ======================================================

app.get(
  "/api/me",
  requireLogin,
  (req, res) => {

    res.json({

      success: true,

      user: req.session.user

    });

  }
);


// ======================================================
// LOGOUT
// ======================================================

app.post("/api/logout", (req, res) => {

  req.session.destroy(() => {

    res.json({
      success: true
    });

  });

});


// ======================================================
// STUDENT SENDS GPS LOCATION
// ======================================================

app.post(
  "/api/location",
  requireLogin,
  (req, res) => {

    if (
      req.session.user.role !== "student"
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Only students can submit their location."
      });

    }


    const {
      latitude,
      longitude,
      accuracy
    } = req.body;


    const mobile =
      req.session.user.mobile;


    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid GPS coordinates."
      });

    }


    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid GPS coordinates."
      });

    }


    const location = {

      username:
        req.session.user.username,

      mobile,

      latitude,

      longitude,

      accuracy:
        typeof accuracy === "number"
          ? accuracy
          : null,

      updatedAt:
        new Date().toISOString()

    };


    studentLocations.set(
      mobile,
      location
    );


    res.json({

      success: true,

      message:
        "Location updated successfully.",

      updatedAt:
        location.updatedAt

    });

  }
);


// ======================================================
// LEADER: FIND ONE STUDENT
// ======================================================

app.get(
  "/api/location/:mobile",
  requireLeader,
  (req, res) => {

    const mobile =
      req.params.mobile;


    const location =
      studentLocations.get(mobile);


    if (!location) {

      return res.status(404).json({

        success: false,

        message:
          "No active location found for this student."

      });

    }


    res.json({

      success: true,

      student: location

    });

  }
);


// ======================================================
// LEADER: VIEW ALL LOCATIONS
// ======================================================

app.get(
  "/api/locations",
  requireLeader,
  (req, res) => {

    const locations =
      Array.from(
        studentLocations.values()
      );


    res.json({

      success: true,

      count: locations.length,

      locations

    });

  }
);


// ======================================================
// LEADER: STUDENT COUNT
// ======================================================

app.get(
  "/api/leader/stats",
  requireLeader,
  (req, res) => {

    res.json({

      success: true,

      totalStudents:
        students.size,

      activeLocations:
        studentLocations.size,

      totalLeaders:
        5

    });

  }
);


// ======================================================
// STUDENT STOP LOCATION
// ======================================================

app.delete(
  "/api/location",
  requireLogin,
  (req, res) => {

    if (
      req.session.user.role !== "student"
    ) {

      return res.status(403).json({
        success: false,
        message: "Student access required."
      });

    }


    studentLocations.delete(
      req.session.user.mobile
    );


    res.json({

      success: true,

      message:
        "Location sharing session ended."

    });

  }
);


// ======================================================
// HOME PAGE
// ======================================================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );

});


// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
  (err, req, res, next) => {

    console.error(err);

    res.status(500).json({

      success: false,

      message:
        "HITAM server error."

    });

  }
);


// ======================================================
// START
// ======================================================

app.listen(
  PORT,
  () => {

    console.log(
      `HITAM server running on port ${PORT}`
    );

  }
);
