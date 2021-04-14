<template>
  <div class="mt-10 text-left pl-16 divide-x-2 grid grid-cols-2">
    <div class="px-6" v-if="!loading">
      <h1
        class="text-2xl font-bold leading-7 lg:text-6xl sm:text-4xl md:text-5xl text-gray-900"
      >
        {{cityName}}
      </h1>
      <p class="pt-4">Amount of crimes in the last 12 months: <b>81723</b></p>
      <line-chart :data="{ labels: Array.from(months), datasets }" />
    </div>
    <div v-if="!loading" class="px-6">
      <h1
        class="text-2xl font-bold leading-7 lg:text-6xl sm:text-4xl md:text-5xl text-gray-900"
      >
        Crime list
      </h1>
      <div
        v-for="(name, i) in [
          'All Crime',
          'Anti Social Behaviour',
          'Bicycle Theft',
          'Burglary',
          'Criminal Damage Arson',
          'Drugs',
          'Other Theft',
          'Possession Of Weapons',
          'Public Order',
          'Robbery',
          'Shoplifting',
          'Theft From The Person',
          'Vehicle Crime',
          'Violent Crime',
          'Other Crime'
        ]"
        :key="i"
      >
        <crime-percentage-bar
          :percentage="Math.floor(Math.random() * 101)"
          :name="name"
        ></crime-percentage-bar>
      </div>
    </div>
    <bar-chart-loader v-else></bar-chart-loader>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";

interface Crime {
  id: number;
  location_id: number;
  name: string;
  value: number;
  created_at: string;
  updated_at: string;
  month: string;
}

@Component
export default class CrimeAnalysis extends Vue {
  months: Set<string> = new Set();
  datasets = [];
  loading: boolean = true;
  cityName: string;

  async mounted() {
    this.$root.$on("searchCityStatistics", this.searchCityStatistics);
    await this.searchCityStatistics("Reading");
  }

  async searchCityStatistics(cityName: string) {
    this.loading = true;
    this.cityName = cityName;
    this.datasets = [];
    this.months = new Set();
    let crimesList: Crime[] = (
      await this.$http.$get("/api/statistics/city?name=" + cityName)
    ).reverse();
    let crimeNames: Set<string> = new Set();

    crimesList.forEach(crime => {
      this.months.add(crime.month);
      crimeNames.add(crime.name);
    });

    crimeNames.forEach(name => {
      let r = Math.floor(Math.random() * 256),
        g = Math.floor(Math.random() * 256),
        b = Math.floor(Math.random() * 256);
      this.datasets.push({
        label: name,
        borderColor: `rgb(${r},${g},${b})`,
        backgroundColor: `rgba(${r},${g},${b}, 0.1)`,
        data: crimesList
          .filter(crime => crime.name == name)
          .map(crime => crime.value)
      });
    });

    this.loading = false;
  }
}
</script>
