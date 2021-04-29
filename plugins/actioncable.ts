import Vue from "vue";
import Actioncable from "actioncable";

Vue.use({
  install(vue, options) {
    vue.prototype.$createConnection = func => {
      let cable: Actioncable.Cable = Actioncable.createConsumer(
        "wss://crime-spotter-backend.herokuapp.com/news"
      );
      let channel: Actioncable.Channel = cable.subscriptions.create("NewsChannel", {
        received: func
      });
      return { cable, channel };
    };
  }
});
