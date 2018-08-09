String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
config = require('./config')

var getTokenBody = 'grant_type=client_credentials&client_id=' + config.appID + '&resource=https://management.core.windows.net/&client_secret=' + config.appKey
var authURL = 'https://login.microsoftonline.com/' + config.tenantName + '.onmicrosoft.com/oauth2/token';
var qureyURL = 'https://management.azure.com/subscriptions/' + config.subscriptionID + '/resourceGroups/' + config.resourceGroupName + '/providers/Microsoft.StreamAnalytics/streamingjobs/' + config.streamAnalyticsName + '/transformations/Transformation?api-version=2015-10-01';
var urlStopHub = 'https://management.azure.com/subscriptions/' + config.subscriptionID + '/resourceGroups/' + config.resourceGroupName + '/providers/Microsoft.StreamAnalytics/streamingjobs/' + config.streamAnalyticsName + '/stop?api-version=2015-10-01';
var urlStartHub = 'https://management.azure.com/subscriptions/' + config.subscriptionID + '/resourceGroups/' + config.resourceGroupName + '/providers/Microsoft.StreamAnalytics/streamingjobs/' + config.streamAnalyticsName + '/start?api-version=2015-10-01';
var urlDeleteFunction = 'https://management.azure.com/subscriptions/' + config.subscriptionID + '/resourceGroups/' + config.resourceGroupName + '/providers/Microsoft.StreamAnalytics/streamingjobs/' + config.streamAnalyticsName + '/functions/'


exports.removeFunction = function removeFunction(functionName) {
    console.log("new request to remove zone");

    // get Bearer token
    var xhr = new XMLHttpRequest();
    xhr.open('POST', authURL, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(getTokenBody);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var resp = JSON.parse(xhr.responseText);
            console.log("token ok, stop SA");
            stopSA(resp.access_token, functionName)
        }
        else {
        }
    };


    function stopSA(bearerToken, functionName) {
        console.log("begin stop SA")

        var interval = setInterval(() => {
            var xhr2 = new XMLHttpRequest();
            xhr2.open('POST', urlStopHub, true);
            xhr2.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
            xhr2.send();
            xhr2.onreadystatechange = function () {
                if (xhr2.status === 200) {
                    console.log("SA Stopped");
                    console.log("ready to remove function");
                    changeQuery(bearerToken, functionName);
                    clearInterval(interval);
                }
                else { }
            }
        }, 5000);

    }

    function changeQuery(bearerToken, functionName) {
        var xhr2 = new XMLHttpRequest();
        xhr2.open('GET', qureyURL, true);
        xhr2.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
        xhr2.send();
        xhr2.onreadystatechange = function () {
            if (xhr2.readyState === 4 && xhr2.status === 200) {
                var SAQuery = JSON.parse(xhr2.responseText);
                var stringQuery = SAQuery.properties.query;
                var queryArray = stringQuery.split("\n");

                const result = queryArray.filter(word => !word.includes(functionName));
                var resultQuery = result.join("\n")
                SAQuery.properties.query = resultQuery;
                updateQuery(bearerToken, SAQuery, functionName);
            }
            else { }
        };
    }

    function updateQuery(bearerToken, SAQuery, functionName) {
        var xhr3 = new XMLHttpRequest();
        xhr3.open('PATCH', qureyURL, true);
        xhr3.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
        xhr3.setRequestHeader("Content-Type", "application/json");
        xhr3.send(JSON.stringify(SAQuery));
        xhr3.onreadystatechange = function () {
            if (xhr3.readyState === 4 && xhr3.status === 200) {
                console.log("ready to delete function")
                deleteFunction(bearerToken, functionName);
            }
            else {
                // console.log(xhr3);
            }
        };
    }

    function deleteFunction(bearerToken, functionName) {
        var xhr3 = new XMLHttpRequest();
        xhr3.open('DELETE', urlDeleteFunction + functionName + '?api-version=2015-10-01', true);
        xhr3.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
        xhr3.send();
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