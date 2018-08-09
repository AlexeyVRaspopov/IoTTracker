window.onload = function() {
    console.log("connect to socket");
	socket = io.connect();
	socket.on('danger', function (msg1) {
		console.log(msg1.event);
		$('#log').append(msg1.event + ' device: '+ msg1.Device); 
	});

	socket.on('location', function (msg2) {
		console.log(msg2[0].Lat);
		console.log(msg2[0].Long);
		showPoint(msg2[0].Lat, msg2[0].Long, msg2[0].IncomeTime)
	});
};



function subscribeOrUnsubscribe()
    {
    if (document.getElementById('subscribeTo').checked) 
        {
            subscribeTo();
        } else {
            unsubscribeTo();
        }
    }

function subscribeTo(){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', serverAddress +'/startcurrnt/'+socket.id+ '/'+$('#devicesList').val(), true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send();
}

function unsubscribeTo(){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', serverAddress +'/stopcurrnt/'+$('#devicesList').val(), true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + bearerToken);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send();
}