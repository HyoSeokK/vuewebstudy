<template>
  <div class="red lighten-3 pa-3" >
    <v-list>
      <v-list-tile avatar>
        <v-list-tile-content>
          이름 :
        </v-list-tile-content>
        <v-list-tile-content class="align-end">
          {{name}}
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile avatar>
        <v-list-tile-content>
          주소 :
        </v-list-tile-content>
        <v-list-tile-content class="align-end">
          {{address}}
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile avatar>
        <v-list-tile-content>
          전화번호 :
        </v-list-tile-content>
        <v-list-tile-content class="align-end">
          {{phone}}
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile avatar>
        <v-list-tile-content>
          반려견유무 :
        </v-list-tile-content>
        <v-list-tile-content class="align-end">
          {{hasDog}}
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </div>

</template>

<script>
import {eventBus} from "../main"
  export default{
    props:['name','address','phone','hasDog'],
    data(){
      return{
        editedDate : null
      }
    },
    computed: {
      hasDogKr(){
        return this.hasDog === true ? '있음' : '없음'
      }
    },
    created(){
      eventBus.$on('userWasEdited',date=>{
        this.editedDate =date
      })
    }
  }
</script>
