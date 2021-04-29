import { Module, VuexModule, MutationAction } from "vuex-module-decorators";

@Module({
  name: "ip",
  stateFactory: true,
  namespaced: true
})
export default class IpDate extends VuexModule {
  _data: any = {};

  @MutationAction({ mutate: ["_data"] })
  async setData(data) {
    return { _data: data };
  }

  get data() {
    return this._data;
  }
}
