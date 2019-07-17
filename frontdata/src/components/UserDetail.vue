<template>
  <div class="red lighten-3 pa-3">
    <h3>자세한 회원 정보를 확인합니다.</h3>
    <p>이름 : {{nameOfchild}}</p>
  </div>
</template>

<script>
  export default{
    props:['nameOfchild'],
    data(){
      return{

      }
    }
  }
</script>
