//query URL
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features);
  const magnitudeArr = data.features.map(item =>item.properties.mag);
  console.log(magnitudeArr);
});

function createFeatures(earthquakeData) {

// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + feature.properties.mag + "</p>");    
  }

  function markerSize(magnitude) {
    return magnitude*20000
  }

  function getColor(magnitude) {
    if(magnitude <= 1){
      return 'green'
    }
    if(magnitude > 1 && magnitude<= 2){
      return 'yellow'
    }
    if(magnitude > 2){
      return 'orange'
    }
  }

// Create a GeoJSON layer containing the features array on the earthquakeData object
// Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: (feature, latlng) => {
                  return new L.Circle(latlng, {radius: markerSize(feature.properties.mag), 
                    fillOpacity: 1, 
                    color: getColor(feature.properties.mag), 
                    fillColor: getColor(feature.properties.mag), 
                    weight: 1});
  },
  onEachFeature : onEachFeature
});

// Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
  }

//--------------------//


  
  function createMap(earthquakes) {
    // Define darkmap layers
 
  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });



  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Dark Map": darkmap,
    "Street Map": streetmap,
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [streetmap, earthquakes]
  });

// Create a layer control
// Pass in our baseMaps and overlayMaps
// Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

//Adding legend------------------------------

var legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var limits = ["<=1","1-2",">2"];
  var colors = ['green','yellow','orange'];
  var labels = [];

  // Add min & max
  var legendInfo = "<h1>Magnitude</h1>" +
    "<div class=\"labels\">" +
      "<div class=\"min\">" + limits[0] + "</div>" +
      "<div class=\"min\">" + limits[1] + "</div>" +
      "<div class=\"max\">" + limits[2] + "</div>" +
    "</div>";

  div.innerHTML = legendInfo;

  limits.forEach(function(limit, index) {
    labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
  });

  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  return div;
};
legend.addTo(myMap);
  
}
