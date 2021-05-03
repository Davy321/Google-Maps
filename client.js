// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
let map, infoWindow;
let currentLocation;

function initMap() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				let temp = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
				let pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				};
				
				map = new google.maps.Map(document.getElementById("map"), {
					center: temp,
					zoom: 13,
				});
				map.setCenter(pos);
				
				const currentLocationMarker = new google.maps.Marker({
					position: pos,
					map: map,
				});
			  
				currentLocation = pos;
				infoWindow = new google.maps.InfoWindow();
				const locationButton = document.createElement("button");
				locationButton.textContent = "Pan to Current Location";
				locationButton.classList.add("custom-map-control-button");
				map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
				locationButton.addEventListener("click", () => {
					centerOnSelf();
				});
				
				let request = {
					location: map.getCenter(),
					radius: '3000',
					type: ['restaurant']
				};

				service = new google.maps.places.PlacesService(map);
				service.nearbySearch(request, callback);
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
    navigator.geolocation.getCurrentPosition(
        (position) => {
			map.setCenter(currentLocation);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
    );
}//centerOnSelf

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
		results.sort(function(a, b) {
			return b.rating - a.rating;
		});
		
		for (let j = 0; j < 3; j++) {
			createMarker(results[j]);
		}//for
  }//if
}//callback

function createMarker(place) {
  let placeLoc = place.geometry.location;
  let marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name,
	icon: "images/yellowmarker.png",
  })
}