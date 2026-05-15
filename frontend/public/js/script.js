function fetchLocationSuggestions() {
    const input = document.getElementById('autocomplete').value;
    const suggestionsBox = document.getElementById('locationSuggestions');

    if (input.length < 3) {
        suggestionsBox.innerHTML = '';
        return;
    }

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&addressdetails=1&limit=5`)
        .then(response => response.json())
        .then(data => {
            suggestionsBox.innerHTML = '';
            data.forEach(place => {
                const li = document.createElement('li');
                li.className = 'list-group-item list-group-item-action';
                li.textContent = place.display_name;
                li.style.cursor = 'pointer';
                li.onclick = () => {
                    document.getElementById('autocomplete').value = place.display_name;
                    
                    const addr = place.address || {};
                    document.getElementById('newCountry').value = addr.country || '';
                    document.getElementById('newState').value = addr.state || '';
                    document.getElementById('newCity').value = addr.city || addr.town || addr.village || '';
                    
                    // Try to populate area/zipcode if inputs exist
                    const areaInput = document.getElementById('newArea');
                    if(areaInput) areaInput.value = addr.suburb || addr.neighbourhood || '';
                    
                    const zipInput = document.getElementById('newZipCode');
                    if(zipInput) zipInput.value = addr.postcode || '';

                    // For any hidden lat/lng fields if they exist
                    const latInput = document.getElementById('newLat');
                    if(latInput) latInput.value = place.lat;
                    const lngInput = document.getElementById('newLng');
                    if(lngInput) lngInput.value = place.lon;

                    suggestionsBox.innerHTML = '';
                };
                suggestionsBox.appendChild(li);
            });
        })
        .catch(err => {
            console.error('Error fetching location:', err);
        });
}

// Ensure clicking outside closes suggestions
document.addEventListener('click', function(e) {
    const suggestionsBox = document.getElementById('locationSuggestions');
    if (e.target.id !== 'autocomplete' && suggestionsBox) {
        suggestionsBox.innerHTML = '';
    }
});
