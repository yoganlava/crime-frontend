<template>
  <div
    class="mt-10 text-left pl-0 mx-auto"
    :class="{ 'divide-x-2 grid grid-cols-1 sm:grid-cols-2': state !== 'error' }"
  >
    <div class="px-6" v-if="state == 'complete'">
      <h1
        class="text-2xl font-bold leading-7 lg:text-6xl sm:text-4xl md:text-5xl text-gray-900 dark:text-gray-300"
      >
        {{ cityName }}
      </h1>
      <!-- TODO Make last {{ X }} months more robust -->
      <p class="pt-4">
        Amount of crimes in the last {{ datasets[0].data.length }} months:
        <b>{{ totalCrimeCount() }}</b>
      </p>
      <line-chart :data="{ labels: Array.from(months), datasets }" />
    </div>
    <div v-if="state == 'complete'" class="px-6">
      <h1
        class="text-2xl font-bold leading-7 lg:text-6xl sm:text-4xl md:text-5xl text-gray-900 dark:text-gray-300"
      >
        Crime list
      </h1>
      <div v-for="(data, i) in datasets" :key="i">
        <crime-percentage-bar
          :current="data.data.reduce((a, b) => a + b, 0)"
          :total="totalCrimeCount()"
          :name="data.label"
        ></crime-percentage-bar>
      </div>
    </div>
    <bar-chart-loader v-if="state == 'loading'"></bar-chart-loader>
    <div class="flex justify-center dark:text-gray-300" v-if="state == 'error'">
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator";

interface Crime {
  id: number;
  location_id: number;
  name: string;
  value: number;
  created_at: string;
  updated_at: string;
  month: string;
}

enum LoadingState {
  LOADING = "loading",
  COMPLETE = "complete",
  ERROR = "error",
}

@Component
export default class CrimeAnalysis extends Vue {
  @Prop() default: string;
  months: Set<string> = new Set();
  datasets = [];
  state: LoadingState = LoadingState.LOADING;
  cityName: string;
  errorMessage: string = "";

  async mounted() {
    this.$root.$on("searchCityStatistics", this.searchCityStatistics);
    await this.searchCityStatistics(this.default);
  }

  async searchCityStatistics(cityName: string) {
    // this.loading = true;
    this.state = LoadingState.LOADING;
    this.cityName = cityName;
    this.datasets = [];
    this.months = new Set();
    let crimesList: Crime[] = await this.$http.$get(
      "/api/statistics/city?name=" + cityName
    );

    if ((crimesList as any).error) {
      this.state = LoadingState.ERROR;
      this.errorMessage = (crimesList as any).error;
      return;
    }

    crimesList = crimesList.reverse();

    let crimeNames: Set<string> = new Set();

    if (crimesList.length == 0) {
      this.state = LoadingState.ERROR;
      this.errorMessage =
        "No data available, please try again in a few minutes";
      return;
    }

    crimesList.forEach((crime) => {
      this.months.add(crime.month);
      crimeNames.add(crime.name);
    });

    crimeNames.forEach((name) => {
      let r = Math.floor(Math.random() * 256),
        g = Math.floor(Math.random() * 256),
        b = Math.floor(Math.random() * 256);
      this.datasets.push({
        label: name,
        borderColor: `rgb(${r},${g},${b})`,
        backgroundColor: `rgba(${r},${g},${b}, 0.1)`,
        data: crimesList
          .filter((crime) => crime.name == name)
          .map((crime) => crime.value),
      });
    });

    this.state = LoadingState.COMPLETE;
  }

  totalCrimeCount() {
    return this.datasets.reduce((_, curr) => {
      return _ + curr.data.reduce((a, b) => a + b, 0);
    }, 0);
  }
}
</script>
