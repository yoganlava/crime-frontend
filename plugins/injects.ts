import Actioncable from "actioncable";

declare module "vue/types/vue" {
  interface Vue {
    $http: any;
    $toast: any;
    $createConnection: (Function) => { cable: Actioncable.Cable, channel: Actioncable.Channel };
  }
}
