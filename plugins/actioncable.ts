import Vue from "vue";
import Actioncable from "actioncable";

Vue.use({
  install(vue, options) {
    vue.prototype.$createConnection = func => Actioncable.createConsumer("wss://crime-spotter-backend.herokuapp.com/news").subscriptions.create("NewsChannel", {
      received: func
    });
  }
})