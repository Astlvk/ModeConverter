import Vue from 'vue/dist/vue.js'
import mainView from './component/mainView'
const app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue2.0',
  },
  components: {
    mainView,
  }
});
