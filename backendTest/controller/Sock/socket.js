/*
*  name : socket.js
*  역할 : Vue js 에서 요청을 받아 roomid를 저장 해놨다 사람이 접근할시 해당 유저에게 정보전달 및 유저끼리 연결 시켜주는 역할
*  변수 : rooms : 현재있는 방에 수
*        roomId : 해당하는 방에 ID 즉 peear끼리 연결 할때 사용된 ID를 말한다.\
*  ※실습 주의사항※
*  해당 예제는 WebRTC 연구실의 있는 예제를 따라하여서 제작 하였고 어느정도 첨삭을 하여 작성 할에정입니다
*  해당에 사용되는 자바스크립트는 ES6의 규격으로 보이며 ES6의 자바스크립트와 타입스크립트를 어느정도 익히고
*  보시는것을 추천합니다
*  http 인자는 서버로 부터 받는 현재 오픈된 서버의 정보를 받아오는 인자값입니다.
*  서버의 모든 기능을 받아와야하기때문에 만약에 https의 경우에는 키값 까지 전부 받아와야합니다.
*
*
*/

module.exports = (http) =>{
  console.log(http);
  const io = require('socket.io')(http);
  var os = require('os');
  var static = require('node-static');
  let rooms ={};
  let roomId =null;
  let socketIds ={};

  function findRoomBySocketId(value) {
      console.log("Room in comming?");
      const arr = Object.keys(rooms);
      let result = null;

      for (let i=0; i < arr.length; i++) {
        if (rooms[arr[i]][value]) {
          result = arr[i];
          break;
        }
      }
      return result;
  }

  io.on('connection', (socket) => {
    // 룸접속
    // convenience function to log server messages on the client
    console.log("접근 확인");
     function log(){
 		var array = [">>> Message from server:"];
         array.push.apply(array, arguments);
 	    io.emit('log', array);
 	}

 	io.on('message', function (message) {
 		log('Client said:', message);
         // for a real app, would be room only (not broadcast)
 		io.broadcast.emit('message', message);
 	});

 	io.on('create or join', function (room) {
         log('Request to create or join room ' + room);

 		var numClients = io.sockets.clients(room).length;
 		log('Room ' + room + ' has ' + numClients + ' client(s)');

 		if (numClients === 0){
 			io.join(room);
 			io.emit('created', room, socket.id);

 		} else if (numClients === 1) {
 			io.join(room);
             io.emit('joined', room, socket.id);
             io.sockets.in(room).emit('ready');

 		} else { // max two clients
 			io.emit('full', room);
 		}
 	});

     io.on('ipaddr', function () {
         var ifaces = os.networkInterfaces();
         for (var dev in ifaces) {
             ifaces[dev].forEach(function (details) {
                 if (details.family=='IPv4' && details.address != '127.0.0.1') {
                     io.emit('ipaddr', details.address);
                 }
           });
         }
     });


  });


};
