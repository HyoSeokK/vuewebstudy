<template>
  <div class="yellow lighten-3 pa-3">
    <h3>회원 정보를 수정할 수 있습니다.</h3>
    <p>수정사항</p>
    <v-flex xs12 sm6 md3>
          <v-text-field
            label="이름"
            v-model="user.name"
          ></v-text-field>
      </v-flex>
      <v-flex xs12 sm6 md3>
            <v-text-field
              label="주소"
              v-model="user.address"
            ></v-text-field>
        </v-flex>
        <v-flex xs12 sm6 md3>
              <v-text-field
                label="전화번호"
                v-model="user.phone"
              ></v-text-field>
          </v-flex>
          <v-flex xs12 sm6 md3>
            <v-radio-group label="반려견유무" v-model="user.hasDog">
                <v-radio
                 label="반려견있음"
                 :value="true">
                </v-radio>
                <v-radio
                 label="반려견없음"
                 :value="false">
                </v-radio>
            </v-radio-group>
            <v-btn color="primary" @click="changeUser()">수정완료</v-btn>
            </v-flex>
  </div>
</template>

<script>
import {eventBus} from "../main"
export default{
  props :["name","address","phone","hasDog"],
  data(){
      return{
        user : {

        }
      }
  },
  created(){
    this.user.name = this.name
    this.user.address = this.address
    this.user.phone = this.phone
    this.user.hasDog = this.hasDog
  },
  methods:{
    changeUser(){
      console.log(this.user);
      this.$emit("child",this.user) // 부모컴포넌트한테 신호를 보냄
      eventBus.$emit("userWasEdited",new Date())
    }
  }
}
</script>
