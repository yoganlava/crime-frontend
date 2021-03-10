<template>
  <div class="mt-10 text-left pl-16 divide-x-2 grid grid-cols-2">
    <div class="px-6">
      <h1
        class="text-2xl font-bold leading-7 lg:text-6xl sm:text-4xl md:text-5xl text-gray-900"
      >
        London
      </h1>
      <p class="pt-4">Amount of crimes in the last 12 months: <b>81723</b></p>
    </div>
    <div class="px-6">
      <h1
        class="text-2xl font-bold leading-7 lg:text-6xl sm:text-4xl md:text-5xl text-gray-900"
      >
        Crime list
      </h1>
      <div
        v-for="(name, i) in ['All Crime', 'Anti Social Behaviour', 'Bicycle Theft', 'Burglary', 'Criminal Damage Arson', 'Drugs', 'Other Theft', 'Possession Of Weapons', 'Public Order', 'Robbery', 'Shoplifting', 'Theft From The Person', 'Vehicle Crime', 'Violent Crime', 'Other Crime']"
        :key="i"
      >
        <crime-percentage-bar
          :percentage="Math.floor(Math.random() * 101)"
          :name="name"
        ></crime-percentage-bar>
      </div>
    </div>  
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";
@Component({
  components: {
    CrimePercentageBar: () => import("~/components/CrimePercentageBar.vue")
  }
})
export default class CrimeAnalysis extends Vue {}
</script>
