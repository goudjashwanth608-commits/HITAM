// ======================================================
// HITAM STUDENT LOCATION TRACKING
// ======================================================

let locationWatchId = null;


// Start sharing the student's current location
function startStudentLocationTracking() {

  if (!navigator.geolocation) {
    alert("Location services are not supported on this phone.");
    return;
  }

  if (!currentUser || !currentUser.mobile) {
    alert("Please login with your mobile number first.");
    return;
  }

  // Ask the phone for location permission
  navigator.geolocation.getCurrentPosition(

    function(position) {

      sendStudentLocation(position);

      // Continue updating the location
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


// Send GPS location to HITAM server
async function sendStudentLocation(position) {

  if (!currentUser) return;

  const locationData = {

    username: currentUser.username,

    mobile: currentUser.mobile,

    latitude: position.coords.latitude,

    longitude: position.coords.longitude,

    accuracy: position.coords.accuracy

  };


  try {

    const response =
      await fetch("/api/location", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(locationData)

      });


    const result =
      await response.json();


    if (result.success) {

      console.log(
        "HITAM location updated:",
        position.coords.latitude,
        position.coords.longitude
      );

    }

  } catch (error) {

    console.error(
      "Location upload failed:",
      error
    );

  }

}


// Location error
function locationError(error) {

  console.error(
    "Location error:",
    error
  );


  if (error.code === 1) {

    alert(
      "HITAM needs location permission to continue."
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


// Stop location tracking
function stopStudentLocationTracking() {

  if (locationWatchId !== null) {

    navigator.geolocation.clearWatch(
      locationWatchId
    );

    locationWatchId = null;

  }

}
