var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://alexras:zPDBR4YrnkSTQjxDxYYfr0Ue6fex1F6786CYgm0cH73tqQRRNodRlCWEl1grUcZThVOQcSpZJlnQ79Q5neCoAA%3D%3D@alexras.documents.azure.com:10255/?ssl=true&replicaSet=globaldb';
var pol = 'Polygon';
var poly = {name: 'pol2', type: pol, coordinates: [[[37.838472, 59.118284], [37.838504, 59.118414], [37.847688, 59.117469], [37.847640, 59.117345], [37.838472, 59.118284]]]}
var poly2 = {
    "name": "pol2",
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.838029861450195,
                59.11833201686942
              ],
              [
                37.84757852554321,
                59.117362814439154
              ],
              [
                37.84770727157593,
                59.11779235071677
              ],
              [
                37.83818006515503,
                59.11876154099807
              ],
              [
                37.838029861450195,
                59.11833201686942
              ]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                37.83839464187622,
                59.119268152280725
              ],
              [
                37.84792184829712,
                59.11823289515202
              ],
              [
                37.84817934036255,
                59.11882762115536
              ],
              [
                37.83871650695801,
                59.11979678215503
              ],
              [
                37.83839464187622,
                59.119268152280725
              ]
            ]
          ]
        }
      }
    ]
  }

//mongoClient.connect("mongodb://myhost.documents.azure.com:10355/?ssl=true", 
// {user: 'username', pass: 'p@ssword'}, function (err, db) {
//  db.close();
//});
function addData(){
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("db1");
  //var myobj = { name: "Company Inc", address: "Highway 37" };
  dbo.collection("collection").insertOne(poly2, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});
}

function getData(){
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("db1");
        dbo.collection('collection').find().toArray(function(err, documents) {
            //assert.equal(1, documents.length);
            var a = documents[0];
            var b = a.coordinates[0];
            b.forEach(function(c){
                console.log(c);
            });
            db.close();
          });

      });
}

addData();