Easy FrontEnd for IoT locations tracker.
Use Azure AD for WEB and API authentification, Express web server, express4-tedious library to get data from Azure SQL, Google Maps Javascript for locations visualization.


## Stream Analytics Query 

SELECT
ST_WITHIN(input.location, UDF.location(1)) as "inZone",
input.location as "Point",
UDF.location(1) as "Polygon"
INTO storage
FROM
iothub as input

SELECT 
input.DeviceId as DeviceId,
GetArrayElement(input.location.coordinates,0)as Lat,
GetArrayElement(input.location.coordinates,1)as Long,
EventEnqueuedUtcTime as IncomeTime
INTO SQL
FROM
iothub as input

## Stream Analytics function Query (function name must be "location")

function poly(b) {
    var pol = 'Polygon';
    var a = {type: pol, coordinates: [[[59.118284, 37.838472], [59.118414, 37.838504], [59.117469, 37.847688], [59.117345, 37.847640], [59.118284, 37.838472]]]}
    return a
}


## Expected JSON

{  
    "DeviceId" : "12345",  
    "location" : {"type":"Point",
		"coordinates": 
		[59.118105, 37.840838]
		}
}