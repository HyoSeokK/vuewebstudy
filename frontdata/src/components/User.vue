<template>
  <div class="blue lighten-3 pa-3">
    <h1>User 컴포넌트</h1>
    <p>이름: {{name}}</p>
    <v-btn @click="changeName()">이름변경</v-btn>
    <hr>
    <v-layout row wrap>
      <v-flex xs12 sm6>
        <UserDetail
        :name="name"
        :address="address"
        :phone="phone"
        :hasDog="hasDog"
        ></UserDetail>
      </v-flex>
      <v-flex xs12 sm6>
        <UserEdit
        :name="name"
        :address="address"
        :phone="phone"
        :hasDog="hasDog"
        @child="parents"
        ></UserEdit>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import UserDetail from "./UserDetail.vue"
import UserEdit from "./UserEdit.vue"

export default {
  components: {
    UserDetail,
    UserEdit
  },
  data(){
    return{
      name : "강효석",
      address :"경기도",
      phone : "123-123",
      hasDog : true
    }
  },
  methods :{
    changeName(){
      this.name = "영석이";
    },
    parents(user){
      console.log("부모가 받았음");
      this.name = user.name
      this.address = user.address
      this.phone = user.phone
      this.hasDog = user.hasDog
    }
  }
}
</script>
