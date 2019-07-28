<template lang="html">
  <div id="remote">
    <!-- <textarea v-model="message" placeholder="텍스트입" @keyup.page-down=""></textarea>
    <video ref="localVideo" id="localVideo" autoplay playsinline></video>
    <video ref="remoteVideo" id="remoteVideo" autoplay playsinline></video> -->
    <div class="video-list" >
    <div v-for="item in videoList"
            v-bind:video="item"
            v-bind:key="item.id"
            class="video-item">
          <video controls autoplay playsinline ref="videos" :height="cameraHeight" :muted="item.muted" :id="item.id"></video>
        </div>
    </div>
    <input v-model="roomId" placeholder="여기를 수정해보세요">
    <button type="button" class="btn btn-primary" @click="join()">Join</button>
            <button type="button" class="btn btn-primary" @click="leave()">Leave</button>
            <button type="button" class="btn btn-primary" @click="capture()">Capture Photo</button>
            <button type="button" class="btn btn-primary" @click="shareScreen()">Share Screen</button>

    <!-- <div id="ck">
      <button ref="startButton" id="startButton" @click="startAction">Start</button>
      <button ref="callButton" id="callButton" @click="callAction">Call</button>
      <button ref="hangupButton" id="hangupButton" @click="hangupAction">Hang Up</button>
      <v-btn color="primary" @click="sendMessage">text</v-btn> -->
      <!-- startButton.addEventListener('click', startAction);
      callButton.addEventListener('click', callAction);
      hangupButton.addEventListener('click', hangupAction); -->
    </div>
  </div>
</template>


<script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
<script>
import io from 'socket.io-client';

export default {
  name : "remote",
  data(){
    return {
      localVideo : {},
      remoteVideo : {},

      startButton :{},
      callButton : {},
      hangupButton : {},

      //turn 서버 stun 서버 설정

      startTime : null,
      localStream : null,
      remoteStream : null,
      localPeerConnection : null,
      remotePeerConnection :null,

      // 피어에 대한옵션값지정
      peerConnectionOptions : {
        'optional': [{
          'DtlsSrtpKeyAgreement': 'true'
        }]
      },
      //제공하는 사람의
      mediaConstraints : {
          'mandatory': {
            'OfferToReceiveAudio': true,
            'OfferToReceiveVideo': true
          }
        },
      mediaStreamConstraints : {
        video : true
      },

      // socket : io('localhost:2000'),

      rtcmConnection: null,
        localVideo: null,
        videoList: [],
        canvas: null,
    };
  },
  props :{
    roomId: {
        type: String,
        default: 'public-room'
      },
      socketURL: {
        type: String,
        default: 'https://rtcmulticonnection.herokuapp.com:443/'
      },
      cameraHeight: {
        type: [Number, String],
        default: 160
      },
      autoplay: {
        type: Boolean,
        default: true
      },
      screenshotFormat: {
        type: String,
        default: 'image/jpeg'
      },
      enableAudio: {
        type: Boolean,
        default: true
      },
      enableVideo: {
        type: Boolean,
        default: true
      },
      enableLogs: {
        type: Boolean,
        default: false
      },
  },
  mounted() {
    //하단부는 내가 정의 해놓은것
    this.localVideo = this.$refs.localVideo;
    console.log(this.localVideo);
    this.remoteVideo = this.$refs.remoteVideo;
    this.startButton = this.$refs.startButton;
    this.callButton = this.$refs.callButton;
    this.hangupButton = this.$refs.hangupButton;
    // this.callButton.disabled = true;
    // this.hangupButton.disabled = true;
    //----------------------------------

    var that = this;

    this.rtcmConnection = new RTCMultiConnection();
    this.rtcmConnection.socketURL = this.socketURL;
    this.rtcmConnection.autoCreateMediaElement = false;
    this.rtcmConnection.enableLogs = this.enableLogs;
    this.rtcmConnection.session = {
      audio: this.enableAudio,
      video: this.enableVideo
    };
    this.rtcmConnection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: this.enableAudio,
      OfferToReceiveVideo: this.enableVideo
    };
    this.rtcmConnection.onstream = function (stream) {
      let found = that.videoList.find(video => {
        return video.id === stream.streamid
      })
      if (found === undefined) {
        let video = {
          id: stream.streamid,
          muted: stream.type === 'local'
        };
        that.videoList.push(video);
        if (stream.type === 'local') {
          that.localVideo = video;
        }
      }
      setTimeout(function(){
        for (var i = 0, len = that.$refs.videos.length; i < len; i++) {
          if (that.$refs.videos[i].id === stream.streamid)
          {
            that.$refs.videos[i].srcObject = stream.stream;
            break;
          }
        }
      }, 1000);

      that.$emit('joined-room', stream.streamid);
    };
    this.rtcmConnection.onstreamended = function (stream) {
      var newList = [];
      that.videoList.forEach(function (item) {
        if (item.id !== stream.streamid) {
          newList.push(item);
        }
      });
      that.videoList = newList;
      that.$emit('left-room', stream.streamid);
    };
  },
  methods :{
    join() {
   var that = this;
   console.log(this.rtcmConnection);
   this.rtcmConnection.openOrJoin(this.roomId, function (isRoomExist, roomid) {
    if (isRoomExist === false && that.rtcmConnection.isInitiator === true) {
      that.$emit('opened-room', roomid);
    }
  });
},
leave() {
  this.rtcmConnection.attachStreams.forEach(function (localStream) {
    localStream.stop();
  });
  this.videoList = [];
},
capture() {
  return this.getCanvas().toDataURL(this.screenshotFormat);
},
getCanvas() {
  let video = this.getCurrentVideo();
  if (video !== null && !this.ctx) {
    let canvas = document.createElement('canvas');
    canvas.height = video.clientHeight;
    canvas.width = video.clientWidth;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
  const { ctx, canvas } = this;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
},
getCurrentVideo() {
  if (this.localVideo === null) {
    return null;
  }
  for (var i = 0, len = this.$refs.videos.length; i < len; i++) {
    if (this.$refs.videos[i].id === this.localVideo.id)
      return this.$refs.videos[i];
  }
  return null;
},
shareScreen() {
  var that = this;
  if (navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia) {
    function addStreamStopListener(stream, callback) {
      var streamEndedEvent = 'ended';
      if ('oninactive' in stream) {
          streamEndedEvent = 'inactive';
      }
      stream.addEventListener(streamEndedEvent, function() {
          callback();
          callback = function() {};
      }, false);
    }
    function onGettingSteam(stream) {
      that.rtcmConnection.addStream(stream);
      that.$emit('share-started', stream.streamid);
      addStreamStopListener(stream, function() {
        that.rtcmConnection.removeStream(stream.streamid);
        that.$emit('share-stopped', stream.streamid);
      });
    }
    function getDisplayMediaError(error) {
      console.log('Media error: ' + JSON.stringify(error));
    }
    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia({video: true, audio: false}).then(stream => {
        onGettingSteam(stream);
      }, getDisplayMediaError).catch(getDisplayMediaError);
    }
    else if (navigator.getDisplayMedia) {
      navigator.getDisplayMedia({video: true}).then(stream => {
        onGettingSteam(stream);
      }, getDisplayMediaError).catch(getDisplayMediaError);
    }
  }
}



    //--------------- 여기 주석은 내가 공부한것 RTCPeer를 통한 미디어
    //   gotLocalMediaStream(mediaStream) {
    //     console.log(mediaStream);
    //     this.localVideo.srcObject = mediaStream;
    //     this.localStream = mediaStream;
    //     this.callButton.disabled = false;  // Enable call button.
    //   },
    //
    //   // Handles error by logging a message to the console.
    //   handleLocalMediaStreamError(error) {
    //
    //   },
    //
    //   // Handles remote MediaStream success by adding it as the remoteVideo src.
    //   gotRemoteMediaStream(event) {
    //     const mediaStream = event.stream;
    //     this.remoteVideo.srcObject = mediaStream;
    //     this.remoteStream = mediaStream;
    //   },
    //
    //
    //   // Add behavior for video streams.
    //
    //   // Logs a message with the id and size of a video element.
    // logVideoLoaded(event) {
    //     const video = event.target;
    //
    //   },
    //
    //   // Logs a message with the id and size of a video element.
    //   // This event is fired when video begins streaming.
    //   logResizedVideo(event) {
    //     logVideoLoaded(event);
    //
    //     if (startTime) {
    //       const elapsedTime = window.performance.now() - startTime;
    //       startTime = null;
    //
    //     }
    //   },
    //
    //   // localVideo.addEventListener('loadedmetadata', logVideoLoaded);
    //   // remoteVideo.addEventListener('loadedmetadata', logVideoLoaded);
    //   // remoteVideo.addEventListener('onresize', logResizedVideo);
    //
    //
    //   // Define RTC peer connection behavior.
    //
    //   // Connects with new peer candidate.
    //   handleConnection(event) {
    //     const peerConnection = event.target;
    //     console.log("------------------");
    //
    //     console.log(peerConnection);
    //     const iceCandidate = event.candidate;
    //
    //     if (iceCandidate) {
    //       const newIceCandidate = new RTCIceCandidate(iceCandidate);
    //       const otherPeer = this.getOtherPeer(peerConnection);
    //
    //       otherPeer.addIceCandidate(newIceCandidate)
    //         .then(() => {
    //           this.handleConnectionSuccess(peerConnection);
    //         }).catch((error) => {
    //           this.handleConnectionFailure(peerConnection, error);
    //         });
    //
    //
    //     }
    //   },
    //
    //   // Logs that the connection succeeded.
    //    handleConnectionSuccess(peerConnection) {
    //
    //   },
    //
    //   // Logs that the connection failed.
    //   handleConnectionFailure(peerConnection, error) {
    //
    //   },
    //
    //   // Logs changes to the connection state.
    //   handleConnectionChange(event) {
    //     const peerConnection = event.target;
    //     console.log('ICE state change event: ', event);
    //
    //   },
    //
    //   // Logs error when setting session description fails.
    //   setSessionDescriptionError(error) {
    //
    //   },
    //
    //   // Logs success when setting session description.
    //   setDescriptionSuccess(peerConnection, functionName) {
    //     const peerName = getPeerName(peerConnection);
    //
    //   },
    //
    //   // Logs success when localDescription is set.
    //   setLocalDescriptionSuccess(peerConnection) {
    //     setDescriptionSuccess(peerConnection, 'setLocalDescription');
    //   },
    //
    //   // Logs success when remoteDescription is set.
    //   setRemoteDescriptionSuccess(peerConnection) {
    //     setDescriptionSuccess(peerConnection, 'setRemoteDescription');
    //   },
    //
    //   // Logs offer creation and sets peer connection session descriptions.
    //   createdOffer(description) {
    //
    //
    //     this.localPeerConnection.setLocalDescription(description)
    //       .then(() => {
    //         setLocalDescriptionSuccess(this.localPeerConnection);
    //       }).catch(this.setSessionDescriptionError);
    //
    //     this.remotePeerConnection.setRemoteDescription(description)
    //       .then(() => {
    //         setRemoteDescriptionSuccess(this.remotePeerConnection);
    //       }).catch(this.setSessionDescriptionError);
    //
    //     this.remotePeerConnection.createAnswer()
    //       .then(this.createdAnswer)
    //       .catch(this.setSessionDescriptionError);
    //   },
    //
    //   // Logs answer to offer creation and sets peer connection session descriptions.
    //   createdAnswer(description) {
    //
    //     this.remotePeerConnection.setLocalDescription(description)
    //       .then(() => {
    //         setLocalDescriptionSuccess(this.remotePeerConnection);
    //       }).catch(this.setSessionDescriptionError);
    //
    //
    //     this.localPeerConnection.setRemoteDescription(description)
    //       .then(() => {
    //         setRemoteDescriptionSuccess(this.localPeerConnection);
    //       }).catch(this.setSessionDescriptionError);
    //   },
    //
    //
    //   // Define and add behavior to buttons.
    //
    //   // Define action buttons.
    //
    //
    //   // Set up initial action buttons status: disable call and hangup.
    //
    //
    //
    //   // Handles start button action: creates local MediaStream.
    //   startAction() {
    //     this.startButton.disabled = true;
    //     navigator.mediaDevices.getUserMedia({video : true,audio : true})
    //     .then(this.gotLocalMediaStream).catch(this.handleLocalMediaStreamError);
    //   },
    //
    //   // Handles call button action: creates peer connection.
    //   callAction() {
    //     this.callButton.disabled = true;
    //     this.hangupButton.disabled = false;
    //     this.startTime = window.performance.now();
    //     // 외부 상대방에게 보낼 내 오디오와 비디오 스트림 정보값 추출
    //     // 따로 나눠서 보관
    //     const videoTracks = this.localStream.getVideoTracks();
    //     const audioTracks = this.localStream.getAudioTracks();
    //     if (videoTracks.length > 0) {
    //
    //     }
    //     if (audioTracks.length > 0) {
    //
    //     }
    //     //서버변수를 담을 서버의 설정값들을 담을 서버 변수 생성
    //     const servers = null;
    //
    //     // Create peer connections and add behavior.
    //     this.localPeerConnection = new RTCPeerConnection(servers);
    //     console.log(this.localPeerConnection);
    //
    //     this.localPeerConnection.addEventListener('icecandidate', this.handleConnection);
    //     this.localPeerConnection.addEventListener(
    //       'iceconnectionstatechange', this.handleConnectionChange);
    //
    //     this.remotePeerConnection = new RTCPeerConnection(servers);
    //     console.log(this.remotePeerConnection);
    //     this.remotePeerConnection.addEventListener('icecandidate', this.handleConnection);
    //     this.remotePeerConnection.addEventListener(
    //       'iceconnectionstatechange', this.handleConnectionChange);
    //       this.remotePeerConnection.addEventListener('addstream', this.gotRemoteMediaStream);
    //
    //     // Add local stream to connection and create offer to connect.
    //     this.remotePeerConnection.addEventListener('addstream', this.gotRemoteMediaStream);
    //     console.log(this.remotePeerConnection);
    //     this.localPeerConnection.addStream(this.localStream);
    //
    //     this.localPeerConnection.createOffer(this.offerOptions)
    //       .then(this.createdOffer).catch(this.setSessionDescriptionError);
    //   },
    //
    //   // Handles hangup action: ends up call, closes connections and resets peers.
    //   hangupAction() {
    //     this.localPeerConnection.close();
    //     this.remotePeerConnection.close();
    //     this.localPeerConnection = null;
    //     this.remotePeerConnection = null;
    //     this.hangupButton.disabled = true;
    //     this.callButton.disabled = false;
    //
    //   },
    //
    //   // Add click event handlers for buttons.
    //
    //
    //
    //   // Define helper functions.
    //
    //   // Gets the "other" peer connection.
    //   getOtherPeer(peerConnection) {
    //     return (peerConnection === this.localPeerConnection) ?
    //         this.remotePeerConnection : this.localPeerConnection;
    //   },
    //
    //   // Gets the name of a certain peer connection.
    //    getPeerName(peerConnection) {
    //     return (peerConnection === this.localPeerConnection) ?
    //         'localPeerConnection' : 'remotePeerConnection';
    //   },
    //
    //   // Logs an action (text) and the time when it happened on the console.


  }
}
</script>

<style lang="css" scoped>
</style>
