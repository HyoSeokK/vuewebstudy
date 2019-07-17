<template>
  <div id = 'app'>
    <div class="container">
      <div class="col-md-6 offset-md-3">

      <h1 class="text-center">To do 어플리케이션</h1>
      <input type="text" class="form-control" v-model="userinput" @keyup.enter="addnewTodo">
      {{userinput}}
      <div class="list-group">
        <template v-for="item in activelidt">
          <WorkList :label="item.label" @componentClick="toggleClear(item)"/>

        </template>
        <button type="button" class="btn btn-sm" @click="changeState('active')">할일</button>
        <button type="button" class="btn btn-sm" @click="changeState('done')">완료</button>
        <button type="button" class="btn btn-sm" @click="changeState('all')">전체</button>
      </div>
    </div>

  </div>
  </div>
</template>

<script>
import WorkList from './WorkList';

export default {
  name: "app",

  data(){
    return {
      userinput:'',
      todoList: [],
      currentstate :'actvie'
    }
  },
  computed:{
    activelidt(){
      // return this.todoList.filter(item => item.state ==='active')
      return this.todoList.filter(item => this.currentstate ==='all' || item.state === this.currentstate)
    }
  },
  methods:{
    changeState(state){
      this.currentstate = state;
    },
    addnewTodo(){
        this.todoList.push({
          label : this.userinput,
          state : 'active'
        });
        this.userinput='';
    },
    toggleClear(todo){
      todo.state = todo.state === 'active' ? 'done' : 'active';
    }
  },
  components : {
    WorkList
  }

}
</script>
