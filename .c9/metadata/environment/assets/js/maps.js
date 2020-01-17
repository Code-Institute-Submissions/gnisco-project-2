{"changed":true,"filter":false,"title":"maps.js","tooltip":"/assets/js/maps.js","value":"const mapStyle = [{\n  'featureType': 'administrative',\n  'elementType': 'all',\n  'stylers': [{\n    'visibility': 'on',\n  },\n  {\n    'lightness': 33,\n  },\n  ],\n},\n{\n  'featureType': 'landscape',\n  'elementType': 'all',\n  'stylers': [{\n    'color': '#f2e5d4',\n  }],\n},\n{\n  'featureType': 'poi.park',\n  'elementType': 'geometry',\n  'stylers': [{\n    'color': '#c5dac6',\n  }],\n},\n{\n  'featureType': 'poi.park',\n  'elementType': 'labels',\n  'stylers': [{\n    'visibility': 'on',\n  },\n  {\n    'lightness': 20,\n  },\n  ],\n},\n{\n  'featureType': 'road',\n  'elementType': 'all',\n  'stylers': [{\n    'lightness': 20,\n  }],\n},\n{\n  'featureType': 'road.highway',\n  'elementType': 'geometry',\n  'stylers': [{\n    'color': '#c5c6c6',\n  }],\n},\n{\n  'featureType': 'road.arterial',\n  'elementType': 'geometry',\n  'stylers': [{\n    'color': '#e4d7c6',\n  }],\n},\n{\n  'featureType': 'road.local',\n  'elementType': 'geometry',\n  'stylers': [{\n    'color': '#fbfaf7',\n  }],\n},\n{\n  'featureType': 'water',\n  'elementType': 'all',\n  'stylers': [{\n    'visibility': 'on',\n  },\n  {\n    'color': '#acbcc9',\n  },\n  ],\n},\n];\n\n// Escapes HTML characters in a template literal string, to prevent XSS.\n// See https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content\nfunction sanitizeHTML(strings) {\n  const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', '\\'': '&#39;'};\n  let result = strings[0];\n  for (let i = 1; i < arguments.length; i++) {\n    result += String(arguments[i]).replace(/[&<>'\"]/g, (char) => {\n      return entities[char];\n    });\n    result += strings[i];\n  }\n  return result;\n}\n\n/**\n * Initialize the Google Map.\n */\nfunction initMap() {\n  // Create the map.\n  const map = new google.maps.Map(document.getElementById('map'), {\n    zoom: 7,\n    center: {lat: 52.632469, lng: -1.689423},\n    styles: mapStyle,\n  });\n\n  // Load the stores GeoJSON onto the map.\n  map.data.loadGeoJson('assets/js/stores.json', {idPropertyName: 'storeid'});\n\n  // Define the custom marker icons, using the store's \"category\".\n  map.data.setStyle((feature) => {\n    return {\n      icon: {\n        url: `assets/images/car-list/model-s.jpg`,\n        scaledSize: new google.maps.Size(64, 64),\n      },\n    };\n  });\n\n  const apiKey = 'AIzaSyAqthnqqZil9T4Tpz-2y9S13JjASnjjHPg';\n  const infoWindow = new google.maps.InfoWindow();\n\n  // Show the information for a store when its marker is clicked.\n  map.data.addListener('click', (event) => {\n    const category = event.feature.getProperty('make');\n    const name = event.feature.getProperty('name');\n    const phone = event.feature.getProperty('phone');\n    const position = event.feature.getGeometry().get();\n    const content = sanitizeHTML`\n      <img style=\"float:left; width:200px; margin-top:30px\" src=\"assets/images/car-list/model-s.jpg\">\n      <div style=\"margin-left:220px; margin-bottom:20px;\">\n        <h2>${name}</h2><p>${description}</p>\n        <p><b>Open:</b> ${hours}<br/><b>Phone:</b> ${phone}</p>\n        <p><img src=\"https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}\"></p>\n      </div>\n      `;\n\n    infoWindow.setContent(content);\n    infoWindow.setPosition(position);\n    infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});\n    infoWindow.open(map);\n  });\n\n  // Build and add the search bar\n  const card = document.createElement('div');\n  const titleBar = document.createElement('div');\n  const title = document.createElement('div');\n  const container = document.createElement('div');\n  const input = document.createElement('input');\n  const options = {\n    types: ['address'],\n    componentRestrictions: {country: 'gb'},\n  };\n\n  card.setAttribute('id', 'pac-card');\n  title.setAttribute('id', 'title');\n  title.textContent = 'Find the nearest store';\n  titleBar.appendChild(title);\n  container.setAttribute('id', 'pac-container');\n  input.setAttribute('id', 'pac-input');\n  input.setAttribute('type', 'text');\n  input.setAttribute('placeholder', 'Enter an address');\n  container.appendChild(input);\n  card.appendChild(titleBar);\n  card.appendChild(container);\n  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);\n\n  // Make the search bar into a Places Autocomplete search bar and select\n  // which detail fields should be returned about the place that\n  // the user selects from the suggestions.\n  const autocomplete = new google.maps.places.Autocomplete(input, options);\n\n  autocomplete.setFields(\n      ['address_components', 'geometry', 'name']);\n\n  // Set the origin point when the user selects an address\n  const originMarker = new google.maps.Marker({map: map});\n  originMarker.setVisible(false);\n  let originLocation = map.getCenter();\n\n  autocomplete.addListener('place_changed', async () => {\n    originMarker.setVisible(false);\n    originLocation = map.getCenter();\n    const place = autocomplete.getPlace();\n\n    if (!place.geometry) {\n      // User entered the name of a Place that was not suggested and\n      // pressed the Enter key, or the Place Details request failed.\n      window.alert('No address available for input: \\'' + place.name + '\\'');\n      return;\n    }\n\n    // Recenter the map to the selected address\n    originLocation = place.geometry.location;\n    map.setCenter(originLocation);\n    map.setZoom(9);\n    console.log(place);\n\n    originMarker.setPosition(originLocation);\n    originMarker.setVisible(true);\n\n    // Use the selected address as the origin to calculate distances\n    // to each of the store locations\n    const rankedStores = await calculateDistances(map.data, originLocation);\n    showStoresList(map.data, rankedStores);\n\n    return;\n  });\n}\n\n/**\n * Use Distance Matrix API to calculate distance from origin to each store.\n * @param {google.maps.Data} data The geospatial data object layer for the map\n * @param {google.maps.LatLng} origin Geographical coordinates in latitude\n * and longitude\n * @return {Promise<object[]>} n Promise fulfilled by an array of objects with\n * a distanceText, distanceVal, and storeid property, sorted ascending\n * by distanceVal.\n */\nasync function calculateDistances(data, origin) {\n  const stores = [];\n  const destinations = [];\n\n  // Build parallel arrays for the store IDs and destinations\n  data.forEach((store) => {\n    const storeNum = store.getProperty('storeid');\n    const storeLoc = store.getGeometry().get();\n\n    stores.push(storeNum);\n    destinations.push(storeLoc);\n  });\n\n  // Retrieve the distances of each store from the origin\n  // The returned list will be in the same order as the destinations list\n  const service = new google.maps.DistanceMatrixService();\n  const getDistanceMatrix =\n    (service, parameters) => new Promise((resolve, reject) => {\n      service.getDistanceMatrix(parameters, (response, status) => {\n        if (status != google.maps.DistanceMatrixStatus.OK) {\n          reject(response);\n        } else {\n          const distances = [];\n          const results = response.rows[0].elements;\n          for (let j = 0; j < results.length; j++) {\n            const element = results[j];\n            const distanceText = element.distance.text;\n            const distanceVal = element.distance.value;\n            const distanceObject = {\n              storeid: stores[j],\n              distanceText: distanceText,\n              distanceVal: distanceVal,\n            };\n            distances.push(distanceObject);\n          }\n\n          resolve(distances);\n        }\n      });\n    });\n\n  const distancesList = await getDistanceMatrix(service, {\n    origins: [origin],\n    destinations: destinations,\n    travelMode: 'DRIVING',\n    unitSystem: google.maps.UnitSystem.METRIC,\n  });\n\n  distancesList.sort((first, second) => {\n    return first.distanceVal - second.distanceVal;\n  });\n\n  return distancesList;\n}\n\n/**\n * Build the content of the side panel from the sorted list of stores\n * and display it.\n * @param {google.maps.Data} data The geospatial data object layer for the map\n * @param {object[]} stores An array of objects with a distanceText,\n * distanceVal, and storeid property.\n */\nfunction showStoresList(data, stores) {\n  if (stores.length == 0) {\n    console.log('empty stores');\n    return;\n  }\n\n  let panel = document.createElement('div');\n  // If the panel already exists, use it. Else, create it and add to the page.\n  if (document.getElementById('panel')) {\n    panel = document.getElementById('panel');\n    // If panel is already open, close it\n    if (panel.classList.contains('open')) {\n      panel.classList.remove('open');\n    }\n  } else {\n    panel.setAttribute('id', 'panel');\n    const body = document.body;\n    body.insertBefore(panel, body.childNodes[0]);\n  }\n\n\n  // Clear the previous details\n  while (panel.lastChild) {\n    panel.removeChild(panel.lastChild);\n  }\n\n  stores.forEach((store) => {\n    // Add store details with text formatting\n    const name = document.createElement('p');\n    name.classList.add('place');\n    const currentStore = data.getFeatureById(store.storeid);\n    name.textContent = currentStore.getProperty('name');\n    panel.appendChild(name);\n    const distanceText = document.createElement('p');\n    distanceText.classList.add('distanceText');\n    distanceText.textContent = store.distanceText;\n    panel.appendChild(distanceText);\n  });\n\n  // Open the panel\n  panel.classList.add('open');\n\n  return;\n}\n","undoManager":{"mark":22,"position":24,"stack":[[{"start":{"row":1,"column":62},"end":{"row":1,"column":63},"action":"remove","lines":["e"],"id":108},{"start":{"row":1,"column":61},"end":{"row":1,"column":62},"action":"remove","lines":["m"]},{"start":{"row":1,"column":60},"end":{"row":1,"column":61},"action":"remove","lines":["a"]},{"start":{"row":1,"column":59},"end":{"row":1,"column":60},"action":"remove","lines":["N"]},{"start":{"row":1,"column":58},"end":{"row":1,"column":59},"action":"remove","lines":["s"]},{"start":{"row":1,"column":57},"end":{"row":1,"column":58},"action":"remove","lines":["s"]},{"start":{"row":1,"column":56},"end":{"row":1,"column":57},"action":"remove","lines":["a"]},{"start":{"row":1,"column":55},"end":{"row":1,"column":56},"action":"remove","lines":["l"]},{"start":{"row":1,"column":54},"end":{"row":1,"column":55},"action":"remove","lines":["C"]}],[{"start":{"row":1,"column":54},"end":{"row":1,"column":55},"action":"insert","lines":["I"],"id":109},{"start":{"row":1,"column":55},"end":{"row":1,"column":56},"action":"insert","lines":["D"]}],[{"start":{"row":1,"column":55},"end":{"row":1,"column":56},"action":"remove","lines":["D"],"id":110}],[{"start":{"row":1,"column":55},"end":{"row":1,"column":56},"action":"insert","lines":["d"],"id":111}],[{"start":{"row":1,"column":63},"end":{"row":1,"column":65},"action":"insert","lines":["[]"],"id":112}],[{"start":{"row":1,"column":64},"end":{"row":1,"column":65},"action":"insert","lines":["0"],"id":113}],[{"start":{"row":1,"column":51},"end":{"row":1,"column":52},"action":"remove","lines":["s"],"id":114}],[{"start":{"row":1,"column":64},"end":{"row":1,"column":65},"action":"remove","lines":["]"],"id":115}],[{"start":{"row":1,"column":63},"end":{"row":1,"column":64},"action":"remove","lines":["0"],"id":116},{"start":{"row":1,"column":62},"end":{"row":1,"column":63},"action":"remove","lines":["["]}],[{"start":{"row":30,"column":1},"end":{"row":31,"column":0},"action":"insert","lines":["",""],"id":117},{"start":{"row":31,"column":0},"end":{"row":32,"column":0},"action":"insert","lines":["",""]}],[{"start":{"row":0,"column":0},"end":{"row":31,"column":0},"action":"remove","lines":["function initMap() {","  var map = new google.maps.Map(document.getElementById('map'), {","  zoom: 7,","  center: {lat: 52.632469, lng: -1.689423},","  styles: mapStyle","  });","","  map.data.loadGeoJson('stores.json');","  ","  map.data.setStyle(feature => {","    return {","      icon: {","        url: `img/icon_${feature.getProperty('category')}.png`,","        scaledSize: new google.maps.Size(64, 64)","      }","    };","  });","  ","  map.data.addListener('click', event => {","    let category = event.feature.getProperty('category');","    let name = event.feature.getProperty('name');","    let description = event.feature.getProperty('description');","    let hours = event.feature.getProperty('hours');","    let phone = event.feature.getProperty('phone');","    let position = event.feature.getGeometry().get();","    infoWindow.setContent(content);","    infoWindow.setPosition(position);","    infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});","    infoWindow.open(map);","  });","}",""],"id":401},{"start":{"row":0,"column":0},"end":{"row":322,"column":1},"action":"insert","lines":["const mapStyle = [{","  'featureType': 'administrative',","  'elementType': 'all',","  'stylers': [{","    'visibility': 'on',","  },","  {","    'lightness': 33,","  },","  ],","},","{","  'featureType': 'landscape',","  'elementType': 'all',","  'stylers': [{","    'color': '#f2e5d4',","  }],","},","{","  'featureType': 'poi.park',","  'elementType': 'geometry',","  'stylers': [{","    'color': '#c5dac6',","  }],","},","{","  'featureType': 'poi.park',","  'elementType': 'labels',","  'stylers': [{","    'visibility': 'on',","  },","  {","    'lightness': 20,","  },","  ],","},","{","  'featureType': 'road',","  'elementType': 'all',","  'stylers': [{","    'lightness': 20,","  }],","},","{","  'featureType': 'road.highway',","  'elementType': 'geometry',","  'stylers': [{","    'color': '#c5c6c6',","  }],","},","{","  'featureType': 'road.arterial',","  'elementType': 'geometry',","  'stylers': [{","    'color': '#e4d7c6',","  }],","},","{","  'featureType': 'road.local',","  'elementType': 'geometry',","  'stylers': [{","    'color': '#fbfaf7',","  }],","},","{","  'featureType': 'water',","  'elementType': 'all',","  'stylers': [{","    'visibility': 'on',","  },","  {","    'color': '#acbcc9',","  },","  ],","},","];","","// Escapes HTML characters in a template literal string, to prevent XSS.","// See https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content","function sanitizeHTML(strings) {","  const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', '\\'': '&#39;'};","  let result = strings[0];","  for (let i = 1; i < arguments.length; i++) {","    result += String(arguments[i]).replace(/[&<>'\"]/g, (char) => {","      return entities[char];","    });","    result += strings[i];","  }","  return result;","}","","/**"," * Initialize the Google Map."," */","function initMap() {","  // Create the map.","  const map = new google.maps.Map(document.getElementById('map'), {","    zoom: 7,","    center: {lat: 52.632469, lng: -1.689423},","    styles: mapStyle,","  });","","  // Load the stores GeoJSON onto the map.","  map.data.loadGeoJson('stores.json', {idPropertyName: 'storeid'});","","  // Define the custom marker icons, using the store's \"category\".","  map.data.setStyle((feature) => {","    return {","      icon: {","        url: `img/icon_${feature.getProperty('category')}.png`,","        scaledSize: new google.maps.Size(64, 64),","      },","    };","  });","","  const apiKey = 'YOUR_API_KEY';","  const infoWindow = new google.maps.InfoWindow();","","  // Show the information for a store when its marker is clicked.","  map.data.addListener('click', (event) => {","    const category = event.feature.getProperty('category');","    const name = event.feature.getProperty('name');","    const description = event.feature.getProperty('description');","    const hours = event.feature.getProperty('hours');","    const phone = event.feature.getProperty('phone');","    const position = event.feature.getGeometry().get();","    const content = sanitizeHTML`","      <img style=\"float:left; width:200px; margin-top:30px\" src=\"img/logo_${category}.png\">","      <div style=\"margin-left:220px; margin-bottom:20px;\">","        <h2>${name}</h2><p>${description}</p>","        <p><b>Open:</b> ${hours}<br/><b>Phone:</b> ${phone}</p>","        <p><img src=\"https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}\"></p>","      </div>","      `;","","    infoWindow.setContent(content);","    infoWindow.setPosition(position);","    infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});","    infoWindow.open(map);","  });","","  // Build and add the search bar","  const card = document.createElement('div');","  const titleBar = document.createElement('div');","  const title = document.createElement('div');","  const container = document.createElement('div');","  const input = document.createElement('input');","  const options = {","    types: ['address'],","    componentRestrictions: {country: 'gb'},","  };","","  card.setAttribute('id', 'pac-card');","  title.setAttribute('id', 'title');","  title.textContent = 'Find the nearest store';","  titleBar.appendChild(title);","  container.setAttribute('id', 'pac-container');","  input.setAttribute('id', 'pac-input');","  input.setAttribute('type', 'text');","  input.setAttribute('placeholder', 'Enter an address');","  container.appendChild(input);","  card.appendChild(titleBar);","  card.appendChild(container);","  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);","","  // Make the search bar into a Places Autocomplete search bar and select","  // which detail fields should be returned about the place that","  // the user selects from the suggestions.","  const autocomplete = new google.maps.places.Autocomplete(input, options);","","  autocomplete.setFields(","      ['address_components', 'geometry', 'name']);","","  // Set the origin point when the user selects an address","  const originMarker = new google.maps.Marker({map: map});","  originMarker.setVisible(false);","  let originLocation = map.getCenter();","","  autocomplete.addListener('place_changed', async () => {","    originMarker.setVisible(false);","    originLocation = map.getCenter();","    const place = autocomplete.getPlace();","","    if (!place.geometry) {","      // User entered the name of a Place that was not suggested and","      // pressed the Enter key, or the Place Details request failed.","      window.alert('No address available for input: \\'' + place.name + '\\'');","      return;","    }","","    // Recenter the map to the selected address","    originLocation = place.geometry.location;","    map.setCenter(originLocation);","    map.setZoom(9);","    console.log(place);","","    originMarker.setPosition(originLocation);","    originMarker.setVisible(true);","","    // Use the selected address as the origin to calculate distances","    // to each of the store locations","    const rankedStores = await calculateDistances(map.data, originLocation);","    showStoresList(map.data, rankedStores);","","    return;","  });","}","","/**"," * Use Distance Matrix API to calculate distance from origin to each store."," * @param {google.maps.Data} data The geospatial data object layer for the map"," * @param {google.maps.LatLng} origin Geographical coordinates in latitude"," * and longitude"," * @return {Promise<object[]>} n Promise fulfilled by an array of objects with"," * a distanceText, distanceVal, and storeid property, sorted ascending"," * by distanceVal."," */","async function calculateDistances(data, origin) {","  const stores = [];","  const destinations = [];","","  // Build parallel arrays for the store IDs and destinations","  data.forEach((store) => {","    const storeNum = store.getProperty('storeid');","    const storeLoc = store.getGeometry().get();","","    stores.push(storeNum);","    destinations.push(storeLoc);","  });","","  // Retrieve the distances of each store from the origin","  // The returned list will be in the same order as the destinations list","  const service = new google.maps.DistanceMatrixService();","  const getDistanceMatrix =","    (service, parameters) => new Promise((resolve, reject) => {","      service.getDistanceMatrix(parameters, (response, status) => {","        if (status != google.maps.DistanceMatrixStatus.OK) {","          reject(response);","        } else {","          const distances = [];","          const results = response.rows[0].elements;","          for (let j = 0; j < results.length; j++) {","            const element = results[j];","            const distanceText = element.distance.text;","            const distanceVal = element.distance.value;","            const distanceObject = {","              storeid: stores[j],","              distanceText: distanceText,","              distanceVal: distanceVal,","            };","            distances.push(distanceObject);","          }","","          resolve(distances);","        }","      });","    });","","  const distancesList = await getDistanceMatrix(service, {","    origins: [origin],","    destinations: destinations,","    travelMode: 'DRIVING',","    unitSystem: google.maps.UnitSystem.METRIC,","  });","","  distancesList.sort((first, second) => {","    return first.distanceVal - second.distanceVal;","  });","","  return distancesList;","}","","/**"," * Build the content of the side panel from the sorted list of stores"," * and display it."," * @param {google.maps.Data} data The geospatial data object layer for the map"," * @param {object[]} stores An array of objects with a distanceText,"," * distanceVal, and storeid property."," */","function showStoresList(data, stores) {","  if (stores.length == 0) {","    console.log('empty stores');","    return;","  }","","  let panel = document.createElement('div');","  // If the panel already exists, use it. Else, create it and add to the page.","  if (document.getElementById('panel')) {","    panel = document.getElementById('panel');","    // If panel is already open, close it","    if (panel.classList.contains('open')) {","      panel.classList.remove('open');","    }","  } else {","    panel.setAttribute('id', 'panel');","    const body = document.body;","    body.insertBefore(panel, body.childNodes[0]);","  }","","","  // Clear the previous details","  while (panel.lastChild) {","    panel.removeChild(panel.lastChild);","  }","","  stores.forEach((store) => {","    // Add store details with text formatting","    const name = document.createElement('p');","    name.classList.add('place');","    const currentStore = data.getFeatureById(store.storeid);","    name.textContent = currentStore.getProperty('name');","    panel.appendChild(name);","    const distanceText = document.createElement('p');","    distanceText.classList.add('distanceText');","    distanceText.textContent = store.distanceText;","    panel.appendChild(distanceText);","  });","","  // Open the panel","  panel.classList.add('open');","","  return;","}"]}],[{"start":{"row":103,"column":24},"end":{"row":103,"column":25},"action":"insert","lines":["a"],"id":402},{"start":{"row":103,"column":25},"end":{"row":103,"column":26},"action":"insert","lines":["s"]},{"start":{"row":103,"column":26},"end":{"row":103,"column":27},"action":"insert","lines":["s"]},{"start":{"row":103,"column":27},"end":{"row":103,"column":28},"action":"insert","lines":["e"]},{"start":{"row":103,"column":28},"end":{"row":103,"column":29},"action":"insert","lines":["t"]},{"start":{"row":103,"column":29},"end":{"row":103,"column":30},"action":"insert","lines":["s"]},{"start":{"row":103,"column":30},"end":{"row":103,"column":31},"action":"insert","lines":["/"]}],[{"start":{"row":103,"column":31},"end":{"row":103,"column":32},"action":"insert","lines":["j"],"id":403},{"start":{"row":103,"column":32},"end":{"row":103,"column":33},"action":"insert","lines":["s"]},{"start":{"row":103,"column":33},"end":{"row":103,"column":34},"action":"insert","lines":["/"]}],[{"start":{"row":115,"column":18},"end":{"row":115,"column":30},"action":"remove","lines":["YOUR_API_KEY"],"id":404},{"start":{"row":115,"column":18},"end":{"row":115,"column":57},"action":"insert","lines":["AIzaSyAqthnqqZil9T4Tpz-2y9S13JjASnjjHPg"]}],[{"start":{"row":127,"column":65},"end":{"row":127,"column":89},"action":"remove","lines":["img/logo_${category}.png"],"id":405},{"start":{"row":127,"column":65},"end":{"row":127,"column":66},"action":"insert","lines":["a"]},{"start":{"row":127,"column":66},"end":{"row":127,"column":67},"action":"insert","lines":["s"]},{"start":{"row":127,"column":67},"end":{"row":127,"column":68},"action":"insert","lines":["s"]},{"start":{"row":127,"column":68},"end":{"row":127,"column":69},"action":"insert","lines":["e"]},{"start":{"row":127,"column":69},"end":{"row":127,"column":70},"action":"insert","lines":["t"]},{"start":{"row":127,"column":70},"end":{"row":127,"column":71},"action":"insert","lines":["s"]},{"start":{"row":127,"column":71},"end":{"row":127,"column":72},"action":"insert","lines":["d"]}],[{"start":{"row":127,"column":71},"end":{"row":127,"column":72},"action":"remove","lines":["d"],"id":406}],[{"start":{"row":127,"column":71},"end":{"row":127,"column":72},"action":"insert","lines":["/"],"id":407},{"start":{"row":127,"column":72},"end":{"row":127,"column":73},"action":"insert","lines":["i"]},{"start":{"row":127,"column":73},"end":{"row":127,"column":74},"action":"insert","lines":["m"]},{"start":{"row":127,"column":74},"end":{"row":127,"column":75},"action":"insert","lines":["a"]},{"start":{"row":127,"column":75},"end":{"row":127,"column":76},"action":"insert","lines":["g"]},{"start":{"row":127,"column":76},"end":{"row":127,"column":77},"action":"insert","lines":["e"]},{"start":{"row":127,"column":77},"end":{"row":127,"column":78},"action":"insert","lines":["s"]}],[{"start":{"row":127,"column":78},"end":{"row":127,"column":79},"action":"insert","lines":["/"],"id":408}],[{"start":{"row":127,"column":79},"end":{"row":127,"column":80},"action":"insert","lines":["c"],"id":409},{"start":{"row":127,"column":80},"end":{"row":127,"column":81},"action":"insert","lines":["a"]},{"start":{"row":127,"column":81},"end":{"row":127,"column":82},"action":"insert","lines":["r"]},{"start":{"row":127,"column":82},"end":{"row":127,"column":83},"action":"insert","lines":["-"]}],[{"start":{"row":127,"column":83},"end":{"row":127,"column":84},"action":"insert","lines":["l"],"id":410},{"start":{"row":127,"column":84},"end":{"row":127,"column":85},"action":"insert","lines":["i"]},{"start":{"row":127,"column":85},"end":{"row":127,"column":86},"action":"insert","lines":["s"]},{"start":{"row":127,"column":86},"end":{"row":127,"column":87},"action":"insert","lines":["t"]},{"start":{"row":127,"column":87},"end":{"row":127,"column":88},"action":"insert","lines":["/"]}],[{"start":{"row":127,"column":88},"end":{"row":127,"column":89},"action":"insert","lines":["m"],"id":411},{"start":{"row":127,"column":89},"end":{"row":127,"column":90},"action":"insert","lines":["o"]},{"start":{"row":127,"column":90},"end":{"row":127,"column":91},"action":"insert","lines":["d"]},{"start":{"row":127,"column":91},"end":{"row":127,"column":92},"action":"insert","lines":["e"]},{"start":{"row":127,"column":92},"end":{"row":127,"column":93},"action":"insert","lines":["l"]},{"start":{"row":127,"column":93},"end":{"row":127,"column":94},"action":"insert","lines":["-"]},{"start":{"row":127,"column":94},"end":{"row":127,"column":95},"action":"insert","lines":["s"]}],[{"start":{"row":127,"column":95},"end":{"row":127,"column":96},"action":"insert","lines":["."],"id":412},{"start":{"row":127,"column":96},"end":{"row":127,"column":97},"action":"insert","lines":["j"]},{"start":{"row":127,"column":97},"end":{"row":127,"column":98},"action":"insert","lines":["p"]},{"start":{"row":127,"column":98},"end":{"row":127,"column":99},"action":"insert","lines":["g"]}],[{"start":{"row":109,"column":14},"end":{"row":109,"column":61},"action":"remove","lines":["img/icon_${feature.getProperty('category')}.png"],"id":413},{"start":{"row":109,"column":14},"end":{"row":109,"column":48},"action":"insert","lines":["assets/images/car-list/model-s.jpg"]}],[{"start":{"row":120,"column":48},"end":{"row":120,"column":56},"action":"remove","lines":["category"],"id":414},{"start":{"row":120,"column":48},"end":{"row":120,"column":49},"action":"insert","lines":["m"]},{"start":{"row":120,"column":49},"end":{"row":120,"column":50},"action":"insert","lines":["a"]},{"start":{"row":120,"column":50},"end":{"row":120,"column":51},"action":"insert","lines":["k"]},{"start":{"row":120,"column":51},"end":{"row":120,"column":52},"action":"insert","lines":["e"]}],[{"start":{"row":121,"column":51},"end":{"row":123,"column":53},"action":"remove","lines":["","    const description = event.feature.getProperty('description');","    const hours = event.feature.getProperty('hours');"],"id":415}]]},"ace":{"folds":[],"scrolltop":1200,"scrollleft":0,"selection":{"start":{"row":121,"column":51},"end":{"row":121,"column":51},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1579124062459}