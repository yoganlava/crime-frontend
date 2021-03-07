import { Plugin } from '@nuxt/types'

declare module 'vue/types/vue' {
  interface Vue {
    $http: any
  }
}
