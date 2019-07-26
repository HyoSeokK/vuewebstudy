var WebSocketServer = require('ws');
var express = require('express');
var app = express();
const https = require('https');
const fs = require('fs');
var ip = require('./getup.js')
var address = ip.getip;




// var wss = new WebSocketServer({port: 3000});
const options = {
  key: fs.readFileSync('./private.pem'),
  cert: fs.readFileSync('./public.pem')
};
const hostname = address;
const server = https.createServer(options,app).listen(3000,hostname,function(){
  console.log("My Test RTC");
});


var users = {};
// server.listen(3000);
// console.log(server);
app.get('/',(req,res)=>{
  res.send('dadadadaa')
})
var wss = new WebSocketServer.Server({server});
//when a user connects to our sever

wss.on('connection', function(connection) {
  //accepting only JSON messages
  console.log("User connected");

    //when server gets a message from a connected user
    connection.on('message', function(message) {
       var data;
       //accepting only JSON messages
       try {
          data = JSON.parse(message);
       } catch (e) {
          console.log("Invalid JSON");
          data = {};
       }

       //switching type of the user message
       switch (data.type) {
          //when a user tries to login
          case "login":
             console.log("User logged", data.name);

             //if anyone is logged in with this username then refuse
             if(users[data.name]) {
                sendTo(connection, {
                   type: "login",
                   success: false
                });

             } else {
                //save user connection on the server
                users[data.name] = connection;

                connection.name = data.name;

                sendTo(connection, {
                   type: "login",
                   success: true
                });
             }

             break;

          case "offer":
             //for ex. UserA wants to call UserB
             console.log("Sending offer to: ", data.name);

             //if UserB exists then send him offer details
             var conn = users[data.name];
             if(conn != null) {
                //setting that UserA connected with UserB
                connection.otherName = data.name;
                sendTo(conn, {
                   type: "offer",
                   offer: data.offer,
                   name: connection.name
                });
                console.log(connection.name);
                console.log(connection.otherName);
             }
             console.log();
             break;

          case "answer":
             console.log("Sending answer to: ", data.name);
             //for ex. UserB answers UserA
             var conn = users[data.name];

             if(conn != null) {
                connection.otherName = data.name;

                sendTo(conn, {
                   type: "answer",
                   answer: data.answer
                });
             }

             break;

          case "candidate":
             console.log("Sending candidate to:",data.name);
             var conn = users[data.name];

             if(conn != null) {
                sendTo(conn, {
                   type: "candidate",
                   candidate: data.candidate
                });
             }

             break;

          case "leave":
             console.log("Disconnecting from", data.name);
             var conn = users[data.name];
             conn.otherName = null;
             //notify the other user so he can disconnect his peer connection
             if(conn != null) {
                sendTo(conn, {
                   type: "leave"
               });
             }

             break;

          default:
             sendTo(connection, {
                type: "error",
                message: "Command not found: " + data.type
             });
             break;
       }

    });

    //when user exits, for example closes a browser window
    //this may help if we are still in "offer","answer" or "candidate" state
    connection.on("close", function() {

       if(connection.name) {
          delete users[connection.name];

          if(connection.otherName) {
             console.log("Disconnecting from ", connection.otherName);
             var conn = users[connection.otherName];
             conn.otherName = null;
             if(conn != null) {
                sendTo(conn, {
                   type: "leave"
                });
             }
          }
       }

    });

    connection.send("Hello world");
});
function sendTo(connection, message) {
   connection.send(JSON.stringify(message));
}
