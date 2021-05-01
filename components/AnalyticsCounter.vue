<template>
  <div
    class="dark:bg-gray-800 px-4 py-4 my-8 bg-white border border-gray-300 rounded"
  >
    <div>
      <div></div>
      <p
        class="text-3xl font-semibold text-center text-gray-800 dark:text-gray-300"
      >
        {{ count }}
      </p>
      <p class="text-lg text-center text-gray-500 dark:text-gray-300">
        {{ title }}
      </p>
    </div>
  </div>
</template>


<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator";
@Component
export default class AnalyticsCounter extends Vue {
  @Prop() title: string;
  @Prop() url: string;
  count: number = 0;

  async mounted() {
    this.count = (await this.$http.$get(this.url)).count;
  }
}
</script>