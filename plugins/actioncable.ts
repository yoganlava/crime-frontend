import Vue from "vue";
import ActionCableVue from "actioncable-vue";

Vue.use(ActionCableVue, {
  debug: true,
  debugLevel: "error",
  connectionUrl: "wss://crime-spotter-backend.herokuapp.com/news",
  // connectionUrl: 'ws://localhost:3000/news',
  connectImmediately: true
});
