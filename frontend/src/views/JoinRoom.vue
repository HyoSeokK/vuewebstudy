<template>

  <div id="join">
      <div ref="loginpage" id="loginpage" v-bind:style="{display:login}">
        <v-app>
          <p><input v-model="usernameInput"> </p>
          <v-app id="inspired">
            <v-content>
              <v-container
                fluid
                fill-height
              >
                <v-layout
                  align-center
                  justify-center
                >
                  <v-flex
                    xs12
                    sm8
                    md4
                  >
                    <v-card class="elevation-12">

                      <v-toolbar
                        color="primary"
                        dark
                        flat
                      >
                        <v-toolbar-title>Login form</v-toolbar-title>
                        <v-spacer></v-spacer>


                      </v-toolbar>
                      <v-card-text>
                        <v-form>
                          <v-text-field
                            label="Login"
                            name="login"
                            v-model="usernameInput"
                            prepend-icon="person"
                            type="text"
                          ></v-text-field>
                        </v-form>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn small  @click="logginbtn()">나 등록</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-content>
          </v-app>
        </v-app>
      </div>

        <div id="callpage" ref="callpage" v-bind:style="{display:call}">
          <template>
          <v-app id="inspire">

            <v-content>
              <v-container
              fill-height
              justify-center
              align-center>
                <v-layout class="xs4" color="black">
                   <div id="log" ref="log" class="xs12" style="width:800px;">
                     <div
                         class="hide-overflow"
                         style="position: relative;"
                       >
                         <v-toolbar
                           absolute
                           color="teal lighten-3"
                           dark
                           scroll-target="#scrolling-techniques"
                         >

                           <v-toolbar-title>채팅창</v-toolbar-title>

                           <v-spacer></v-spacer>
                         </v-toolbar>
                         <div
                           id="scrolling-techniques"
                           style="max-height: 950px;"
                         >
                           <v-container style="height: 1000px;">
                             <v-container grid-list-xs,sm,md,lg,xl
                             class="ma-3 overflow-y-auto"
                             style="height: 800px;">

                              <span v-html="rawHtml"></span>

                           </v-container>
                                <v-flex>
                                    <td>
                                      <v-text-field
                                        label="채팅창"
                                        v-model="chatdata"
                                        name="name"
                                        class="xs10"
                                        style="width:600px"
                                       @keydown.enter="sendmsg()">
                                    </v-text-field>
                                    </td>
                                    <td class="text-xs-right"></v-text-field><v-btn class="xs2" color="primary" @click="sendmsg()">전송</v-btn></td>
                                  </v-flex>
                           </v-container>
                         </div>
                       </div>
                   </div>

                </v-layout>
                <v-layout
                class="xs8"
                  justify-center
                  align-center
                >
                  <v-flex shrink>
                      <video ref="localVideo" id="localVideo" autoplay></video>
                      <video ref="remoteVideo" id="remoteVideo" autoplay></video>
                      <div class="my-7">
                        <v-text-field
                          label="Callfriendname"
                          v-model="callToUsernameInput"
                          name="name"
                        ></v-text-field>
                      </div>
                      <div class="my-2">
                        <v-btn small  @click="callbuttonclick()">전화</v-btn>
                      </div>
                      <div class="my-2">
                        <v-btn  small  @click="leave()">끊기</v-btn>
                      </div>
                      <div id="sc" ref="sc" v-bind:style="{display:sc}">
                        <div class="my-2">
                          <v-btn  small  @click="changesharescreen()">화면공유</v-btn>
                        </div>
                      </div>
                      <div id="vdi" ref="vdi" v-bind:style="{display:vdi}">
                        <div class="my-2">
                          <v-btn  small  @click="changewebcam()">웹캠송출</v-btn>
                        </div>
                      </div>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-content>
          </v-app>
        </template>
        </div>
    </div>

</template>

<script>
export default {
  name:'Join',
  data(){
    return {
      usernameInput : '',
      callToUsernameInput : '',
      name : '',
      connectedUser : '',
      conn : new WebSocket('wss://221.155.250.192:3000'),
      chatlog : '1212',
      chatdata : '',

      sendchannel : null,
      dataChannel : null,

      reply : null,
      talk : null,


      login:'block',
      call : 'none',

      localvideo : this.$refs.localVideo,
      remoteVideo : this.$refs.remoteVideo,

      yourConn : null,

      stream : null,
      webcamStream : null,

      dataConstraint :null,

      receiveChannel : null,
      dataChannelOptions : {
                        ordered: false, // do not guarantee order
                        maxPacketLifeTime: 3000, // in milliseconds
                        },
      content : this.$refs.content,
      status : 'v',
      rawHtml : ``,

      sc : 'block',
      vdi : 'none',
      shareoption : {
              	audio: false,
              	video: {
                  	mandatory: {
                      	chromeMediaSource: 'desktop',
                      	maxWidth: 1280,
                      	maxHeight: 720
                  	},
                  	optional: [{

                    }]
              	}
          	},

          };
        },
  methods : {

    socketcon(msg){
      var data = JSON.parse(msg.data);
      console.log("Got message", msg.data);
      switch(data.type) {
         case "login":
            this.handleLogin(data.success);
            break;
         //when somebody wants to call us
         case "offer":
            this.handleOffer(data.offer, data.name);
            break;
         case "answer":
            this.handleAnswer(data.answer);
            break;
         //when a remote peer sends an ice candidate to us
         case "candidate":
            this.handleCandidate(data.candidate);
            break;
         case "leave":
            this.handleLeave();
            break;
         default:
            break;
      }
    }
    ,

    send(message) {
   //attach the other peer username to our messages
     if (this.connectedUser) {
        message.name = this.connectedUser;
     }
     this.conn.send(JSON.stringify(message));
   },

    logginbtn(){
          this.name = this.usernameInput;
          if (this.name.length > 0) {
          this.send({
             type: "login",
             name: this.name
          });
       }
     },

      callbuttonclick(){
        var callToUsername = this.callToUsernameInput;
        console.log(callToUsername);
        if (callToUsername.length > 0) {

              this.connectedUser = callToUsername;

              // create an offer
              this.yourConn.createOffer(this.offersend, function (error) {
                 alert("Error when creating an offer");
              });
              console.log(this.yourConn.createOffer);
           }

      },
      offersend(offer){
        // console.log("진입점 1");
        this.send({
           type: "offer",
           offer: offer
        });
        // console.log("진입점 2");
        this.yourConn.setLocalDescription(offer);
        // console.log("진입점 3");
      },

      handleOffer(offer, name) {
       this.connectedUser = name;
       this.yourConn.setRemoteDescription(new RTCSessionDescription(offer));
       //create an answer to an offer
       this.yourConn.createAnswer(this.answerRecive, function (error) {
          alert("Error when creating an answer");
       });
    },

    answerRecive(answer){
      this.yourConn.setLocalDescription(answer);
      this.send({
         type: "answer",
         answer: answer
      });
    },


    handleAnswer(answer) {
       this.yourConn.setRemoteDescription(new RTCSessionDescription(answer));
    },

     handleCandidate(candidate) {
       this.yourConn.addIceCandidate(new RTCIceCandidate(candidate));
    },




       changewebcam(){
        let stream = null;
        stream = this.webcamStream;

        console.log("-------");
        // let resolvedata = this.getdata(stream);

        this.changess(stream);
        this.sc = 'block';
        this.vdi = 'none';
      },

      async changesharescreen(){
        let stream = null;
        stream = await navigator.mediaDevices.getDisplayMedia({audio:true,video:true});
        let resolvedata = stream;
        console.log("-------");
        // let resolvedata = this.getdata(stream);
        console.log(resolvedata);
        this.changess(resolvedata);
        this.sc = 'none';
        this.vdi = 'block';
      },

      changess(myStream){
        this.yourConn.removeStream(this.stream);
        this.stream = myStream;
        console.log("1에러위치");
        this.localvideo.srcObject = myStream;
        console.log("2에러위치");
        // this.localvideo.src = window.webkitURL.createObjectURL(this.stream);
        console.log("2에러위치");
        this.yourConn.addStream(this.stream);
        console.log("3에러위치");
        this.yourConn.createOffer(this.offersend, function (error) {
           alert("Error when creating an offer");
        });
        console.log(this.yourConn);
      },
      /*
        이름 : handleLogin
        역할 : 유저가 로그인을 하게 되면 소켓에서 로그인을 허가하는 판정을 받고 해당하는


      */
      handleLogin(success) {
       if (success === false) {
          alert("Ooops...try a different username");
       } else {
          //**********************
          //Starting a peer connection
          //**********************
          //getting local video stream
          this.login='none';
          this.call = 'block';

          navigator.webkitGetUserMedia({ video: true, audio: true },this.getmystream, function (error) {
                 console.log(error);
              });

           }
        },
       getmystream(myStream) {
         this.stream = myStream;
         console.log(myStream.id);
         console.log(myStream);
         this.webcamStream = myStream;
         //displaying local video stream on the page
         this.localvideo.srcObject = this.stream;
         //using Google public stun server
         var configuration = {
            "iceServers": [
              {
                'urls': [
                  'stun:stun.l.google.com:19302',
                  'stun:stun1.l.google.com:19302',
                  'stun:stun2.l.google.com:19302'
                ]
              },
              {
                'urls': 'turn:107.150.19.220:3478?transport=udp',
                'credential': 'turnserver',
                'username': 'subrosa'
              },
              {
                'urls': 'turn:221.155.250.192:3478?transport=tcp',
                'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                'username': '28224511:1379330808'
              }
            ]
         };
         this.yourConn = new webkitRTCPeerConnection(configuration);
         // setup stream listening
         this.yourConn.addStream(this.stream);

         //when a remote user adds stream to the peer connection, we display it
         this.yourConn.onaddstream = this.getremotescreen;
         // Setup ice handling


         this.yourConn.ondatachannel = this.getchatdata;

         this.sendchannel = this.yourConn.createDataChannel('sendDataChannel',this.dataConstraint);
         this.yourConn.onicecandidate = this.getevent;

         // console.log("정보파악 : ");
         // console.log(this.yourConn);
         // console.log("정보파악 : ");
         // console.log(this.sendchannel);

      },

      getchatdata(event){
        // console.log("오픈더게이트");
        this.receiveChannel = event.channel;
        this.receiveChannel.onmessage  = this.inputdata;
      },
      inputdata(event){
        // console.log("데이타 들옴");
        this.chatlog = this.chatlog + event.data +'\n';

        this.rawHtml = this.rawHtml  + "<p>"+ this.connectedUser+ ":"+ event.data+"<p>";
      },

      sendmsg(){
        // console.log("뿅뿅");
        var log = this.chatlog;
        var data = this.chatdata;
        var channel = this.sendchannel;
        // console.log(this.sendchannel.onopen);
        this.sendchannel.onopen = function(channel,log,data){
          // console.log("안들어오냐9");
          var val = this.chatdata;
          // console.log(val);
          log = this.chatlog + val +'\n';
          channel.send(val);
          data = '';
        };
        this.sendchannel.send(data)
        this.chatlog = this.chatlog + data +'\n';
        this.rawHtml = this.rawHtml  + "<p>"+ "나임" + ":"+ data +"<p>";
        this.chatdata = '';

        // var val = this.chatdata;
        // console.log(val);
        // this.chatlog = this.chatlog + val +'\n';
        // this.sendchannel.send(val);
        // this.chatdata = '';
      },
      msgin(event){
        var val = this.chatdata;
        // console.log(val);
        this.chatlog = this.chatlog + val +'\n';
        this.rawHtml = this.rawHtml  + "<p>"+ "나임" + ":"+ event.data+"<p>";
        this.sendchannel.send(val);
        this.chatdata = '';
      },
      getremotescreen(Rstream){
        this.remoteVideo.srcObject = Rstream.stream;
      },

      getevent(event){
        if (event.candidate) {
           this.send({
              type: "candidate",
              candidate: event.candidate
           });
        }
      },

      leave(){
        this.send({
            type: "leave"
         });
         this.handleLeave();
      },

      handleLeave() {
         this.connectedUser = null;
         this.remoteVideo.srcObject = null;
         this.yourConn.onaddstream = null;
         this.yourConn.onicecandidate = null;
         this.yourConn.close();


         // console.log("꺼짐 ㅅㄱ");
      },


  },
  mounted (){
    this.localvideo = this.$refs.localVideo;
    this.remoteVideo = this.$refs.remoteVideo;
    this.conn.onmessage = this.socketcon;
    // console.log(this.login);
    this.conn.onerror = function (err) {
       console.log("Got error", err);
    };


  },
  created () {
    },

  }

</script>

<style lang="css" scoped>
#keep  .v-navigation-drawer__border{
    display: none
    }
body {
  text-align: center;
   background: #eee;
   padding: 5% 0;
}

video {
   background: black;
   border: 1px solid gray;
}
.call-page {
   align-content: center;
   position: relative;
   margin: 0 auto;
   width: 500px;
   height: 500px;
}
#localVideo {
   width: 150px;
   height: 150px;
   /* position: absolute; */
}

#remoteVideo {
   width: 500px;
   height: 500px;
}
</style>
