import Vue from 'vue'
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
