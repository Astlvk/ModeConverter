// import Vue from 'vue/dist/vue.js'
import Vue from 'vue'
import mainView from './component/mainView'
const vm = Vue.extend(mainView)
new vm().$mount('#app')
// new Vue({
//   data: {
//     message: 'Hello Vue2.0',
//   },
//   components: {
//     mainView,
//   }
// }).$mount('#app');
// 使用vue.common.js 配合vue-loader，直接创建根vue实例无法正常挂载。
// 页面提示 Vue 2.0: [Vue warn]: Failed to mount component:
// template or render function not defined. (found in root instance)
// 需要变通的使用Vue.extend()来扩展.vue文件的组件
// 然后再通过extend的返回值创建vue实例.
// 使用vue/dist/vue.js则不会有问题，不过若是配合webpack-dev-server的hot模式
// 则不能正常使用vue的一系列相关插件，vue插件无法被注入到实例中。
