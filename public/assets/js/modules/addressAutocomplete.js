// addressAutocomplete.js

export function initializeGoogleAutocomplete() {
  console.log("Google Places API initialized.");

  // Ensure Google API is loaded
  if (typeof google === "undefined" || !google.maps) {
    console.error("Google Maps API not loaded yet.");
    return;
  }

  // Define input field IDs
  const inputIds = ["homeAddress", "propertyAddress"];

  inputIds.forEach((id) => {
    const input = document.getElementById(id);

    if (!input) {
      console.error(`Autocomplete input field not found: ${id}`);
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ["address"], // Fetches full addresses
      componentRestrictions: { country: "UK" },
    });

    autocomplete.addListener("place_changed", function () {
      const place = autocomplete.getPlace();

      if (!place || !place.formatted_address) {
        alert("Please select a valid address from the suggestions.");
        return;
      }

      input.value = place.formatted_address;
      console.log(`Selected address for ${id}:`, place.formatted_address);
    });
  });
}
