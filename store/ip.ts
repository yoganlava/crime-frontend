import { Module, VuexModule, MutationAction } from "vuex-module-decorators";

@Module({
  name: "ip",
  stateFactory: true,
  namespaced: true
})
export default class IpData extends VuexModule {
  _data: any = {};

  // Set ip data
  @MutationAction({ mutate: ["_data"] })
  async setData(data) {
    return { _data: data };
  }
  // return ip data
  get data() {
    return this._data;
  }
}
