function adminsmode() {
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['polygon']
        },
        markerOptions: { icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png' },
        circleOptions: {
            fillColor: '#ffff00',
            fillOpacity: 1,
            strokeWeight: 5,
            clickable: false,
            editable: true,
            zIndex: 1
        }
    });
    drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, 'polygoncomplete', function (shape) {
        var points = [];
        for (var i = shape.getPath().getLength() - 1; i >= 0; i--) {
            var lat = shape.getPath().getAt(i).lat();
            var lng = shape.getPath().getAt(i).lng();
            var locations = [lng, lat];
            points.push(locations);
        }
        points.push(points[0]);

        var data2 = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates":
                            [points]
                    }
                }
            ]
        };

        var xhr = new XMLHttpRequest();
        xhr.open('POST', serverAddress + '/newzone', true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data2));

    });
}


function updateTextInput(val) {
    document.getElementById('textInput').innerHTML = val;
}
function updateTextInput2(val) {
    document.getElementById('textInput2').innerHTML = val;
}


function getAllDevices() {
    var select = document.getElementById("devicesList");
    var length = select.options.length;
    for (i = 1; i < length; i++) {
        select.options[i] = null;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', serverAddress + '/devices', true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('response ok');
            var devicesArray = JSON.parse(xhr.response);
            devicesArray.forEach(function (device) {
                var option = '';
                option += '<option value="' + device.DeviceId + '">' + device.DeviceId + '</option>';
                $('#devicesList').append(option);
            });
            console.log(devicesArray);
        } else {
            console.log('error');
        }
    };
}

function getPathFromDatabase() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', serverAddress + '/locations/' + $('#devicesList').val(), true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('response ok');
            var locationsArray = JSON.parse(xhr.response);
            var locations = [];
            locationsArray.forEach(function (location) {
                locations.push({ lat: location.Lat, lng: location.Long })
            });
            showDeviceRoute(locations);
            console.log(locations);
        } else {
            console.log('error');
        }
    };
}

var devicePath;

function showPoint(lat, lng, name) {
    var point = { lat, lng }
    console.log(point);
    var marker = new google.maps.Marker({
        position: point,
        map: map,
        title: name
    });
    map.panTo(point);
}

function showDeviceRoute(pathPoints) {
    var parhCoordinatesExample = [
        { lat: 59.118105, lng: 37.840838 },
        { lat: 59.118205, lng: 37.840938 },
        { lat: 59.118105, lng: 37.840738 }
    ];
    devicePath = new google.maps.Polyline({
        path: pathPoints,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    var center = new google.maps.LatLng(pathPoints[0].lat, pathPoints[0].lng);
    map.panTo(center);
    devicePath.setMap(map);

}

function clearSelectedRoute() {
    if (devicePath) {
        devicePath.setMap(null)
    }
}

function getZones() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', serverAddress + '/zones/', true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var zonesJSON = JSON.parse(xhr.response);
            delete zonesJSON[0]["_id"]
            delete zonesJSON[0]["name"]
            map.data.addGeoJson(zonesJSON[0]);
        } else {
            console.log('error');
        }
    };
}

function sendMessage() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', serverAddress + '/message/' + $('#devicesList').val(), true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('Sended');
        } else {
            console.log('error');
        }
    };
}

function getDates() {
    var select = document.getElementById("dateListFrom");
    select.options.length = 0;

    select2 = document.getElementById("dateListTo");
    select2.options.length = 0;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', serverAddress + '/dates/' + $('#devicesList').val(), true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log('response ok');
            var datesArray = JSON.parse(xhr.response);
            console.log(datesArray);
            datesArray.forEach(function (date) {
                var option = '';
                option += '<option value="' + date.INCOMETIME + '">' + date.INCOMETIME + '</option>';
                $('#dateListTo').append(option);
            });

            datesArray.forEach(function (date) {
                var option = '';
                option += '<option value="' + date.INCOMETIME + '">' + date.INCOMETIME + '</option>';
                $('#dateListFrom').append(option);
            });

        } else {
            console.log('error');
        }
    };
}

function showSelectedRoute() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', serverAddress + '/locationson/' + $('#dateListFrom').val() + '/' + $('#dateListTo').val() + '/' + $('#devicesList').val(), true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var locationsArray = JSON.parse(xhr.response);
            var locations = [];
            locationsArray.forEach(function (location) {
                locations.push({ lat: location.Lat, lng: location.Long })
            });
            showDeviceRoute(locations);
        } else {
            console.log('error');
        }
    };
}


//set default picker value
document.getElementById('datetimePick').valueAsDate = new Date();
//show selected route 2
function showSelectedRoute2() {
    if ($('#datetimePick').val() != null && $('#devicesList').val() != null) {
        clearSelectedRoute();
        var dateFrom = new Date($('#datetimePick').val());
        dateFrom.setHours($('#timeFrom').val());
        var dateA = moment.utc(dateFrom).format();

        var dateTo = new Date($('#datetimePick').val());
        dateTo.setHours($('#timeTo').val());
        var dateB = moment.utc(dateTo).format();

        console.log(dateFrom + "      " + dateTo);
        console.log(serverAddress + '/locationson/' + dateA + '/' + dateB + '/' + $('#devicesList').val());

        var xhr = new XMLHttpRequest();
        xhr.open('GET', serverAddress + '/locationson/' + dateA + '/' + dateB + '/' + $('#devicesList').val(), true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var locationsArray = JSON.parse(xhr.response);
                var locations = [];
                locationsArray.forEach(function (location) {
                    locations.push({ lat: location.Lat, lng: location.Long })
                });
                showDeviceRoute(locations);
            } else {
                console.log('error');
            }
        };
    }
    else {
        alert("select device");
    }
}