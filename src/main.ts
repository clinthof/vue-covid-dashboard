import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios, { AxiosResponse } from "axios";
import firebase from "firebase/app"
import "firebase/firestore";
import VueApexCharts from "vue-apexcharts";
import vuetify from './plugins/vuetify';

const firebaseConfig = {
    apiKey: "AIzaSyD95stmw5vFjSxO-KR7NlyXbR8JzK1JVi4",
    authDomain: "midterm2-a8474.firebaseapp.com",
    projectId: "midterm2-a8474",
    storageBucket: "midterm2-a8474.appspot.com",
    messagingSenderId: "312109534935",
    appId: "1:312109534935:web:8562f250d3fb6fd6e3aa92"
}
firebase.initializeApp(firebaseConfig);
Vue.prototype.$appDB = firebase.firestore();

Vue.config.productionTip = false
Vue.use(VueApexCharts);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
