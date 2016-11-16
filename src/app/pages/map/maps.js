$(function() {
    initMap();
});
    function initMap() {
        var mapa = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: {lat: 42.1425954, lng: -71.1772822}
        });
//        var marker = new google.maps.Marker({
//            position: wayland,
//            map: mapa,
//
//        });
        var latitu = [39, 40, 41, 42, 43];
        var long = [-70, -71, -72, -73, -74];
        for (var i = 0; i < latitu.length; i++) {
            var latLng = {lat: latitu[i], lng: long[i]};
            var marker = new google.maps.Marker({
                position: latLng,
                map: mapa
            });
        }

        var infoWindow = new google.maps.InfoWindow({map: mapa});

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {

                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                infoWindow.setPosition(pos);
                infoWindow.setContent('Location found.');
                map.setCenter(pos);
            }, function() {
                handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }

        var marker = new google.map.Marker({
            position: pos,
            map: mapa
        })
    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    }