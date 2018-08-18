var map, places, placeDetail,
	iw;
var markers = [];
var searchTimeout;
var centerMarker;
var autocomplete;
var journeyCountValue = 0;
var hostnameRegexp = new RegExp('^https?://.+?/');
var myLatLng;
var placeInfo = [];
var journey = [];
var journeyCount = document.getElementById('journeyCount');
var placeDetailReviews = document.getElementById('placeDetailReviews');


var styles = [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "color": "#fc6e6e"
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "hue": "#008aff"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#bee0ee"
            },
            {
                "visibility": "on"
            }
        ]
    }
]

function initialize() {
	clearResults();
	clearMarkers();
	var directionsService = new google.maps.DirectionsService;
	var directionsDisplay = new google.maps.DirectionsRenderer;
	myLatLng = new google.maps.LatLng(52.6313, 1.2907);
	var myOptions = {
		zoom: 17,
		center: myLatLng,
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		styles: styles

	}
	map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
	directionsDisplay.setMap(map);
	var input = document.getElementById('autocomplete');
	var autocomplete = new google.maps.places.Autocomplete(input);
	autocomplete.bindTo('bounds', map);
	autocomplete.addListener('place_changed', function () {
		clearResults();
		clearMarkers();
		var place = autocomplete.getPlace();
		myLatLng = place.geometry.location;
		if (!place.geometry) {
			// User entered the name of a Place that was not suggested and
			// pressed the Enter key, or the Place Details request failed.
			window.alert("No details available for input: '" + place.name + "'");
			return;
		}
		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(15); // Why 17? Because it looks good.
		}
		search();
	});

	document.getElementById('searchForm').addEventListener('submit', formStop, false);

	function formStop(e) {
		e.preventDefault();
		// do stuff
	}

	document.getElementById('myLocationBtn').addEventListener('click', function () {
		getLocation();
	});

	function getLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showPosition);
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}

	function showPosition(position) {
		console.log(position.coords);
	}
	document.getElementById('clearJourney').addEventListener('click', function () {
		journey = [];
		$('#routeBtn').prop('disabled',true);
		$('#pills-route-tab').prop('hidden',true);
		$('#pills-map-tab').trigger('click');
		updateJourneyList();
		directionsDisplay.setMap(null);
		// directionsDisplay.setMap(map);
		clearMarkers();
		clearResults();
		search();
	});

	document.getElementById('routeBtn').addEventListener('click', function () {
		$('#pills-route-tab').prop('hidden',false);
		$('#pills-map-tab').trigger('click');
		
		directionsDisplay.setMap(map);
		directionsDisplay.setPanel(document.getElementById('infoCard'));
		if (iw) {
			iw.close();
			iw = null;
		}
		var waypts = [];

		for (var i = 0; i < journey.length; i++) {
			waypts.push({
				location: journey[i].geometry.location,
				stopover: true
			});
			//console.log(journey[i].geometry.location);
		}


		directionsService.route({
			origin: myLatLng,
			destination: myLatLng,
			waypoints: waypts,
			optimizeWaypoints: true,
			travelMode: 'WALKING'
		  }, function(response, status) {
			if (status === 'OK') {
			  directionsDisplay.setDirections(response);
			
								
			} else {
			  window.alert('Directions request failed due to ' + status);
			}
		   
		  });


		  $('#routeBtn').trigger('click');



	});


	places = new google.maps.places.PlacesService(map);
	google.maps.event.addListener(map, 'tilesloaded', tilesLoaded);
}


function tilesLoaded() {
	search();
	google.maps.event.clearListeners(map, 'tilesloaded');
	google.maps.event.addListener(map, 'dragend', search);
}

function search() {
	clearResults();
	clearMarkers();
	if (searchTimeout) {
		window.clearTimeout(searchTimeout);
	}
	searchTimeout = window.setTimeout(reallyDoSearch, 500);
}

function reallyDoSearch() {
	var type = "bar";
	var keyword = "";
	var rankBy = "distance";
	var search = {};
	if (keyword) {
		search.keyword = keyword;
	}
	if (type != 'establishment') {
		search.types = [type];
	}
	if (rankBy == 'distance' && (search.types || search.keyword)) {
		search.rankBy = google.maps.places.RankBy.DISTANCE;
		search.location = map.getCenter();
		var centerMarker = new mapIcons.Marker({
			map: map,
			position: myLatLng,
			icon: {
				path: mapIcons.shapes.MAP_PIN,
				fillColor: '#28a745',
				fillOpacity: 1,
				strokeColor: '',
				strokeWeight: 0
			},
			map_icon_label: '<span class="map-icon map-icon-postal-code-prefix"></span>'
		});
		centerMarker.tooltipContent = document.getElementById("autocomplete").value;
		google.maps.event.addListener(centerMarker, 'mouseover', function () {
			var point = fromLatLngToPoint(centerMarker.getPosition(), map);
			$('#marker-tooltip').html(centerMarker.tooltipContent).css({
				'left': point.x - 75,
				'top': point.y - 130
			}).show();
		});
		google.maps.event.addListener(centerMarker, 'mouseout', function () {
			$('#marker-tooltip').hide();
		});
	} else {
		search.bounds = map.getBounds();
	}

	function fromLatLngToPoint(latLng, map) {
		var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = Math.pow(2, map.getZoom());
		var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
		return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
	}
	places.search(search, function (results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < 10; i++) { //dddd
				var distance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(myLatLng, results[i].geometry.location));
				placeInfo.push(results[i]);
				markers.push(new mapIcons.Marker({
					position: results[i].geometry.location,
					animation: google.maps.Animation.DROP,
					icon: {
						path: mapIcons.shapes.MAP_PIN,
						fillColor: '#6c757d',
						fillOpacity: 0.8,
						strokeColor: '',
						strokeWeight: 0
					},
					map_icon_label: '<span class="map-icon map-icon-bar"></span>'
				}));
				google.maps.event.addListener(markers[i], 'click', getDetails(results[i], i));
				window.setTimeout(dropMarker(i), i * 100);

				addResult(results[i], i, distance);
			}
		}
	});
}

function clearMarkers() {
	placeInfo = [];
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
	if (centerMarker) {
		centerMarker.setMap(null);
	}
}

function dropMarker(i) {
	return function () {
		if (markers[i]) {
			markers[i].setMap(map);
		}
	}
}

function addResult(result, i, distance) {
	places.getDetails({
		reference: result.reference
	}, getData(i, distance));

}

function getData(i, distance) {
	return function (place, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			showData(place, i, distance);
		}
	}
}

function showData(place, i, distance) {
	var resultsHTML = document.getElementById('results');

	var listingInfo = {
		addButton: "<button class='btn btn-block active btn-lg btn-dark' onClick='addToRoute(" + i + ");'><span class='fa fa-map-signs'></span> Add " + place.name + "</button>",
		placeRating: getRating(place),
		placePhone: getPhone(place),
		placeWebsite: getWebsite(place),
		placeReviews: getReviews(place),
		placeHours: getHours(place),
		placeVicinity: place.vicinity,
		placeObj: place,
		distance: distance,
		placeId: i


	};

	var listingHTML = getPlaceListing(listingInfo);


	resultsHTML.innerHTML += listingHTML;



	//console.log(distance);

	function getPhoto(imgUrl, w, h) {
		return imgUrl.getUrl({
			'maxWidth': w,
			'maxHeight': h
		});
	}
}

function getHours(place) {

	var content = "";

	if (place.opening_hours) {
		for (var j = 0; j < place.opening_hours.weekday_text.length; j++) {
			content += `<div>` + place.opening_hours.weekday_text[j] + `</div>`;
		}
	} else {
		content = "<div>No Opening Hours Info</div>";
	}
	return content;
}

function getRating(place) {
	var ratingText = "";
	if (place.rating) {
		for (var i = 0; i < 5; i++) {
			if (place.rating < (i + 0.5)) {
				ratingText += '&#10025;';
			} else {
				ratingText += '&#10029;';
			}
		}
	}
	return ratingText;
}

function getPhone(place) {
	if (place.international_phone_number) {
		var placeTel = place.international_phone_number;
	} else {
		placeTel = "";
	}
	return placeTel;
}

function getWebsite(place) {
	var website = place.website;
	if (!website) {
		website = "";
	} else {
		website = `<a href="` + website + `" target="_blank">View Website <i class="fa fa-external-link-square-alt"></i></a>`;
	}
	return website;
}

function getReviews(place) {
	var reviews = place.reviews;
	var reviewText = "";

	reviewText += `<div class="reviewSection">
    <ul class="list-unstyled">`;
	if (reviews.length > 0) {
		for (i = 0; i < reviews.length; i++) {
			ratingHtml = '';
			for (var j = 0; j < 5; j++) {
				if (reviews[i].rating < (j + 0.5)) {
					ratingHtml += '&#10025;';
				} else {
					ratingHtml += '&#10029;';
				}
			}
			reviewText += `
                <li class="media">
                    <img class="mr-3" src="` + place.reviews[i].profile_photo_url + `" width="32px" height="32px" alt="">
                <div class="media-body">
                    <h5 class="mt-0 mb-1">` + place.reviews[i].author_name + ` <span class="badge badge-secondary">` + ratingHtml + `</span></h5>
                    ` + place.reviews[i].text + `
                    <p class="text-right"> <small><i>` + place.reviews[i].relative_time_description + `</i></small></p>
                </div>
                </li><hr>
            `;
		}
	} else {
		reviewText = "No Reviews";
	}
	return reviewText;
}

function getPlaceListing(x) {
	var listingHTML;
	var listingClass;
	if (x.placeId % 2 == 0) {
		listingClass = "#607d8b";
	} else {
		listingClass = "#b0bec5";
	}
	//console.log(listingClass);

	listingHTML = `
<div class="card" style="background: ` + listingClass + `">
	<div class="card-body">
		<div class="row">

			<div class="col-md">
				<div class="card card200">
				<div class="card-header bg-light"><h4><strong>` + x.placeObj.name + ` <span class="badge">` + x.placeRating + `</span></strong></h4></div>
					<div class="card-body">
					<h6><i class="fa fa-address-book"></i> ` + x.placeVicinity + `</h6>
					<h6><i class="fa fa-phone"></i> ` + x.placePhone + `</h6>
					<h6><i class="fa fa-link"></i> ` + x.placeWebsite + `</h6>
					<hr>
					` + x.addButton + `
					</div>
				</div>
			</div>

			<div class="col-md">
				<div class="card card200">
				<div class="card-header bg-light"><h4>Opening Hours</h4></div>
					<div class="card-body">
					` + x.placeHours + `
					</div>
				</div>
				</div>
	
		<div class="col-md">
			<div class="card card200">
			<div class="card-header bg-light"><h4>Reviews</h4></div>
				<div class="card-body">
				` + x.placeReviews + `
				</div>
			</div>
		</div>
		
		</div>
	</div>	
</div><br>`;



	return listingHTML;
}



function clearResults() {
	var results = document.getElementById('results');
	while (results.childNodes[0]) {
		results.removeChild(results.childNodes[0]);
	}
}


function getDetails(result, i) {
	return function () {
		places.getDetails({
			reference: result.reference
		}, showInfoWindow(i));
	}
}


function showInfoWindow(i) {
	return function (place, status) {
		if (iw) {
			iw.close();
			iw = null;
		}
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			iw = new google.maps.InfoWindow({
				content: getIWContent(place, i)
			});
			iw.open(map, markers[i]);

		}
	}
}

function updateJourneyCount() {
	if (journey.length > 0) {
		return journey.length;
	} else {
		return 0;
	}
}

function updateJourneyList() {
	journeyCount.innerHTML = updateJourneyCount();
}

function addToRoute(id) {
	journey.push(placeInfo[id]);
	updateJourneyList();
	showAlertBar(placeInfo[id].name + " Added!");
	$('#routeBtn').prop('disabled',false);
}

function getIWContent(place, i) {
	//var content;
	//content += "<h4>"+place.name+"</h4>";


	var content = "<h6><strong>" + place.name + "</strong></h6><div class='text-center'><button class='btn btn-sm btn-block active btn-dark' onClick='addToRoute(" + i + ");'>Add to Route</button></div>";
	//place.name;


	return content;
}


initialize();