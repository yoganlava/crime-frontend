import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import IpData from '~/store/ip'

let ipData: IpData

function initialiseStores(store: Store<any>): void {
  ipData = getModule(IpData, store)
}

export { initialiseStores, ipData }