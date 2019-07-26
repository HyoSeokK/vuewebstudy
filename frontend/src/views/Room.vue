<template>
  <div id="Room">

        <div><video ref="video" id="video" width="640" height="480" autoplay></video></div>
        <v-btn color="primary" @click="clickvideo()">text</v-btn>
        <div><button id="snap" v-on:click="capture()">Snap Photo</button></div>
        <canvas ref="canvas" id="canvas" width="640" height="480"></canvas>
        <ul>
            <li v-for="c in captures">
                <img v-bind:src="c" height="50" />
            </li>
        </ul>

  </div>

</template>

<script>
export default {
  name: 'Room',
  data () {
    return {
      //
      video: {},
      canvas: {},
      captures: []
    }
  },
  mounted() {

  },
  methods: {
      clickvideo(){
        this.video = this.$refs.video;
        console.log('this is mounted');
        console.log(this.video);
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true,audio:true }).then(stream => {
                this.video.srcObject = stream;
                console.log(this.video);
                this.video.play();
            });
        }
      },
      capture() {
          this.canvas = this.$refs.canvas;
          var context = this.canvas.getContext("2d").drawImage(this.video, 0, 0, 640, 480);
          this.captures.push(canvas.toDataURL("image/png"));
        }
      }
}
</script>

<style lang="css" scoped>

</style>
