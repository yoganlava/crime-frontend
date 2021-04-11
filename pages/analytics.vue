<template>
  <div>
    <div class="flex justify-center mt-16 flex-wrap">
      <h1
        class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
      >
        Analyse a City
      </h1>
      <div class="break"></div>
      <div class="pt-6 relative">
        <div class="pt-2 relative text-gray-600">
          <input
            class="border-2 border-gray-300 bg-white h-10 px-5 pr-64 rounded-lg text-sm focus:outline-none"
            type="search"
            placeholder="Search City"
          />
          <button type="submit" class="absolute right-0 top-0 mt-5 mr-4">
            <svg
              class="text-gray-600 h-4 w-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              version="1.1"
              id="Capa_1"
              x="0px"
              y="0px"
              viewBox="0 0 16 16"
              style="enable-background:new 0 0 16 16;"
              xml:space="preserve"
            >
              <path
                fill-rule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <city-analysis></city-analysis>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";
@Component
export default class Analytics extends Vue {}
</script>

<style>
.break {
  flex-basis: 100%;
  height: 0;
}
</style>
