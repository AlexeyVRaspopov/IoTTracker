var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://alexras:zPDBR4YrnkSTQjxDxYYfr0Ue6fex1F6786CYgm0cH73tqQRRNodRlCWEl1grUcZThVOQcSpZJlnQ79Q5neCoAA%3D%3D@alexras.documents.azure.com:10255/?ssl=true&replicaSet=globaldb';

exports.inserttoMongo = function insertZone(zone) {
    zone.name = 'test';
    console.log(zone);

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("db1");
        dbo.collection("collection").insertOne(zone, function (err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
    });
}