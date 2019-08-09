
var bodyParser = require("body-parser");
const { Expo } = require('expo-server-sdk');
const fetch = require("node-fetch");
const mysql = require('mysql');
const ngrok = require('ngrok');
const express = require('express'); //express framework to have a higher level of methods
const app = express(); //assign app variable the express class/method
const expo = new Expo();
var http = require('http');
var path = require("path");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const server = http.createServer(app);//create a server
const WebSocket = require('ws');
const s = new WebSocket.Server({ server });
let savedPushTokens = [];

//mysql connection setup
const connection = mysql.createPool({
  connectionLimit: 1000,
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'temperature'
});

//***************this snippet gets the local ip of the node.js server. copy this ip to the client side code and add ':3000' *****
//****************exmpl. 192.168.56.1---> var sock =new WebSocket("ws://192.168.56.1:3000");*************************************
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('addr: '+add);
})



//when browser sends get request, send html file to browser
// viewed at http://localhost:30000
app.get('/', function(req, res) {
res.sendFile(path.join(__dirname + '/index.html'));
});


//app.ws('/echo', function(ws, req) {
s.on('connection',function(ws,req){
/******* when server receives messsage from client trigger function with argument message *****/
ws.on('message',function(message){
console.log("Received: "+message);
s.clients.forEach(function(client){ //broadcast incoming message to all clients (s.clients)
if(client!=ws && client.readyState ){ //except to the same client (ws) that sent this message
client.send(message);
// if temperature > 40 server will sent push notification to mobile application
if (message > 40)
{
fetch('http://192.168.0.194:3000/message', {
    body: JSON.stringify({
      to: 'ExponentPushToken[qvvq3KEDp9qgGdO0Fq8Ghx]',
      message: 'Your house temperature exceed 40 degree celcius.'
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  }); 

  //temperature alert will be store in database tempalert table
  connection.query("INSERT INTO tempalert SET ? ", { temperature: message }, function (error, results, fields) {
  })
}
}
});
});
ws.on('close', function(){
console.log("lost one client");
});
//ws.send("new client connected");
console.log("new client connected");


});

const handlePushTokens = (message) => {
  // Create the messages that you want to send to clents
  let notifications = [];
  for (let pushToken of savedPushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.log(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
    notifications.push({
      to: pushToken,
      sound: 'default',
      title: 'Fire Alert!',
      body: message,
      data: { message },
    })
  }

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  let chunks = expo.chunkPushNotifications(notifications);

  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log(receipts);
      } catch (error) {
        console.error(error);
      }
    }
  })();
}

const saveToken = (token) => {
  if (savedPushTokens.indexOf(token === -1)) {
    savedPushTokens.push(token);
  }
}

// Creating a GET route that returns data from the 'templog' table where 1 hour graph will be created.
app.get('/1hourgraph', function (req, res) {
  // Connecting to the database.
  // Executing the MySQL query (select all data from the 'users' table).
  connection.query(`SELECT temperature as temp, MINUTE(timeStamp) as timestamp FROM templog WHERE HOUR(timeStamp) = HOUR(CURRENT_TIMESTAMP()) && Date(timeStamp) = Date(CURRENT_TIMESTAMP()) Group BY MINUTE(timeStamp)`, function (error, results, fields) {
    if(error){
      res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
      //If there is error, we send the error in the error section with 500 status
    } else {
      res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
      //If there is no error, all is good and response is 200OK.
    }
});
});

// Creating a GET route that returns data from the 'templog' table where 1 day graph will be created.
app.get('/1daygraph', function (req, res) {
  // Connecting to the database.
  // Executing the MySQL query (select all data from the 'users' table).
  connection.query(`SELECT temperature as temp, HOUR(timeStamp) as timestamp FROM templog WHERE Date(timeStamp) = Date(CURRENT_TIMESTAMP()) GROUP by time(time_format(timeStamp,'%I'))`, function (error, results, fields) {
    if(error){
      res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
      //If there is error, we send the error in the error section with 500 status
    } else {
      res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
      //If there is no error, all is good and response is 200OK.
    }
});
});


// Creating a POST route that sent temperature data to the 'tempalert' table.
app.post('/alert', (req, res) =>{
let temperature = req.body.temperature;
connection.query("INSERT INTO tempalert SET ? ", { temperature: temperature }, function (error, results, fields) {
  if (error) throw error;
  return res.send({ error: false, data: results, message: 'Temperature Alert Insert' });
})
})

// Creating a GET route that returns all result from the 'tempalert' table.
app.get('/alertresult', function (req, res) {
  // Connecting to the database.
  // Executing the MySQL query (select all data from the 'users' table).
  connection.query(`SELECT temperature as temp, tempalertid as id, TIME_FORMAT(timeStamp, '%h:%i%p') as time FROM tempalert group by time`, function (error, results, fields) {
    if(error){
      res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
      //If there is error, we send the error in the error section with 500 status
    } else {
      res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
      //If there is no error, all is good and response is 200OK.
    }
});
});

// retrieve token from user application
app.post('/token', (req, res) => {
  saveToken(req.body.token.value);
  console.log(`Received push token, ${req.body.token.value}`);
  res.send(`Received push token, ${req.body.token.value}`);
});

// retrieve message from user application
app.post('/message', (req, res) => {
  handlePushTokens(req.body.message);
  console.log(`Received message, ${req.body.message}`);
  res.send(`Received message, ${req.body.message}`);
});


// port server
server.listen(3000);