// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

/**
  * A class to help using the HTML5 Geolocation API.
  */
class LocationHelper {
    // Location values for latitude and longitude are private properties to protect them from changes.
    #latitude = '';

    /**
     * Getter method allows read access to privat location property.
     */
    get latitude() {
        return this.#latitude;
    }

    #longitude = '';

    get longitude() {
        return this.#longitude;
    }

   /**
    * Create LocationHelper instance if coordinates are known.
    * @param {string} latitude 
    * @param {string} longitude 
    */
   constructor(latitude, longitude) {
       this.#latitude = (parseFloat(latitude)).toFixed(5);
       this.#longitude = (parseFloat(longitude)).toFixed(5);
   }

    /**
     * The 'findLocation' method requests the current location details through the geolocation API.
     * It is a static method that should be used to obtain an instance of LocationHelper.
     * Throws an exception if the geolocation API is not available.
     * @param {*} callback a function that will be called with a LocationHelper instance as parameter, that has the current location details
     */
    static findLocation(callback) {
        const geoLocationApi = navigator.geolocation;

        if (!geoLocationApi) {
            throw new Error("The GeoLocation API is unavailable.");
        }

        // Call to the HTML5 geolocation API.
        // Takes a first callback function as argument that is called in case of success.
        // Second callback is optional for handling errors.
        // These callbacks are given as arrow function expressions.
        geoLocationApi.getCurrentPosition((location) => {
            // Create and initialize LocationHelper object.
            let helper = new LocationHelper(location.coords.latitude, location.coords.longitude);
            // Pass the locationHelper object to the callback.
            callback(helper);
        }, (error) => {
           alert(error.message)
        });
    }
}

/**
 * A class to help using the Leaflet map service.
 */
class MapManager {

    #map
    #markers

    /**
    * Initialize a Leaflet map
    * @param {number} latitude The map center latitude
    * @param {number} longitude The map center longitude
    * @param {number} zoom The map zoom, defaults to 18
    */
    initMap(latitude, longitude, zoom = 18) {
        // set up dynamic Leaflet map
        this.#map = L.map('map').setView([latitude, longitude], zoom);
        var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; ' + mapLink + ' Contributors'}).addTo(this.#map);
        this.#markers = L.layerGroup().addTo(this.#map);
    }

    /**
    * Update the Markers of a Leaflet map
    * @param {number} latitude The map center latitude
    * @param {number} longitude The map center longitude
    * @param {{latitude, longitude, name}[]} tags The map tags, defaults to just the current location
    */
    updateMarkers(latitude, longitude, tags = []) {
        // delete all markers
        this.#markers.clearLayers();
        L.marker([latitude, longitude])
            .bindPopup("Your Location")
            .addTo(this.#markers);
        for (const tag of tags) {
            L.marker([tag.latitude,tag.longitude])
                .bindPopup(tag.name)
                .addTo(this.#markers);  
        }
    }
}

/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */


// read GeoTag data from the map element's data-tags
function readTagsFromDom() {
    const mapDiv = document.getElementById("map");
    if (!mapDiv || !mapDiv.dataset.tags) return [];

    try {
        return JSON.parse(mapDiv.dataset.tags);
    } catch (e) {
        console.error("Could not parse data-tags JSON:", e);
        return [];
    }
}

// fill all latitude/longitude form fields
function populateLocationFields(latitude, longitude) {
    const fields = [
        { id: "latitude", value: latitude },
        { id: "longitude", value: longitude },
        { id: "discovery-latitude", value: latitude },
        { id: "discovery-longitude", value: longitude },
    ];

    for (const field of fields) {
        const el = document.getElementById(field.id);
        if (el) el.value = field.value;
    }
}

// remove the static map placeholder (image + label)
function removeMapPlaceholder() {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    const img = mapContainer.querySelector("img");
    const span = mapContainer.querySelector("span");
    if (img) img.remove();
    if (span) span.remove();
}

// retrieve the current location and initialize the map
function updateLocation() {
    const mapManager = new MapManager();
    const tags = readTagsFromDom();

    const tagLat = document.getElementById("latitude");
    const tagLon = document.getElementById("longitude");

    // if coordinates are already set (e.g. from server), use them directly
    if (tagLat?.value && tagLon?.value) {
        mapManager.initMap(tagLat.value, tagLon.value);
        mapManager.updateMarkers(tagLat.value, tagLon.value, tags);
        return;
    }

    // otherwise, request location from the browser
    try {
        LocationHelper.findLocation((helper) => {
            populateLocationFields(helper.latitude, helper.longitude);
            mapManager.initMap(helper.latitude, helper.longitude);
            mapManager.updateMarkers(helper.latitude, helper.longitude, tags);
            removeMapPlaceholder();
        });
    } catch (err) {
        console.error("Geolocation API not available:", err);
    }
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation()
    console.info("Geolocation updated successfully");
});
