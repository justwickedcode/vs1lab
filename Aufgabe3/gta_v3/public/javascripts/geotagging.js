// File origin: VS1LAB A3

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

const mapManager = new MapManager();

/**
 * Helper: read taglist from #map data-tags (Aufgabe 3.2.3)
 * Server writes JSON string into data-tags. Client parses it back to an array.
 */
function readTagsFromMapDataAttribute() {
  const mapContainer = document.getElementById("map");
  const raw = mapContainer?.dataset?.tags || "[]";

  try {
    const tags = JSON.parse(raw);
    if (!Array.isArray(tags)) return [];

    // Ensure numeric coordinates for Leaflet
    return tags
      .map((t) => ({
        ...t,
        latitude: Number(t.latitude),
        longitude: Number(t.longitude),
      }))
      .filter((t) => !Number.isNaN(t.latitude) && !Number.isNaN(t.longitude));
  } catch (e) {
    return [];
  }
}

/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
function updateLocation() {
  // 1) read form fields
  const tagLat = document.getElementById("latitude");
  const tagLon = document.getElementById("longitude");

  // discovery forms (hidden inputs)
  const discLat = document.getElementById("disc-latitude");
  const discLon = document.getElementById("disc-longitude");

  //are coords already available? (Tagging ODER Discovery)
  const latValue = (tagLat?.value || discLat?.value || "").trim();
  const lonValue = (tagLon?.value || discLon?.value || "").trim();
  const latAlreadySet = latValue !== "";
  const lonAlreadySet = lonValue !== "";

  // yes they are -> no GeoLocation call
  if (latAlreadySet && lonAlreadySet) {
    const latitude = latValue;
    const longitude = lonValue;

    // init map directly
    mapManager.initMap(latitude, longitude);

    // set marker for discovery results
    const tags = readTagsFromMapDataAttribute();
    mapManager.updateMarkers(Number(latitude), Number(longitude), tags);

    // remove placehoder
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      const img = mapContainer.querySelector("img");
      const span = mapContainer.querySelector("span");
      if (img) img.remove();
      if (span) span.remove();
    }

    return;
  }

  // no coords -> use GeoLocation API
  try {
    LocationHelper.findLocation((helper) => {
      const latitude = helper.latitude;
      const longitude = helper.longitude;

      // fill fields
      if (tagLat) tagLat.value = latitude;
      if (tagLon) tagLon.value = longitude;
      if (discLat) discLat.value = latitude;
      if (discLon) discLon.value = longitude;

      // map init
      mapManager.initMap(latitude, longitude);

      // set marker for discovery
      const tags = readTagsFromMapDataAttribute();
      mapManager.updateMarkers(Number(latitude), Number(longitude), tags);

      // use palceholder
      const mapContainer = document.getElementById("map");
      if (mapContainer) {
        const img = mapContainer.querySelector("img");
        const span = mapContainer.querySelector("span");
        if (img) img.remove();
        if (span) span.remove();
      }
    });
  } catch (err) {
    console.error("Geolocation API not available:", err);
  }
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
  updateLocation();
});
//updates location when document is loaded
