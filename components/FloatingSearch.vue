<template>
  <div class="pt-2 relative mx-auto text-gray-600 search-container">
    <auto-complete-search :onClick="search"></auto-complete-search>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";

@Component
export default class FloatingSearch extends Vue {
  // Get geo location of specified query and emit goToAddress message
  async search(address) {
    let geocode = await this.$http.$get(
      `/api/geocode/forward?q=${address.replaceAll(" ", "+")}`
    );
    if (geocode.error) {
      this.$toast.show({
        type: "danger",
        title: "Error",
        message: geocode.error,
      });
      return;
    }
    geocode = geocode[0];
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

@media only screen and (min-width: 640px) {
  .search-container {
    top: 110px !important;
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
