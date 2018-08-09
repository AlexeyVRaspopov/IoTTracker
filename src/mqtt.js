var connectionString = 'HostName=alexrasiot.azure-devices.net;DeviceId=1;SharedAccessKey=Zxu9yW3lt2JfYn5zZLgo4BeHcDcNbrS0BsFi7Yux8tU=';

// Using the Node.js Device SDK for IoT Hub:
//   https://github.com/Azure/azure-iot-sdk-node
// The sample connects to a device-specific MQTT endpoint on your IoT Hub.
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;
  var x = 37.840938
  var y = 59.118405;
  
var client = DeviceClient.fromConnectionString(connectionString, Mqtt);
	console.log('Client connected');
    client.on('message', function (msg) {
      console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
      client.complete(msg, printResultFor('completed'));
    });

// Print results.
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

// Create a message and send it to the IoT hub every second
setInterval(function(){
  // Add the telemetry to the message body.
  var data2 = {  
    "DeviceId" : "1",  
    "location" : {"type":"Point",
		"coordinates": 
		[x, y]
		}
}
  var data3 = JSON.stringify(data2);
  var message = new Message(data3);

  console.log('Sending message: ' + message.getData());

  client.sendEvent(message, printResultFor('send'));
}, 10000);