var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
config = require('./config')

var getTokenBody = 'grant_type=client_credentials&client_id=' + config.appID + '&resource=https://management.core.windows.net/&client_secret=' + config.appKey
var authURL = 'https://login.microsoftonline.com/' + config.tenantName + '.onmicrosoft.com/oauth2/token';
var urlFunction = 'https://management.azure.com/subscriptions/' + config.subscriptionID + '/resourceGroups/' + config.resourceGroupName + '/providers/Microsoft.StreamAnalytics/streamingjobs/' + config.streamAnalyticsName + '/functions/'
var urlStopHub = 'https://management.azure.com/subscriptions/' + config.subscriptionID + '/resourceGroups/' + config.resourceGroupName + '/providers/Microsoft.StreamAnalytics/streamingjobs/' + config.streamAnalyticsName + '/stop?api-version=2015-10-01';
var qureyURL = 'https://management.azure.com/subscriptions/' + config.subscriptionID + '/resourceGroups/' + config.resourceGroupName + '/providers/Microsoft.StreamAnalytics/streamingjobs/' + config.streamAnalyticsName + '/transformations/Transformation?api-version=2015-10-01';
var urlStartHub = 'https://management.azure.com/subscriptions/' + config.subscriptionID + '/resourceGroups/' + config.resourceGroupName + '/providers/Microsoft.StreamAnalytics/streamingjobs/' + config.streamAnalyticsName + '/start?api-version=2015-10-01';

exports.addFunction = function addFunction(polyArray, functionName, functionWeight) {
    console.log("new request to add zone");

    // get Bearer token
    var xhr = new XMLHttpRequest();
    xhr.open('POST', authURL, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(getTokenBody);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var resp = JSON.parse(xhr.responseText);
            console.log("token ok, stop SA");
            stopSA(resp.access_token);
        }
        else {
        }
    };

    // stop SA
    function stopSA(bearerToken) {
        console.log("begin stop SA")

        var interval = setInterval(() => {
            var xhr2 = new XMLHttpRequest();
            xhr2.open('POST', urlStopHub, true);
            xhr2.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
            xhr2.send();
            xhr2.onreadystatechange = function () {
                if (xhr2.status === 200) {
                    console.log("SA Stopped");
                    console.log("ready to add function");
                    addFunctionToSA(bearerToken, functionName);
                    clearInterval(interval);
                }
                else { }
            }
        }, 5000);

    }

    var polygoneFunction = "function poly(b) { \n\
        var a = "+ JSON.stringify(polyArray) + "  \n\
        return a    }    ";

    var functionBaseCode = {
        "properties": {
            "type": "Scalar",  //Function type. Scalar is the only supported value
            "properties": {
                "inputs": [ // Function input parameter(s).
                    {
                        "dataType": "any", // Input data type
                    }
                ],
                "output": { // Output
                    "dataType": "any" // Output data type
                },
                "binding": {
                    "type": "Microsoft.StreamAnalytics/JavascriptUdf",
                    "properties": { // Function definition
                        "script": polygoneFunction
                    }
                }
            }
        }
    }


    function addFunctionToSA(bearerToken, functionName) {
        console.log("Add function");
        var xhr2 = new XMLHttpRequest();
        var url21 = urlFunction + functionName + '?api-version=2015-10-01'
        xhr2.open('PUT', url21, true);
        xhr2.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
        xhr2.send(JSON.stringify(functionBaseCode));
        xhr2.onreadystatechange = function () {
            if (xhr2.readyState === 4 && xhr2.status === 200) {
                getQueryFromSA(bearerToken, functionName)
            }
            else {
            }
        };
    }

    function getQueryFromSA(bearerToken, functionName) {
        var xhr2 = new XMLHttpRequest();
        xhr2.open('GET', qureyURL, true);
        xhr2.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
        xhr2.send();
        console.log('get query');
        xhr2.onreadystatechange = function () {
            if (xhr2.readyState === 4 && xhr2.status === 200) {
                var SAQuery = JSON.parse(xhr2.responseText);
                var stringQuery = SAQuery.properties.query;
                var queryArray = stringQuery.split("\n");
                var result1Place;
                var result2Place;
                var result3Place;
                var fistQuery = 'WHEN ST_WITHIN(input.location, UDF.' + functionName + '(1)) = 1 THEN ' + functionWeight;
                var secondQuery = 'WHEN ST_WITHIN(input.location, UDF.' + functionName + '(1)) = 1 THEN ' + functionWeight;
                var thirdQuery = 'or (ST_WITHIN(input.location, UDF.' + functionName + '(1)) = 1)';

                //add first query
                for (var i = 0; i < queryArray.length; i++) {
                    if (queryArray[i].includes("function1")) {
                        console.log("find1");
                        result1Place = i;
                    }
                }
                queryArray.splice(result1Place + 1, 0, fistQuery);

                //add second query
                for (var i = 0; i < queryArray.length; i++) {
                    if (queryArray[i].includes("function2")) {
                        console.log("find2");
                        result2Place = i;
                    }
                }
                queryArray.splice(result2Place + 1, 0, secondQuery);

                //add third query
                for (var i = 0; i < queryArray.length; i++) {
                    if (queryArray[i].includes("function3")) {
                        console.log("find3");
                        result3Place = i;
                    }
                }
                queryArray.splice(result3Place + 1, 0, thirdQuery);
                var resultQuery = queryArray.join("\n")
                SAQuery.properties.query = resultQuery;
                updateQuery(bearerToken, SAQuery);
            }
            else { }
        };
    }


    function updateQuery(bearerToken, SAQuery) {
        var xhr3 = new XMLHttpRequest();
        xhr3.open('PATCH', qureyURL, true);
        xhr3.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
        xhr3.setRequestHeader("Content-Type", "application/json");
        xhr3.send(JSON.stringify(SAQuery));
        xhr3.onreadystatechange = function () {
            if (xhr3.readyState === 4 && xhr3.status === 200) {
                console.log("ready to start SA")
                startJob(bearerToken);
            }
            else {
            }
        };
    }


    function startJob(bearerToken) {
        console.log("begin start SA")
        var a = {
            "outputStartMode": "JobStartTime"
        }

        var xhr2 = new XMLHttpRequest();
        xhr2.open('POST', urlStartHub, true);
        xhr2.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
        xhr2.send(JSON.stringify(a));
        xhr2.onreadystatechange = function () {
            if (xhr2.status === 200) {
                console.log("SA Started");
            }
            else {
            }
        }
    }
}