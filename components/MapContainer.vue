<template>
  <div class="map-container">
      <h1>MAP HERE</h1>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";
@Component
export default class MapContainer extends Vue {}
</script>

<style>
.map-container {
    z-index: -1;
    flex-basis: 100%;
    margin-left: 10%;
    margin-right: 10%;
    background-color: green;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height:400px;
}
</style>