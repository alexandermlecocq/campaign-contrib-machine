// Create a starting layer for donations data
var layers = {
  donations_sumLayer: new L.LayerGroup(),
  donations_medianLayer: new L.LayerGroup(),
  donations_countLayer: new L.LayerGroup(),
  DEM_quartileLayer: new L.LayerGroup(),
  DEM_differenceLayer : new L.LayerGroup(),
  REP_quartileLayer: new L.LayerGroup(),
  REP_differenceLayer : new L.LayerGroup()
};

// Creating map object
var map = L.map("map", {
  center: [40.1629, -89.1896],
  zoom: 6,
  layers: [layers.donations_sumLayer]
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
  id: 'mapbox/streets-v11',
  accessToken: "pk.eyJ1Ijoic3Jtb250ZWlybyIsImEiOiJjandyMTJzNjgwMDgyNDNwZDUwNWpkN2NoIn0.rggDqMijR64cH-l9E6JVag"
}).addTo(map);


// Function that will determine the color of a neighborhood based on the borough it belongs to
function chooseColor(indicator, maximum) {
  if (maximum == 'quartile'){
    maximum = 3;
    indicator = 4 - indicator; 
  }
  var H_value = (indicator / maximum)*120;
  return 'hsl(' + H_value + ', 100%, 50%)';
}

// from https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function createPopup(feature, map_variant){
  var popupText = "<strong><a target='_blank' href='/zipcode/" + feature.properties.zipcode + "'>" + feature.properties.zipcode + "</a></strong>" + 
      "<br><br> <strong>Total Donations:</strong> $" + numberWithCommas(feature.properties.donations_sum) +
      "<br> <strong>Median Donation:</strong> $" + numberWithCommas(feature.properties.donations_median) +
      "<br> <strong>Total Donors:</strong> " + numberWithCommas(feature.properties.donations_count);
  if (map_variant == 'actual_DEM_quartile') {
    popupText = popupText + "<br> <strong>Actual Donation Quartile:</strong> " + feature.properties.actual_DEM_quartile
  }
  else if (map_variant == 'difference_DEM'){
    popupText = popupText + "<br> <strong>Actual Donation Quartile:</strong> " + feature.properties.actual_DEM_quartile + 
                            "<br> <strong>Predicted Donation Quartile:</strong> " + feature.properties.predicted_DEM_quartile
  }
  else if (map_variant == 'actual_REP_quartile'){
    popupText = popupText + "<br> <strong>Actual Donation Quartile:</strong> " + feature.properties.actual_REP_quartile
  }
  else if (map_variant == 'difference_REP'){
    popupText = popupText + "<br> <strong>Actual Donation Quartile:</strong> " + feature.properties.actual_REP_quartile + 
                            "<br> <strong>Predicted Donation Quartile:</strong> " + feature.properties.predicted_REP_quartile
  }
  return popupText;
}

function addGeoJson(data, map_variant, maximum, layer){
  L.geoJson(data, {
    // Style each feature (in this case a neighborhood)
    style: function(feature) {
      return {
        color: chooseColor(feature.properties[map_variant], maximum),
        fillOpacity: 0.5,
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
            fillOpacity: 0.8
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
      layer.bindPopup(createPopup(feature, map_variant));
    }
  }).addTo(layer);
};

function generateMap (party) {
  // Grabbing our GeoJSON data.
  d3.json("/api/donations/" + party, function(data) {      
    // Creating a geoJSON layer with the retrieved data
    layers.donations_sumLayer.clearLayers();
    addGeoJson(data, 'donations_sum', data.maximums['donations_sum'], layers.donations_sumLayer);
    layers.donations_medianLayer.clearLayers();
    addGeoJson(data, 'donations_median', data.maximums['donations_median'], layers.donations_medianLayer);
    layers.donations_countLayer.clearLayers();
    addGeoJson(data, 'donations_count', data.maximums['donations_count'], layers.donations_countLayer);
    
    if (party == 'DEM') {
      var baseMaps = {
        "Total Donations": layers.donations_sumLayer,
        'Median Donation': layers.donations_medianLayer,
        'Total Donors': layers.donations_countLayer,
        'Donations Quartile' : layers.DEM_quartileLayer,
        'Potential Priority Districts': layers.DEM_differenceLayer
      };
      layers.DEM_quartileLayer.clearLayers();
      addGeoJson(data, 'actual_DEM_quartile', 'quartile', layers.DEM_quartileLayer);
      layers.DEM_differenceLayer.clearLayers();
      addGeoJson(data, 'difference_DEM', 6, layers.DEM_differenceLayer);
      controller.removeFrom(map);
      controller = L.control.layers(baseMaps, null).addTo(map);
    }
    else if (party == 'REP'){
      var baseMaps = {
        "Total Donations": layers.donations_sumLayer,
        'Median Donation': layers.donations_medianLayer,
        'Total Donors': layers.donations_countLayer,
        'Donations Quartile (REP)' : layers.REP_quartileLayer,
        'Potential Priority Districts (REP)': layers.REP_differenceLayer
      };
      layers.REP_quartileLayer.clearLayers();
      addGeoJson(data, 'actual_DEM_quartile', 'quartile', layers.REP_quartileLayer);
      layers.REP_differenceLayer.clearLayers();
      addGeoJson(data, 'difference_REP', 6, layers.REP_differenceLayer);
      controller.removeFrom(map);
      controller = L.control.layers(baseMaps, null).addTo(map);
    }
    else {
      var baseMaps = {
        "Total Donations": layers.donations_sumLayer,
        'Median Donation': layers.donations_medianLayer,
        'Total Donors': layers.donations_countLayer
      };
      controller = L.control.layers(baseMaps, null).addTo(map);
    }
    console.log('map updated');
  }); 
};

      
 // PARTY SELECTOR 

function init() {
  console.log('running init');
  // Grab a reference to the dropdown select element
  // Use the list of sample names to populate the select options
  d3.json('/api/parties/', function(data) {
    console.log(data.parties);     
    var partyArray = data.parties;
    var stateArray = ["Illinois"]

    d3.select("#selectParty")
      .selectAll("option")
      .data(partyArray)
      .enter()
      .append("option")
      .text(function(d) {
        return d;
      })
      .property("value", function(d) {
        return d;
      });

    d3.select("#selectState")
      .selectAll("option")
      .data(stateArray)
      .enter()
      .append("option")
      .text(function(d) {
        return d;
      })
      .property("value", function(d) {
        return d;
      });
  });
  d3.json('/api/zipcodes/', function(features) {
    d3.select("#selectZipcode")
      .selectAll("option")
      .data(features.zipcodes)
      .enter()
      .append("option")
      .text(function(d) {
        return d;
      })
      .property("value", function(d) {
        return d;
      });
  
  });
  generateMap('TOTAL');
};

function optionChanged(party) {
  // Fetch new data each time a new sample is selected
  // buildMap(party);
  console.log('optionChanged');
  console.log(party);
  generateMap(party, 'donations_sum');
}

// Initialize the dashboard
init();
