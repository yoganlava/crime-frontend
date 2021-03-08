<template>
  <div class="map-container">
    <!-- <h1>MAP HERE</h1> -->
    <no-ssr>
      <l-map ref="map" :zoom="13" :center="[55.9464418, 8.1277591]">
        <l-tile-layer
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        ></l-tile-layer>
      </l-map>
    </no-ssr>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator";

interface LMap extends Element {
  mapObject: L.Map;
}

@Component
export default class MapContainer extends Vue {
  @Prop() ip: string

  $refs!: {
    map: LMap;
  };

  async mounted() {
    let geoInfo = await this.$http.$get(`/external/ip/${this.ip}`);
    this.panMapTo([geoInfo.lat, geoInfo.lon]);
    this.addMarker([geoInfo.lat, geoInfo.lon]);
  }

  panMapTo(coords) {
    this.$refs.map.mapObject.panTo(coords);
  }

  addMarker(coords) {
    this.$L.marker(coords).addTo(this.$refs.map.mapObject);
  }

  enableEditMode() {}

  disableEditMode() {}
}
</script>

<style>
.map-container {
  z-index: 0;
  flex-basis: 100%;
  margin-left: 10%;
  margin-right: 10%;
  background-color: green;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
