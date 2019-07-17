<template>
  <div class="hi">
    <vue-webrtc width="100%" roomId="roomId">
    </vue-webrtc>
  </div>
</template>

<script>
import User from "./components/User"

export default {
  name: "App",
  components: {
    User
  }
}
</script>
