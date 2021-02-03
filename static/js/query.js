// Create a starting layer for donations data
var layer = new L.LayerGroup();

// Creating map object
var map = L.map("map", {
  center: [40.1629, -89.1896],
  zoom: 6,
  layers: [layer]
});
// Adding tile layer
// L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
//   attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//   maxZoom: 18,
//   id: "mapbox.dark",
//   accessToken: "pk.eyJ1Ijoic3Jtb250ZWlybyIsImEiOiJjandyMTJzNjgwMDgyNDNwZDUwNWpkN2NoIn0.rggDqMijR64cH-l9E6JVag"
// }).addTo(map);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: 'mapbox/dark-v10',
  accessToken: "pk.eyJ1Ijoic3Jtb250ZWlybyIsImEiOiJjandyMTJzNjgwMDgyNDNwZDUwNWpkN2NoIn0.rggDqMijR64cH-l9E6JVag"
}).addTo(map);

// from https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function addGeoJson(data, layer){
  L.geoJson(data, {
    // Style each feature (in this case a neighborhood)
    style: function(feature) {
      return {
        color: "blue",
        fillOpacity: 0.3,
        weight: 1
      };
    },
    // Called on each feature
    onEachFeature: function(feature, layer) {
      // Set mouse events to change map styling
      layer.on({
        // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to full so that it stands out
        mouseover: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.5
          });
        },
        // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to its original value
        mouseout: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.3
          });
        }
      });
      // Giving each feature a pop-up with information pertinent to it
      layer.bindPopup("<strong><a target='_blank' href='/zipcode/" + feature.properties.zipcode + "'>" + feature.properties.zipcode + "</a></strong>" + 
      "<br><br> <strong>Total Donations:</strong> $" + numberWithCommas(feature.properties.donations_sum) +
      "<br> <strong>Median Donation:</strong> $" + numberWithCommas(feature.properties.donations_median) +
      "<br> <strong>Total Donors:</strong> " + numberWithCommas(feature.properties.donations_count));
    }
  }).addTo(layer);
  map.fitBounds(L.geoJson(data).getBounds());
};
      
 // PARTY SELECTOR 

function init() {
  var zipcode = d3.select("#zipcode").text()
  d3.json("/api/zipcode_geo/" + zipcode, function(data) {
    // Creating a geoJSON layer with the retrieved data
    addGeoJson(data, layer); 
  });
};

// Initialize the dashboard
init();
