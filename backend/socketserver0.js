
var express = require('express');
var app = express();
const https = require('https');
const fs = require('fs');
var ip = require('./getup.js')
var address = ip.getip;

var WebSocketServer = require('ws');



// var wss = new WebSocketServer({port: 3000});
const options = {
  key: fs.readFileSync('./private.pem'),
  cert: fs.readFileSync('./public.pem')
};

const hostname = address;

//WebRTC는 https 보안 프로토콜에서 사용이 가능하기때문에
//https로 서버를 생성
var app = express();
const server = https.createServer(options,app).listen(3000,hostname,function(){
  console.log("My Test RTC");
});


var users = {};
// server.listen(3000);
// console.log(server);

// 서버가 연결 되었는 지 확인을 위한 접속주소
//https://${server IP주소}:3000
app.get('/',(req,res)=>{
  res.send('Sever is opend')
})



var wss = new WebSocketServer.Server({server});
//when a user connects to our sever


/*
 이름 : wss
 역할 : 오픈 되있는 웹소켓을 의미한다
 활용 : 항시 3000번포트로 열려있는 서버와 함께 같이 열려 있으면
        유저의 접글 왁인하게되면 connetion을 하게되며 유저의 접근 타입을
        확인하여 적절한 조치를 취해 유저에게 전달 및 소켓에 접근 유저에대한 정보를
        담는 역할을 한다.
        또한 이러한 정보를 담는데 유저의 정보중에 이름과 소켓에 대한 정보를
        Key : value 형태로 보관화여 다른 유저가 해당 유저를 호출했을때
        해당하는 키의 값을 꺼내 데이터를 전달하는 방식으로 사용이 
*/
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
