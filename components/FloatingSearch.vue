<template>
  <div class="pt-2 relative mx-auto text-gray-600 search-container">
    <auto-complete-search :onClick="search"></auto-complete-search>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";

@Component
export default class FloatingSearch extends Vue {
  /**
   * Get geo location of specified address and emit goToAddress message
   * @param {string} address
   */
  async search(address: string) {
    // Get latitude and longitude of the address from the api
    let geocode = await this.$http.$get(
      `/api/geocode/forward?q=${address.replaceAll(" ", "+")}`
    );
    // if there is an error
    // toast the error
    if (geocode.error) {
      this.$toast.show({
        type: "danger",
        title: "Error",
        message: geocode.error,
      });
      return;
    }
    geocode = geocode[0];
    // emit the goToAddress
    this.$root.$emit("goToAddress", [geocode.center[1], geocode.center[0]]);
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

@media only screen and (max-width: 640px) {
  .search-container {
    top: 125px;
  }
}

.search-container:hover {
  opacity: 1;
  transition: ease-in 0.25s;
}

.mh-48 {
  max-height: 10rem;
}
</style>
