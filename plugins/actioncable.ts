import Vue from 'vue';
import ActionCableVue from 'actioncable-vue';

Vue.use(ActionCableVue, {
    debug: true,
    debugLevel: 'error',
    connectionUrl: 'wss://crime-spotter-backend.herokuapp.com/news',
    connectImmediately: true,
  });
  