<template>
  <div class="pt-2 relative mx-auto text-gray-600 search-container">
    <input
      v-model="address"
      v-on:keyup.enter="search"
      class="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
      type="search"
      placeholder="Search address"
    />
    <button
      type="submit"
      class="absolute right-0 top-0 mt-5 mr-4"
      @click="search"
    >
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
</template>

<script lang="ts">
import { Vue, Component, Emit } from "nuxt-property-decorator";

@Component
export default class FloatingSearch extends Vue {
  address: string = "";
  // Get geo location of specified query and emit goToAddress message
  async search() {
    let geocode = await this.$http.$get(
      `https://geocode.xyz/${this.address.replaceAll(" ", "+")}?json=1`
    );
    this.$root.$emit("goToAddress", [geocode.latt, geocode.longt]);
  }
}
</script>

<style scoped>
.search-container {
  z-index: 1;
  position: absolute;
  left: 50%;
  top: 15%;
  transform: translate(-50%, -50%);
  opacity: 0.7;
  transition: ease-in 0.25s;
}

.search-container:hover {
  opacity: 1;
  transition: ease-in 0.25s;
}
</style>
