import Vue from 'vue';
import {DatePicker} from 'element-ui';
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale'
import App from './App.vue';


// configure language
locale.use(lang);
Vue.use(DatePicker, {locale});



new Vue({
  el: '#app',
  render: h => h(App)
})
