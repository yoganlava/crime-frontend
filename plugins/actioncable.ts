import Vue from 'vue';
import ActionCableVue from 'actioncable-vue';

Vue.use(ActionCableVue, {
    debug: true,
    debugLevel: 'error',
    connectionUrl: process.env.WEBSOCKET_URL || 'ws://localhost:3000/news',
    connectImmediately: true,
  });
  