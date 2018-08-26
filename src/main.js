import Vue from 'vue';
import {DatePicker} from 'element-ui';
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';
import vCalendar from 'v-calendar';
// import 'v-calendar/lib/v-calendar.min.css';
import App from './App.vue';

//Use v-calendar, v-date-picker & v-popover components
Vue.use(vCalendar, {
  firstDayOfWeek: 1
});

// configure language
locale.use(lang);
Vue.use(DatePicker, {locale});



new Vue({
  el: '#app',
  render: h => h(App)
})
