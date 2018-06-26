/* eslint no-unused-vars: [0] */
import Vue from 'vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

import template from './template.html';
import './style.styl';

Vue.config.productionTip = false;

const app = new Vue({
  el: '#app',
  router,
  store,
  template,
});
