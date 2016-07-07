import Vue from 'vue/dist/vue.js'
import converter from './component/converter'
const app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue2.0',
  },
  components: {
    converter,
  }
});
