if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
let map, infoWindow;
let currentLocation;
let markersArray = [];
let placeArray = [];
let infoWindowFood;
let rad = 3000;
let transportMethod;
let tmp;

let directionsService;
let directionsRenderer;

function initMap() {
  infoWindowFood = new google.maps.InfoWindow();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        document.getElementById("lightbox").style.display = "none";
        let temp = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        let pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        map = new google.maps.Map(document.getElementById("map"), {
          center: temp,
          zoom: 13
        });
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer();
        map.setCenter(pos);

        let currentLocationMarker = new google.maps.Marker({
          position: pos,
          map: map
        });
        markersArray.push(currentLocationMarker);
        currentLocation = pos;
        infoWindow = new google.maps.InfoWindow();
        const locationButton = document.createElement("button");
        locationButton.textContent = "Pan to Current Location";
        locationButton.classList.add("custom-map-control-button");
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(
          locationButton
        );
        locationButton.addEventListener("click", () => {
          centerOnSelf();
        });
        document.getElementById("map").style.margin = "20px auto 0 auto";

        findNearbyPlaces();
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

function centerOnSelf() {
  map.setCenter(currentLocation);
  let currentLocationMarker = new google.maps.Marker({
    position: currentLocation,
    map: map
  });
  markersArray.push(currentLocationMarker);
} //centerOnSelf

function findNearbyPlaces() {
  let request = {
    location: map.getCenter(),
    radius: rad,
    type: ["restaurant"]
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    results.sort(function(a, b) {
      return b.rating - a.rating;
    });

    for (let j = 0; j < 3; j++) {
      createMarker(results[j]);
    } //for
  } //if
} //callback

function createMarker(place) {
  placeArray.push(place);
  let marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name,
    icon: "images/yellowmarker.png"
  });

  google.maps.event.addListener(marker, "click", () => {
    let contentString =
      "<h3>" + place.name + "</h3>" +
      "Rating: <b>" + place.rating + " / 5 </b><p>" + place.vicinity + "</p>" +
      '<button class="dButton" onclick="getDirections(\'' + place.name + '\')">Directions</button> ' + 
      '<label for="transportMethod">Transport Method: </label>' +
      '<select id="transportMethod" name="transportMethod" onchange="getTransportMethod();">' +
      '<option value="DRIVING">Driving</option>' +
      '<option value="BICYCLING">Biking</option>' +
      '<option value="TRANSIT">Transit</option>' +
      '<option value="WALKING">Walking</option>' +
      '</select>';

    infoWindowFood.setContent(contentString);
    infoWindowFood.open(map, marker);
  });
  markersArray.push(marker);
}

function clearOverlays() {
  for (let i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
}

let DSlider = document.getElementById("myRange");
let DSliderOutput = document.getElementById("distanceSliderSpan");
DSliderOutput.innerHTML = DSlider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
DSlider.oninput = function() {
  directionsRenderer.set('directions', null);
  
  DSliderOutput.innerHTML = this.value;
  rad = this.value * 1000;
  clearOverlays();
  findNearbyPlaces();
  let currentLocationMarker = new google.maps.Marker({
    position: currentLocation,
    map: map
  });
  markersArray.push(currentLocationMarker);
};

// Update the current slider value (each time you drag the slider handle)
function getTransportMethod() {
  let elem = document.getElementById("transportMethod");
  transportMethod = elem.value;
}//transportMethod

function getDirections(name) {
  
  let place;
  for (let i = 0; i < placeArray.length; i++) {
    if (placeArray[i].name == name) {
      place = placeArray[i];
      break;
    }
  }
  
  directionsService.route(
    {
      origin: currentLocation,
      destination: place.geometry.location,
      travelMode: transportMethod,
    },
    (response, status) => {
      if (status === "OK") {
        infoWindowFood.close();
        directionsRenderer.setDirections(response);
        directionsRenderer.setMap(map);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
} // getDirections
