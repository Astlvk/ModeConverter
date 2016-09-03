import Vue from 'vue'
import mainView from './component/mainView'
new Vue({
  data: {
    message: 'Hello Vue2.0',
  },
  components: {
    mainView,
  }
}).$mount('#app');
