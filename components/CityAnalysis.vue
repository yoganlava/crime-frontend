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
          :name="
            data.label
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
          "
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
    // Set up listener
    this.$root.$on("searchCityStatistics", this.searchCityStatistics);
    // Search analytics for default cities
    await this.searchCityStatistics(this.default);
  }

  /**
   * Searches statistics on a given city name
   * @param {string} cityName
   */
  async searchCityStatistics(cityName: string) {
    // show loading bar
    this.state = LoadingState.LOADING;
    this.cityName = cityName;
    this.datasets = [];
    this.months = new Set();
    // get list of crimes in city
    let crimesList: Crime[] = await this.$http.$get(
      "/api/statistics/city?name=" + cityName
    );
    // if api returns error instead of list
    // show the error
    if ((crimesList as any).error) {
      this.state = LoadingState.ERROR;
      this.errorMessage = (crimesList as any).error;
      return;
    }
    // reverse array so its oldest to newest when
    // shown on the graph
    crimesList = crimesList.reverse();
    // create set to make crime names unique
    let crimeNames: Set<string> = new Set();
    // if array is empty
    // show an error
    if (crimesList.length == 0) {
      this.state = LoadingState.ERROR;
      this.errorMessage =
        "No data available, please try again in a few minutes";
      return;
    }

    // add the crimes month and name into the
    // months and names array
    crimesList.forEach((crime) => {
      this.months.add(crime.month);
      crimeNames.add(crime.name);
    });
    // for each crime type, add them to the bar chart dataset
    // Make sure to make random colours for each type aswell
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
    // Remove loading animation
    this.state = LoadingState.COMPLETE;
  }

  /**
   * Tallies up the crimes and returns the total number of crimes
   * @returns {Number}
   */
  totalCrimeCount() {
    return this.datasets.reduce((_, curr) => {
      return _ + curr.data.reduce((a, b) => a + b, 0);
    }, 0);
  }
}
</script>
