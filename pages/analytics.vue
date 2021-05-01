<template>
  <div>
    <div class="flex justify-center flex-wrap">
      <analytics-counter
        :title="'Daily Searches'"
        :url="'/api/statistics/get_search_count'"
      ></analytics-counter>
      <div class="break"></div>
      <h1
        class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate dark:text-gray-300"
      >
        Analyse a City
      </h1>
      <div class="break"></div>
      <div class="pt-6 relative">
        <auto-complete-search
          class="pt-2 relative mx-auto text-gray-600"
          :onClick="searchCity"
        ></auto-complete-search>
      </div>
    </div>
    <city-analysis v-if="this.default" :default="this.default"></city-analysis>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";
import { ipData } from "~/store";
@Component
export default class Analytics extends Vue {
  ip: string = "";
  default: string = "";

  async asyncData({ req }) {
    if (req == undefined) return;
    return {
      ip: req.headers["x-forwarded-for"]
        ? req.headers["x-forwarded-for"]
        : "8.8.8.8",
    };
  }

  async created() {
    await this.$http.$get("/api/statistics/log_visit");
    if (Object.keys(ipData.data).length == 0)
      await ipData.setData(await this.$http.$get(`/external/ip/${this.ip}`));
    this.default = ipData.data.city;
  }

  searchCity(address) {
    this.$root.$emit("searchCityStatistics", address);
  }
}
</script>

<style>
.break {
  flex-basis: 100%;
  height: 0;
}
</style>
