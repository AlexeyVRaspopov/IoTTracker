const
    passport = require('passport')
    , BearerStrategy = require('passport-azure-ad').BearerStrategy
    , config = require('./config')
    , authenticatedUserTokens = []
    , serverPort = process.env.PORT || config.serverPort
    , sqlUserName = config.sqlUserName
    , sqlUserPass = config.sqlUserPass
    , sqlAddress = config.sqlAddress
    , sqlDBName = config.sqlDBName
    , iotHubConnectionString = config.iotHubConnectionString
//configure application insights
const appInsights = require("applicationinsights");
appInsights.setup("04b02b4e-9c97-4a4b-9107-3175a1fb9ea6");
appInsights.start();
let telemetry = appInsights.defaultClient;

//configure connection to IoT hub
var iotClient = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;
var serviceClient = iotClient.fromConnectionString(iotHubConnectionString);


//configure mongo client
var MongoClient = require('mongodb').MongoClient;


//add mongoserver file
var streamanalyticsAdd = require("./streamanalytics-add.js");
var streamanalyticsRemove = require("./streamanalytics-remove.js");





//configure pasport to use Bearer auth.
const authenticationStrategy = new BearerStrategy(config.credentials, (token, done) => {
    let currentUser = null;
    let userToken = authenticatedUserTokens.find((user) => {
        currentUser = user;
        user.sub === token.sub;
    });
    if (!userToken) {
        authenticatedUserTokens.push(token);
    }
    return done(null, currentUser, token);
});
passport.use(authenticationStrategy);

//tedious is library for Azure SQL connection
var tediousExpress = require('express4-tedious');
var TYPES = require('tedious').TYPES;
var ConnectionSQL = require('tedious').Connection;
var Request = require('tedious').Request;

var connection = {
    userName: sqlUserName,
    password: sqlUserPass,
    server: sqlAddress,
    options:
    {
        database: sqlDBName,
        encrypt: true
    }
};


//configure express web server
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(serverPort);

var needLocation = false;
var lastIncomeTime;


function queryLocationData(ClientID, DeviceID) {
    var SQLconnection = new ConnectionSQL(connection);
    var queryResult;
    SQLconnection.on('connect', function (err) {
        if (err) {
            console.log(err)
        }
        else {
            var requestText = "select TOP(1) * from locations where DeviceId = " + DeviceID + " ORDER BY [IncomeTime] DESC for json path"
            request = new Request(requestText, function (err, rowCount, rows) { });
            request.on('row', function (columns) {
                columns.forEach(function (column) {
                    queryResult = JSON.parse(column.value)
                    if (queryResult[0].IncomeTime != lastIncomeTime) {
                        io.sockets.to(ClientID).emit('location', queryResult);
                    };
                    lastIncomeTime = queryResult[0].IncomeTime;
                });
            });
            SQLconnection.execSql(request);
        }
    });
}


app.get('/startcurrnt/:clientID/:deviceID', function (req, res) {
    needLocation = true;
    res.send("ok");

    var interval = setInterval(() => {
        queryLocationData(req.params.clientID, req.params.deviceID);
        if (needLocation == false) {
            clearInterval(interval);
        }
    }, 3000);

});

app.get('/stopcurrnt/:id', function (req, res) {
    needLocation = false;
    res.send("ok");
});

io.sockets.on('disconnect', function (socket) {
    var ID = (socket.id).toString();
    console.log('disconnected: ' + ID);
});

io.sockets.on('connect', function (socket) {
    var ID = (socket.id).toString();
    console.log('connect: ' + ID);
});


app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('.'));

app.get("/", function (request, response) {
    try {
        response.sendfile('index.html');
    } catch (ex) {
        telemetry.trackException({ exception: ex });
    }
});

app.use(function (req, res, next) {
    req.sql = tediousExpress(connection);
    next();
});



app.post('/message/:deviceID', function (req, res) {
    try {
        var time = (new Date).toLocaleTimeString();
        io.sockets.emit('danger', { 'event': 'Device in Danger Zone', 'Device': req.params.deviceID, 'time': time });

        serviceClient.open(function (err) {
            if (err) {
                console.error('Could not connect: ' + err.message);
            } else {
                console.log('Service client connected');
                var message = new Message('You in danger zone!!!');
                message.ack = 'full';
                message.messageId = "Attention!";
                console.log('Sending message: ' + message.getData());
                serviceClient.send(req.params.deviceID, message);
                serviceClient.close();
            }
        });
        res.send('ok');
    } catch (ex) {
        telemetry.trackException({ exception: ex });
    }
});

app.get('/locations', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    try {
        req.sql("select * from locations for json path")
            .into(res);
    } catch (ex) {
        telemetry.trackException({ exception: ex });
    }
});
app.get('/locations/:id', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    try {
        req.sql("select * from locations where DeviceId = @id for json path")
            .param('id', req.params.id, TYPES.VarChar)
            .into(res, '{}');
    } catch (ex) {
        telemetry.trackException({ exception: ex });
    }
});

app.get('/dates/:id', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    try {
        req.sql("select INCOMETIME from locations where DeviceId = @id for json path")
            .param('id', req.params.id, TYPES.VarChar)
            .into(res, '{}');
    } catch (ex) {
        telemetry.trackException({ exception: ex });
    }
});


app.get('/locationson/:id/:id2/:id3', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    try {
        console.log("select * from locations where INCOMETIME BETWEEN" + req.params.id + " AND " + req.params.id2 + "AND DEVICEID = " + req.params.id3 + " for json path");
        req.sql("select * from locations where INCOMETIME BETWEEN @id AND @id2 AND DEVICEID = @id3 for json path")
            .param('id', req.params.id, TYPES.NChar)
            .param('id2', req.params.id2, TYPES.NChar)
            .param('id3', req.params.id3, TYPES.NChar)
            .into(res, '{}');
    } catch (ex) {
        telemetry.trackException({ exception: ex });
    }
});

app.get('/devices', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    try {
        req.sql("select distinct(DeviceId) from locations for json path")
            .into(res);
    } catch (ex) {
        telemetry.trackException({ exception: ex });
    }
});

app.get('/zones', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        MongoClient.connect(config.mongoConnectionString, { useNewUrlParser: true }, function (err, db) {
            if (err) throw err;
            var dbo = db.db("locations");
            dbo.collection('zones').find().toArray(function (err, documents) {
                console.log(documents);
                db.close();
                res.send(documents);
            });
        });
    } catch (ex) {
        telemetry.trackException({ exception: ex });
    }
});

app.post('/newzone', function (req, res) {
    try {
        res.send('ok');
        //  mongoserver.inserttoMongo(req.body);
        var featureCollection = req.body;
        streamanalyticsAdd.addFunction(featureCollection.features[0].geometry, "alexras6", "33");
    } catch (ex) {
        telemetry.trackException({ exception: ex });
    }
})

app.post('/removezone', function (req, res) {
    try {
        res.send('ok');
        //  mongoserver.inserttoMongo(req.body);
        var featureCollection = req.body;
        streamanalyticsRemove.removeFunction("alexras5");
    } catch (ex) {
        telemetry.trackException({ exception: ex });
    }
})

app.get("/test", function (request, response) {
    response.sendfile('test.html');
});
