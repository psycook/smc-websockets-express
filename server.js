var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var expressWs = require('express-ws')(app);
var port = process.env.PORT || 8080;

// register the body parse for access to the JSON objects
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// middleware function - not required
app.use(function(req, res, next) {
    req.roomserviceprotocol = 'room-service-protocol';
    return next();
});

// the standard get fuction
app.get('/', function(req, res, next) {
    console.log('get route', req.roomserviceprotocol);
    res.send("Room Service Running");
    res.end();
});

/*
 * this function is called when the web browser registers with the
 * websocket server
 */
app.ws('/', function(ws, req) {
    console.log('Client registered', req.roomserviceprotocol);

    // The ws.on method can be used to receive information from the client
    ws.on('message', function(msg) {
        console.log("Received message from HTML client");
        // echo the message back for this example
        var aWss = expressWs.getWss('/');
        aWss.clients.forEach(function(client) {
          var myObject = {"type":"message","data":msg}
          var jsonText = JSON.stringify(myObject)
          client.send(jsonText);
        });
    });

    // The ws.close method is called when the client connection closes
    ws.on('close', function() {
      console.log('close connection');
    });
});

/*
 *  This REST endpoint can be called to change the background color of all
 *  registered clients.
 */
app.post('/bgcolor', function(req, res) {
  console.log("Received REST POST for /bgcolor");
  var color = req.body.color;
  var aWss = expressWs.getWss('/');
  aWss.clients.forEach(function(client) {
    var myObject = {"type":"bgcolor","data":color};
    var jsonText = JSON.stringify(myObject);
    client.send(jsonText);
  });
  res.end();
});

// start the express server listening on this port
app.listen(port, function() {
  console.log('Node app is running on port', port);
});
