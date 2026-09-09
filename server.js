const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(express.json());

app.use(express.static(
  path.join(__dirname, "public")
));


// --------------------------------------------------
// TEMPORARY LOCATION STORAGE
// --------------------------------------------------
// This stores only the latest location while the
// server is running.
//
// Later we will replace this with a real database.

const studentLocations = new Map();


// --------------------------------------------------
// BASIC STATUS
// --------------------------------------------------

app.get("/api/status", (req, res) => {

  res.json({
    success: true,
    website: "HITAM",
    server: "online",
    studentsWithLocation: studentLocations.size
  });

});


// --------------------------------------------------
// STUDENT SENDS LOCATION
// --------------------------------------------------

app.post("/api/location", (req, res) => {

  try {

    const {
      username,
      mobile,
      latitude,
      longitude,
      accuracy
    } = req.body;


    // Validate required information

    if (
      !username ||
      !mobile ||
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid location information."
      });

    }


    // Validate GPS range

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


    const student = {

      username,
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


    // Save latest location

    studentLocations.set(
      mobile,
      student
    );


    console.log(
      `Location received: ${username} (${mobile})`
    );


    res.json({

      success: true,

      message:
        "Location received successfully.",

      updatedAt:
        student.updatedAt

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Unable to save location."

    });

  }

});


// --------------------------------------------------
// LEADER GETS ONE STUDENT LOCATION
// --------------------------------------------------

app.get(
  "/api/location/:mobile",
  (req, res) => {

    const mobile =
      req.params.mobile;


    const student =
      studentLocations.get(mobile);


    if (!student) {

      return res.status(404).json({

        success: false,

        message:
          "No active location found for this student."

      });

    }


    res.json({

      success: true,

      student

    });

  }
);


// --------------------------------------------------
// LEADER GETS ALL ACTIVE STUDENT LOCATIONS
// --------------------------------------------------

app.get("/api/locations", (req, res) => {

  const locations =
    Array.from(
      studentLocations.values()
    );


  res.json({

    success: true,

    count: locations.length,

    locations

  });

});


// --------------------------------------------------
// REMOVE A STUDENT LOCATION
// --------------------------------------------------
// This will be used when the student's location
// sharing session ends.

app.delete(
  "/api/location/:mobile",
  (req, res) => {

    const mobile =
      req.params.mobile;


    const deleted =
      studentLocations.delete(mobile);


    res.json({

      success: true,

      deleted

    });

  }
);


// --------------------------------------------------
// HOME PAGE
// --------------------------------------------------

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );

});


// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

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


// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(
  PORT,
  () => {

    console.log(
      `HITAM server running on port ${PORT}`
    );

  }
);
